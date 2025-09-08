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

    // Build where clause for searches
    type SearchWhereClause = {
      userId: string;
      createdAt?: { gte: Date };
      urlAnalyses?: {
        some: {
          url: { contains: string; mode: 'insensitive' };
        };
      };
    };

    const searchWhereClause: SearchWhereClause = {
      userId: user.id,
    };

    // Add search filter - search within URLs of the search
    if (search) {
      searchWhereClause.urlAnalyses = {
        some: {
          url: {
            contains: search,
            mode: 'insensitive',
          },
        },
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

      searchWhereClause.createdAt = {
        gte: dateFrom,
      };
    }

    // Hybrid approach: Fetch both Search records (new) and standalone UrlAnalysis records (old)
    // First get Search records
    const dbSearches = await prisma.search.findMany({
      where: searchWhereClause,
      include: {
        urlAnalyses: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Also get UrlAnalysis records that don't belong to any search (legacy data)
    const legacyAnalyses = await prisma.urlAnalysis.findMany({
      where: {
        userId: user.id,
        searchId: null, // Only get analyses not linked to a search
        ...(search && {
          url: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }),
        ...(timeFilter !== 'all' &&
          searchWhereClause.createdAt && {
            createdAt: searchWhereClause.createdAt,
          }),
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Combine and paginate
    const allItems = [
      ...dbSearches.map((s) => ({ type: 'search' as const, data: s, date: s.updatedAt })),
      ...legacyAnalyses.map((a) => ({ type: 'analysis' as const, data: a, date: a.updatedAt })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    const paginatedItems = allItems.slice(skip, skip + limit);
    const totalUniqueCount = allItems.length;

    console.log('🔍 Database results found:', {
      totalCount: totalUniqueCount,
      searches: dbSearches.length,
      legacyAnalyses: legacyAnalyses.length,
      userEmail: user.email,
    });

    // Convert both Search records and legacy UrlAnalysis records to history format
    const validAnalyses = paginatedItems.map((item) => {
      if (item.type === 'search') {
        const search = item.data;
        const primaryUrl = search.urlAnalyses[0]?.url || '';
        const primaryAnalysis = search.urlAnalyses[0];

        return {
          id: search.id,
          url: primaryUrl,
          urls: search.urlAnalyses.map((a) => a.url),
          status: search.status,
          createdAt: search.createdAt,
          updatedAt: search.updatedAt,
          userId: user.id,
          results: primaryAnalysis?.results || {},
          isBatchAnalysis: search.urlCount > 1,
          batchSize: search.urlCount,
          totalReach: search.totalReach,
        };
      } else {
        // Legacy UrlAnalysis record
        const analysis = item.data;
        return {
          id: generateAnalysisId(analysis.url), // Use URL-based ID for legacy
          url: analysis.url,
          urls: [analysis.url],
          status: analysis.status,
          createdAt: analysis.createdAt,
          updatedAt: analysis.updatedAt,
          userId: user.id,
          results: analysis.results || {},
          isBatchAnalysis: false,
          batchSize: 1,
          totalReach: 0, // Will be filled in next step
        };
      }
    });

    // Use saved analysis results from database (no live queries)
    const analysesWithReach = validAnalyses.map((searchItem) => {
      // Get saved results from the primary analysis record
      const results = searchItem.results as Record<string, unknown>;
      const totalReach = searchItem.totalReach || 0;

      if (results && typeof results === 'object') {
        // Use saved data from the primary analysis
        return {
          id: searchItem.id, // Search ID
          url: searchItem.url, // Primary URL
          urls: searchItem.urls, // All URLs in this search
          status: searchItem.status,
          createdAt: searchItem.createdAt,
          updatedAt: searchItem.updatedAt,
          totalReach: totalReach,
          adCount: typeof results.adCount === 'number' ? results.adCount : 0,
          avgReachPerDay: typeof results.avgReachPerDay === 'number' ? results.avgReachPerDay : 0,
          totalDays: typeof results.totalDays === 'number' ? results.totalDays : 0,
          firstDay: typeof results.firstDay === 'string' ? results.firstDay : null,
          lastDay: typeof results.lastDay === 'string' ? results.lastDay : null,
          reachCategory: typeof results.reachCategory === 'string' ? results.reachCategory : 'low',
          reachColor: typeof results.reachColor === 'string' ? results.reachColor : 'text-gray-500',
          chartData: Array.isArray(results.chartData) ? results.chartData : [], // Include saved chart data
          isBatchAnalysis: searchItem.isBatchAnalysis,
          batchSize: searchItem.batchSize,
        };
      } else {
        // Fallback for searches without saved results (shouldn't happen with new system)
        return {
          id: searchItem.id,
          url: searchItem.url,
          urls: searchItem.urls,
          status: searchItem.status,
          createdAt: searchItem.createdAt,
          updatedAt: searchItem.updatedAt,
          totalReach: totalReach,
          adCount: 0,
          avgReachPerDay: 0,
          totalDays: 0,
          firstDay: null,
          lastDay: null,
          reachCategory: 'low',
          reachColor: 'text-gray-500',
          chartData: [],
          isBatchAnalysis: searchItem.isBatchAnalysis,
          batchSize: searchItem.batchSize,
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
