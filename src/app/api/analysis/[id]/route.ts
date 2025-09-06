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

    // Find analysis by URL hash-based ID from user's analyses
    const dbAnalyses = await prisma.urlAnalysis.findMany({
      where: {
        userId: user.id,
        status: 'completed',
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Find the analysis by matching the hash ID
    let matchingAnalysis = null;
    for (const analysis of dbAnalyses) {
      const hashId = generateAnalysisId(analysis.url);
      if (hashId === analysisId) {
        matchingAnalysis = analysis;
        break;
      }
    }

    if (!matchingAnalysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    // Get saved analysis results (no live database queries)
    const results = matchingAnalysis.results as Record<string, unknown>;

    let analysisResult;
    if (results && typeof results === 'object') {
      // Use saved data from the analysis
      analysisResult = {
        id: analysisId,
        url: matchingAnalysis.url,
        status: matchingAnalysis.status,
        createdAt: matchingAnalysis.createdAt,
        firstAnalyzedAt: matchingAnalysis.createdAt,
        lastUpdatedAt: matchingAnalysis.updatedAt,
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
        url: matchingAnalysis.url,
        status: matchingAnalysis.status,
        createdAt: matchingAnalysis.createdAt,
        firstAnalyzedAt: matchingAnalysis.createdAt,
        lastUpdatedAt: matchingAnalysis.updatedAt,
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
