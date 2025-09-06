import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateAnalysisId } from '@/utils/reachUtils';
const prisma = new PrismaClient();

// Database connection for ads data
// const pool = new Pool({
//   connectionString:
//     process.env.DATABASE_URL +
//     (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL?.includes('sslmode')
//       ? '?sslmode=require'
//       : ''),
//   ssl: false, // Let the connection string handle SSL
// });

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

    // Fetch real URL analyses from database
    const dbAnalyses = await prisma.urlAnalysis.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' }, // Order by updatedAt so re-analyzed URLs appear at top
      skip,
      take: limit,
    });

    // Get total count for pagination
    const totalUniqueCount = await prisma.urlAnalysis.count({
      where: whereClause,
    });

    console.log('📊 Database analyses found:', {
      totalCount: totalUniqueCount,
      currentPage: dbAnalyses.length,
      userEmail: user.email,
    });

    // Convert database analyses to the expected format and deduplicate by URL
    const urlMap = new Map();

    // Process analyses in order (already sorted by updatedAt DESC)
    for (const analysis of dbAnalyses) {
      const url = analysis.url;

      // Only keep the first (most recent) entry for each URL
      if (!urlMap.has(url)) {
        urlMap.set(url, {
          id: generateAnalysisId(analysis.url),
          url: analysis.url,
          status: analysis.status,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          userId: user.id,
          results: analysis.results, // Include the results field with saved chart data
        });
      }
    }

    const validAnalyses = Array.from(urlMap.values());

    // Use saved analysis results from database (no live queries)
    const analysesWithReach = validAnalyses.map((analysis) => {
      // Get saved results from the analysis record
      const results = analysis.results as Record<string, unknown>;

      if (results && typeof results === 'object') {
        // Use saved data from the analysis
        return {
          id: analysis.id,
          url: analysis.url,
          status: analysis.status,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          totalReach: typeof results.totalReach === 'number' ? results.totalReach : 0,
          adCount: typeof results.adCount === 'number' ? results.adCount : 0,
          avgReachPerDay: typeof results.avgReachPerDay === 'number' ? results.avgReachPerDay : 0,
          totalDays: typeof results.totalDays === 'number' ? results.totalDays : 0,
          firstDay: typeof results.firstDay === 'string' ? results.firstDay : null,
          lastDay: typeof results.lastDay === 'string' ? results.lastDay : null,
          reachCategory: typeof results.reachCategory === 'string' ? results.reachCategory : 'low',
          reachColor: typeof results.reachColor === 'string' ? results.reachColor : 'text-gray-500',
          chartData: Array.isArray(results.chartData) ? results.chartData : [], // Include saved chart data
        };
      } else {
        // Fallback for analyses without saved results (shouldn't happen with new system)
        return {
          id: analysis.id,
          url: analysis.url,
          status: analysis.status,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          totalReach: 0,
          adCount: 0,
          avgReachPerDay: 0,
          totalDays: 0,
          firstDay: null,
          lastDay: null,
          reachCategory: 'low',
          reachColor: 'text-gray-500',
          chartData: [],
        };
      }
    });

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

    const totalPages = Math.ceil(totalUniqueCount / limit);

    return NextResponse.json({
      success: true,
      data: filteredAnalyses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount: totalUniqueCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
