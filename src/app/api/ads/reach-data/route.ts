import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { normalizeUrl } from '@/utils/urlUtils';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs are required' }, { status: 400 });
    }

    // Clean URLs using proper normalization
    const cleanUrls = urls.map((url: string) => normalizeUrl(url));

    const results = [];

    for (const cleanUrl of cleanUrls) {
      try {
        // First try exact match with Prisma raw query for complex aggregation
        const result = await prisma.$queryRaw`
          WITH base AS (
            SELECT
              _id,
              created_at::date AS day,
              eu_total_reach,
              snapshot_link_url
            FROM ads
            WHERE snapshot_link_url LIKE '%' || ${cleanUrl} || '%'
              AND created_at IS NOT NULL
              AND eu_total_reach IS NOT NULL
          ),
          daily_snapshots AS (
            SELECT
              _id,
              day,
              MAX(eu_total_reach) AS eu_total_reach,
              snapshot_link_url
            FROM base
            GROUP BY _id, day, snapshot_link_url
          ),
          ad_series AS (
            SELECT
              _id,
              generate_series(MIN(day), current_date, '1 day') AS day,
              snapshot_link_url
            FROM daily_snapshots
            GROUP BY _id, snapshot_link_url
          ),
          ad_daily AS (
            SELECT
              s._id,
              s.day,
              ds.eu_total_reach,
              s.snapshot_link_url
            FROM ad_series s
            LEFT JOIN daily_snapshots ds ON s._id = ds._id AND s.day = ds.day
          ),
          ad_daily_filled AS (
            SELECT
              _id,
              day,
              MAX(eu_total_reach) OVER (
                PARTITION BY _id
                ORDER BY day
                ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
              ) AS eu_total_reach_filled,
              snapshot_link_url
            FROM ad_daily
          )
          SELECT
            to_char(day, 'YYYY-MM-DD') AS date,
            SUM(eu_total_reach_filled) AS total_reach,
            COUNT(DISTINCT _id) AS ad_count
          FROM ad_daily_filled
          GROUP BY day
          ORDER BY day
        `;

        results.push({
          url: cleanUrl,
          originalUrl: urls[cleanUrls.indexOf(cleanUrl)],
          data: Array.isArray(result)
            ? result.map((row) => ({
                date: (row as { date: string }).date,
                reach: parseInt((row as { total_reach: string }).total_reach) || 0,
                adCount: parseInt((row as { ad_count: string }).ad_count) || 0,
              }))
            : [],
        });
      } catch (queryError) {
        console.error(`Query failed for URL ${cleanUrl}:`, queryError);
        // Add empty result for failed query
        results.push({
          url: cleanUrl,
          originalUrl: urls[cleanUrls.indexOf(cleanUrl)],
          data: [],
        });
      }
    }

    return NextResponse.json({
      success: true,
      results: results,
    });
  } catch (error) {
    console.error('Error fetching reach data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: error && typeof error === 'object' && 'code' in error ? error.code : undefined,
      detail: error && typeof error === 'object' && 'detail' in error ? error.detail : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : 'Unknown error'
            : undefined,
      },
      { status: 500 },
    );
  }
}
