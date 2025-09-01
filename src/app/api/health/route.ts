import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connection by running a simple query
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || 'unknown',
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Health check failed:', errorMessage);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }, // Service Unavailable
    );
  }
}
