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

    // Get comprehensive database overview
    const [
      totalUsers,
      usersLast7Days,
      usersLast30Days,
      totalSubscriptions,
      activeSubscriptions,
      trialingSubscriptions,
      totalUrlAnalyses,
      urlAnalysesLast7Days,
      urlAnalysesLast30Days,
      uniqueUrlsAnalyzed,
      topUsers,
      recentUsers,
      subscriptionBreakdown,
      searchPatterns,
      userActivity,
    ] = await Promise.all([
      // User metrics
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Subscription metrics
      prisma.subscription.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.subscription.count({ where: { status: 'trialing' } }),

      // URL Analysis metrics
      prisma.urlAnalysis.count(),
      prisma.urlAnalysis.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      prisma.urlAnalysis.count({
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      }),

      // Unique URLs
      prisma.urlAnalysis
        .findMany({
          select: { url: true },
          distinct: ['url'],
        })
        .then((urls) => urls.length),

      // Top users by analysis count
      prisma.urlAnalysis
        .groupBy({
          by: ['userId'],
          _count: { userId: true },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        })
        .then(async (results) => {
          return Promise.all(
            results.map(async (item) => {
              const user = await prisma.user.findUnique({
                where: { id: item.userId },
                select: { email: true, name: true, createdAt: true },
              });
              return {
                ...user,
                analysisCount: item._count.userId,
              };
            }),
          );
        }),

      // Recent users
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          subscriptions: { take: 1, orderBy: { createdAt: 'desc' } },
          urlAnalyses: { select: { id: true } },
        },
      }),

      // Subscription breakdown by plan
      prisma.subscription.groupBy({
        by: ['priceId'],
        _count: { priceId: true },
        where: { status: { in: ['active', 'trialing'] } },
      }),

      // Search patterns - most analyzed URLs
      prisma.urlAnalysis.groupBy({
        by: ['url'],
        _count: { url: true },
        orderBy: { _count: { url: 'desc' } },
        take: 20,
      }),

      // User activity patterns - analyses per day for last 30 days
      prisma.urlAnalysis
        .findMany({
          where: {
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          },
          select: { createdAt: true },
        })
        .then((analyses) => {
          const dailyCounts: Record<string, number> = {};
          analyses.forEach((analysis) => {
            const date = analysis.createdAt.toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
          });
          return dailyCounts;
        }),
    ]);

    // Calculate growth rates
    const userGrowthRate =
      usersLast30Days > 0 && totalUsers > usersLast30Days
        ? Math.round((usersLast30Days / (totalUsers - usersLast30Days)) * 100)
        : 0;

    const analysisGrowthRate =
      urlAnalysesLast30Days > 0 && totalUrlAnalyses > urlAnalysesLast30Days
        ? Math.round((urlAnalysesLast30Days / (totalUrlAnalyses - urlAnalysesLast30Days)) * 100)
        : 0;

    // Plan name mapping
    const planNames: Record<string, string> = {
      price_1S2Sa1BDgh9JKNMfPQca2Ozk: 'Bronze Monthly',
      price_1S2Sa1BDgh9JKNMffygQV6Qu: 'Bronze Annual',
      price_1S2Sa2BDgh9JKNMfXr6YEVMx: 'Silver Monthly',
      price_1S2Sa2BDgh9JKNMfYrkEyI8J: 'Silver Annual',
      price_1S2Sa3BDgh9JKNMfqNoy03Sg: 'Gold Monthly',
      price_1S2Sa3BDgh9JKNMfT37vxnVD: 'Gold Annual',
    };

    return NextResponse.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          last7Days: usersLast7Days,
          last30Days: usersLast30Days,
          growthRate: userGrowthRate,
        },
        subscriptions: {
          total: totalSubscriptions,
          active: activeSubscriptions,
          trialing: trialingSubscriptions,
          breakdown: subscriptionBreakdown.map((item) => ({
            plan: planNames[item.priceId] || item.priceId,
            count: item._count.priceId,
          })),
        },
        analyses: {
          total: totalUrlAnalyses,
          last7Days: urlAnalysesLast7Days,
          last30Days: urlAnalysesLast30Days,
          uniqueUrls: uniqueUrlsAnalyzed,
          growthRate: analysisGrowthRate,
          avgPerUser: totalUsers > 0 ? Math.round((totalUrlAnalyses / totalUsers) * 100) / 100 : 0,
        },
        topUsers: topUsers,
        recentUsers: recentUsers.map((user) => ({
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          subscriptionStatus: user.subscriptions[0]?.status || 'none',
          analysisCount: user.urlAnalyses.length,
        })),
        searchPatterns: searchPatterns.map((pattern) => ({
          url: pattern.url,
          searchCount: pattern._count.url,
        })),
        userActivity: userActivity,
      },
    });
  } catch (error) {
    console.error('Database overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch database overview' }, { status: 500 });
  }
}
