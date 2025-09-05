import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const { Pool } = pg;
const prisma = new PrismaClient();

// Database connection for ads data
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes('ssl=true') || process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
          ca: undefined,
        }
      : false,
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const timeFilter = searchParams.get('timeFilter') || 'all';
    const reachFilter = searchParams.get('reachFilter') || 'all';

    const skip = (page - 1) * limit;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build where clause
    type WhereClause = {
      userId: string;
      url?: { contains: string; mode: 'insensitive' };
      createdAt?: { gte: Date };
    };

    const whereClause: WhereClause = {
      userId: user.id,
    };

    // Add search filter
    if (search) {
      whereClause.url = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Add time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      let dateFrom: Date;

      switch (timeFilter) {
        case 'last7days':
          dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'last30days':
          dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'last3months':
          dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFrom = new Date(0);
      }

      whereClause.createdAt = {
        gte: dateFrom,
      };
    }

    // Get the analyses with pagination
    const [analyses, totalCount] = await Promise.all([
      prisma.urlAnalysis.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.urlAnalysis.count({
        where: whereClause,
      }),
    ]);

    // Get reach data for each URL from ads database
    const analysesWithReach = await Promise.all(
      analyses.map(async (analysis) => {
        try {
          // Clean URL to match database format
          let cleanUrl = analysis.url.trim();
          cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
          cleanUrl = cleanUrl.replace(/^www\./, '');

          // Query ads database for reach data using forward-filling logic
          // Get the latest total reach with forward-filled values
          const reachQuery = `
            WITH base AS (
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
              SELECT
                id,
                day,
                MAX(eu_total_reach) AS eu_total_reach,
                snapshot_link_url
              FROM base
              GROUP BY id, day, snapshot_link_url
            ),
            ad_series AS (
              SELECT
                id,
                generate_series(MIN(day), current_date, '1 day') AS day,
                snapshot_link_url
              FROM daily_snapshots
              GROUP BY id, snapshot_link_url
            ),
            ad_daily AS (
              SELECT
                s.id,
                s.day,
                ds.eu_total_reach,
                s.snapshot_link_url
              FROM ad_series s
              LEFT JOIN daily_snapshots ds ON s.id = ds.id AND s.day = ds.day
            ),
            ad_daily_filled AS (
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
              SUM(eu_total_reach_filled) AS total_reach,
              COUNT(DISTINCT id) AS ad_count
            FROM ad_daily_filled
            WHERE day = current_date
          `;

          // Try exact match first
          let result = await pool.query(reachQuery, [cleanUrl]);

          // If no exact match found, try with common variations
          if (!result.rows[0]?.total_reach) {
            const variations = [
              `https://${cleanUrl}`,
              `http://${cleanUrl}`,
              `https://www.${cleanUrl}`,
              `http://www.${cleanUrl}`,
            ];

            for (const variation of variations) {
              result = await pool.query(reachQuery, [variation]);
              if (result.rows[0]?.total_reach) break;
            }
          }

          const totalReach = parseInt(result.rows[0]?.total_reach) || 0;
          const adCount = parseInt(result.rows[0]?.ad_count) || 0;

          // Calculate reach category
          let reachCategory = 'low';
          let reachColor = 'text-red-600 dark:text-red-400';

          if (totalReach >= 10000) {
            reachCategory = 'high';
            reachColor = 'text-green-600 dark:text-green-400';
          } else if (totalReach >= 5000) {
            reachCategory = 'medium';
            reachColor = 'text-orange-600 dark:text-orange-400';
          }

          return {
            id: analysis.id,
            url: analysis.url,
            status: analysis.status,
            createdAt: analysis.createdAt,
            totalReach,
            adCount,
            reachCategory,
            reachColor,
          };
        } catch (error) {
          console.error(`Error fetching reach for ${analysis.url}:`, error);
          return {
            id: analysis.id,
            url: analysis.url,
            status: analysis.status,
            createdAt: analysis.createdAt,
            totalReach: 0,
            adCount: 0,
            reachCategory: 'low',
            reachColor: 'text-red-600 dark:text-red-400',
          };
        }
      }),
    );

    // Apply reach filter
    let filteredAnalyses = analysesWithReach;
    if (reachFilter !== 'all') {
      filteredAnalyses = analysesWithReach.filter((analysis) => {
        switch (reachFilter) {
          case 'high':
            return analysis.totalReach >= 10000;
          case 'medium':
            return analysis.totalReach >= 5000 && analysis.totalReach < 10000;
          case 'low':
            return analysis.totalReach < 5000;
          default:
            return true;
        }
      });
    }

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: filteredAnalyses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
