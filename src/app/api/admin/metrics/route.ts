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
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get metrics in parallel
    const [
      totalUsers,
      activeSubscriptions,
      totalUrlAnalyses,
      recentUsers,
      totalRevenue
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Active subscriptions
      prisma.subscription.count({
        where: {
          status: 'active'
        }
      }),
      
      // Total URL analyses
      prisma.urlAnalysis.count(),
      
      // Users created in last 30 days
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Mock revenue calculation (in real app, calculate from Stripe data)
      prisma.subscription.count({
        where: {
          status: { in: ['active', 'trialing'] }
        }
      }).then(count => count * 29) // Assuming $29/month average
    ]);

    // Calculate growth percentages (mock data for now)
    const userGrowth = Math.floor(Math.random() * 20) + 5; // 5-25%
    const revenueGrowth = Math.floor(Math.random() * 15) + 10; // 10-25%
    const analysesGrowth = Math.floor(Math.random() * 30) + 10; // 10-40%

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      totalUrlAnalyses,
      recentUsers,
      totalRevenue,
      growth: {
        users: userGrowth,
        revenue: revenueGrowth,
        analyses: analysesGrowth
      }
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin metrics' },
      { status: 500 }
    );
  }
}