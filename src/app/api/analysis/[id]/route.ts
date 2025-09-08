import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { generateAnalysisId } from '@/utils/reachUtils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id: analysisId } = await params;

    // Hybrid approach: Check both Search records (new) and UrlAnalysis records (legacy)
    // First, get all user's Search records
    const dbSearches = await prisma.search.findMany({
      where: {
        userId: user.id,
        status: 'completed',
      },
      include: {
        urlAnalyses: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Also get standalone UrlAnalysis records (legacy)
    const legacyAnalyses = await prisma.urlAnalysis.findMany({
      where: {
        userId: user.id,
        status: 'completed',
        searchId: null, // Only get analyses not linked to a search
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Find the analysis by matching the hash ID
    let matchingResults = null;
    let matchingUrl = null;
    let matchingDate = null;

    // Check Search records first (new system)
    for (const search of dbSearches) {
      for (const analysis of search.urlAnalyses) {
        const hashId = generateAnalysisId(analysis.url);
        if (hashId === analysisId) {
          // Use the matching analysis's results, or fall back to the matching analysis
          if (
            analysis.results &&
            Object.keys(analysis.results as Record<string, unknown>).length > 0
          ) {
            matchingResults = analysis.results as Record<string, unknown>;
          } else {
            // If the specific analysis doesn't have results, use the primary analysis from the search
            const primaryAnalysis = search.urlAnalyses[0];
            if (primaryAnalysis && primaryAnalysis.results) {
              matchingResults = primaryAnalysis.results as Record<string, unknown>;
            }
          }
          matchingUrl = analysis.url;
          matchingDate = search.updatedAt;
          break;
        }
      }
      if (matchingResults) break;
    }

    // If not found in Search records, check legacy UrlAnalysis records
    if (!matchingResults) {
      for (const analysis of legacyAnalyses) {
        const hashId = generateAnalysisId(analysis.url);
        if (hashId === analysisId) {
          matchingResults = analysis.results as Record<string, unknown>;
          matchingUrl = analysis.url;
          matchingDate = analysis.updatedAt;
          break;
        }
      }
    }

    if (!matchingResults || !matchingUrl) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Get saved analysis results (no live database queries)
    const results = matchingResults;

    let analysisResult;
    if (results && typeof results === 'object') {
      // Use saved data from the analysis
      analysisResult = {
        id: analysisId,
        url: matchingUrl,
        status: 'completed',
        createdAt: matchingDate,
        firstAnalyzedAt: matchingDate,
        lastUpdatedAt: matchingDate,
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
      analysisResult = {
        id: analysisId,
        url: matchingUrl,
        status: 'completed',
        createdAt: matchingDate,
        firstAnalyzedAt: matchingDate,
        lastUpdatedAt: matchingDate,
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

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
