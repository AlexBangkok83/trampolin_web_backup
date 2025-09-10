import pg from 'pg';

const { Pool } = pg;

// Database connection for ads data
// For DigitalOcean managed databases, we should use the proper SSL approach
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production' && process.env.DATABASE_CA_CERT
      ? {
          ca: process.env.DATABASE_CA_CERT,
          rejectUnauthorized: true,
        }
      : process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

/**
 * Get the ACTUAL total reach for a URL from the ads database
 * This queries the real Facebook ads data, not fake values
 * SERVER-SIDE ONLY - do not import in client components
 */
export async function getTotalReachForUrl(url: string): Promise<number> {
  try {
    console.log('🔍 getTotalReachForUrl - Querying for URL:', url);
    // Query the real ads database
    const result = await pool.query(
      `
      WITH base AS (
        SELECT
          _id,
          created_at::date AS day,
          eu_total_reach,
          snapshot_link_url
        FROM ads
        WHERE snapshot_link_url LIKE '%' || $1 || '%'
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
      )
      SELECT 
        COALESCE(MAX(eu_total_reach), 0) as total_reach
      FROM daily_snapshots
    `,
      [url],
    );

    const totalReach = parseInt(result.rows[0]?.total_reach || '0');

    console.log(
      '📊 getTotalReachForUrl - Result for URL:',
      url,
      'Total reach:',
      totalReach,
      'Rows found:',
      result.rows.length,
    );

    if (totalReach > 0) {
      return totalReach;
    }

    // If no data found, return 0 (don't generate fake numbers)
    return 0;
  } catch (error) {
    console.error('Error querying ads database for URL:', url, error);
    return 0;
  }
}

/**
 * Get historical reach data for analysis charts
 * SERVER-SIDE ONLY - do not import in client components
 */
export async function getHistoricalReachForAnalysis(
  url: string,
): Promise<Array<{ date: string; reach: number; adCount: number }>> {
  try {
    console.log('📈 getHistoricalReachForAnalysis - Querying for URL:', url);
    const result = await pool.query(
      `
      WITH base AS (
        SELECT
          _id,
          created_at::date AS day,
          eu_total_reach,
          snapshot_link_url
        FROM ads
        WHERE snapshot_link_url LIKE '%' || $1 || '%'
          AND created_at IS NOT NULL
          AND eu_total_reach IS NOT NULL
      ),
      daily_snapshots AS (
        SELECT
          day,
          MAX(eu_total_reach) AS max_reach,
          COUNT(*) as ad_count
        FROM base
        GROUP BY day
        ORDER BY day
      )
      SELECT 
        day::text as date,
        max_reach as reach,
        ad_count as ad_count
      FROM daily_snapshots
      ORDER BY day
    `,
      [url],
    );

    const historicalData = result.rows.map((row) => ({
      date: row.date,
      reach: parseInt(row.reach || '0'),
      adCount: parseInt(row.ad_count || '0'),
    }));

    console.log(
      '📈 getHistoricalReachForAnalysis - Result for URL:',
      url,
      'Data points:',
      historicalData.length,
    );
    return historicalData;
  } catch (error) {
    console.error('Error getting historical reach for URL:', url, error);
    return [];
  }
}
