import { NextResponse } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

const { Pool } = pg;

export async function GET() {
  try {
    // Test database connection for health check
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

    // Quick connection test
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: process.env.npm_package_version || '0.1.0',
        database: 'connected',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 },
    );
  }
}
