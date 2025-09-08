import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { getTotalReachForUrl } from '@/utils/serverReachUtils';
import { getReachCategory } from '@/utils/reachUtils';

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

    // Get search statistics by counting URL analyses grouped by URL
    const urlStats = await prisma.urlAnalysis.groupBy({
      by: ['url'],
      _count: {
        url: true,
      },
      orderBy: {
        _count: {
          url: 'desc',
        },
      },
    });

    // Get additional data for each URL (reach data, categories, latest analysis date)
    const enrichedStats = await Promise.all(
      urlStats.map(async (stat) => {
        // Get latest analysis for this URL to get status and results
        const latestAnalysis = await prisma.urlAnalysis.findFirst({
          where: { url: stat.url },
          orderBy: { updatedAt: 'desc' },
          include: { user: true },
        });

        // Get real reach data
        const totalReach = await getTotalReachForUrl(stat.url);
        const { category: reachCategory, color: reachColor } = getReachCategory(totalReach);

        // Get first and latest analysis dates
        const [firstAnalysis, users] = await Promise.all([
          prisma.urlAnalysis.findFirst({
            where: { url: stat.url },
            orderBy: { createdAt: 'asc' },
          }),
          // Get unique users who analyzed this URL
          prisma.urlAnalysis.findMany({
            where: { url: stat.url },
            select: { user: { select: { id: true, email: true } } },
            distinct: ['userId'],
          }),
        ]);

        return {
          url: stat.url,
          searchCount: stat._count.url,
          totalReach,
          reachCategory,
          reachColor,
          status: latestAnalysis?.status || 'unknown',
          firstAnalyzedAt: firstAnalysis?.createdAt || null,
          lastAnalyzedAt: latestAnalysis?.updatedAt || null,
          uniqueUsers: users.length,
          userEmails: users.slice(0, 3).map((u) => u.user.email), // Show first 3 user emails
        };
      }),
    );

    // Get summary statistics
    const totalSearches = urlStats.reduce((sum, stat) => sum + stat._count.url, 0);
    const uniqueUrls = urlStats.length;
    const urlsWithData = enrichedStats.filter((stat) => stat.totalReach > 0).length;
    const urlsWithoutData = enrichedStats.filter((stat) => stat.totalReach === 0).length;

    return NextResponse.json({
      success: true,
      data: enrichedStats,
      summary: {
        totalSearches,
        uniqueUrls,
        urlsWithData,
        urlsWithoutData,
        averageSearchesPerUrl:
          uniqueUrls > 0 ? Math.round((totalSearches / uniqueUrls) * 100) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('Search statistics error:', error);
    return NextResponse.json({ error: 'Failed to fetch search statistics' }, { status: 500 });
  }
}
