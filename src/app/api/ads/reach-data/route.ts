import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import pg from 'pg';

const { Pool } = pg;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? true : false,
});

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

    // Clean URLs to match database format (remove https://, http://, www.)
    const cleanUrls = urls.map((url: string) => {
      let cleaned = url.trim();
      // Remove protocol
      cleaned = cleaned.replace(/^https?:\/\//, '');
      // Remove www.
      cleaned = cleaned.replace(/^www\./, '');
      return cleaned;
    });

    const results = [];

    for (const cleanUrl of cleanUrls) {
      // Optimized query for 100M+ records
      // Uses exact match instead of ILIKE for better performance
      // Leverages existing indexes on snapshot_link_url and created_at
      const query = `
        WITH base AS (
          -- Base snapshots of ads of interest
          SELECT
            id,
            created_at::date AS day,
            eu_total_reach,
            snapshot_link_url
          FROM ads
          WHERE snapshot_link_url = $1
            AND created_at IS NOT NULL
            AND eu_total_reach IS NOT NULL
        ),
        daily_snapshots AS (
          -- For each ad and each day, get the maximum (latest) eu_total_reach
          SELECT
            id,
            day,
            MAX(eu_total_reach) AS eu_total_reach,
            snapshot_link_url
          FROM base
          GROUP BY id, day, snapshot_link_url
        ),
        ad_series AS (
          -- For each ad, generate a series of days from its first appearance to current_date
          SELECT
            id,
            generate_series(MIN(day), current_date, '1 day') AS day,
            snapshot_link_url
          FROM daily_snapshots
          GROUP BY id, snapshot_link_url
        ),
        ad_daily AS (
          -- Join the generated series with the snapshots so that missing days have NULL eu_total_reach
          SELECT
            s.id,
            s.day,
            ds.eu_total_reach,
            s.snapshot_link_url
          FROM ad_series s
          LEFT JOIN daily_snapshots ds ON s.id = ds.id AND s.day = ds.day
        ),
        ad_daily_filled AS (
          -- Fill forward the eu_total_reach using a window function.
          -- Since reach is always increasing, the running MAX returns the last known value.
          SELECT
            id,
            day,
            MAX(eu_total_reach) OVER (
              PARTITION BY id
              ORDER BY day
              ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
            ) AS eu_total_reach_filled,
            snapshot_link_url
          FROM ad_daily
        )
        SELECT
          to_char(day, 'YYYY-MM-DD') AS date,
          SUM(eu_total_reach_filled) AS total_reach,
          COUNT(DISTINCT id) AS ad_count
        FROM ad_daily_filled
        GROUP BY day
        ORDER BY day
      `;

      // Try exact match first
      let result = await pool.query(query, [cleanUrl]);

      // If no exact match found, try with common variations
      if (result.rows.length === 0) {
        const variations = [
          `https://${cleanUrl}`,
          `http://${cleanUrl}`,
          `https://www.${cleanUrl}`,
          `http://www.${cleanUrl}`,
        ];

        for (const variation of variations) {
          result = await pool.query(query, [variation]);
          if (result.rows.length > 0) break;
        }
      }

      // If still no results, use limited ILIKE search with date constraint
      if (result.rows.length === 0) {
        const constrainedQuery = `
          SELECT 
            created_at::date as date,
            SUM(max_reach) as total_reach,
            COUNT(*) as ad_count
          FROM (
            SELECT 
              created_at::date,
              id,
              MAX(eu_total_reach) as max_reach
            FROM ads 
            WHERE snapshot_link_url ILIKE $1
              AND created_at >= CURRENT_DATE - INTERVAL '90 days'
              AND eu_total_reach IS NOT NULL
            GROUP BY created_at::date, id
          ) daily_max
          GROUP BY created_at::date 
          ORDER BY created_at::date ASC
          LIMIT 1000
        `;
        result = await pool.query(constrainedQuery, [`%${cleanUrl}%`]);
      }

      results.push({
        url: cleanUrl,
        originalUrl: urls[cleanUrls.indexOf(cleanUrl)],
        data: result.rows.map((row) => ({
          date: row.date, // Already formatted as YYYY-MM-DD from to_char()
          reach: parseInt(row.total_reach) || 0,
          adCount: parseInt(row.ad_count) || 0,
        })),
      });
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
