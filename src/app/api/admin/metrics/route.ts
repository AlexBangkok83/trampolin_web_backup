import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get metrics in parallel
    const [totalUsers, activeSubscriptions, totalUrlAnalyses, recentUsers, totalRevenue] =
      await Promise.all([
        // Total users
        prisma.user.count(),

        // Active subscriptions
        prisma.subscription.count({
          where: {
            status: 'active',
          },
        }),

        // Total URL analyses
        prisma.urlAnalysis.count(),

        // Users created in last 30 days
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        }),

        // Mock revenue calculation (in real app, calculate from Stripe data)
        prisma.subscription
          .count({
            where: {
              status: { in: ['active', 'trialing'] },
            },
          })
          .then((count) => count * 29), // Assuming $29/month average
      ]);

    // Growth percentages - return 0 if no real growth data is available
    const userGrowth = 0; // NO DATA
    const revenueGrowth = 0; // NO DATA
    const analysesGrowth = 0; // NO DATA

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalUrlAnalyses,
      recentUsers,
      totalRevenue,
      growth: {
        users: userGrowth,
        revenue: revenueGrowth,
        analyses: analysesGrowth,
      },
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin metrics' }, { status: 500 });
  }
}
