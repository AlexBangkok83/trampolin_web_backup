import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Static response for health check in static export mode
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      version: process.env.npm_package_version || '0.1.0',
      mode: 'static-export',
    },
    { status: 200 },
  );
}
