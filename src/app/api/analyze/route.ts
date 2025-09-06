import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { normalizeUrl } from '@/utils/urlUtils';
import { getTotalReachForUrl, getHistoricalReachForAnalysis } from '@/utils/serverReachUtils';
import { getReachCategory } from '@/utils/reachUtils';

const prisma = new PrismaClient();

// Plan limits mapping
const PLAN_LIMITS = {
  price_1S2Sa1BDgh9JKNMfPQca2Ozk: 500, // Bronze Monthly
  price_1S2Sa1BDgh9JKNMffygQV6Qu: 500, // Bronze Annual
  price_1S2Sa2BDgh9JKNMfXr6YEVMx: 1000, // Silver Monthly
  price_1S2Sa2BDgh9JKNMfYrkEyI8J: 1000, // Silver Annual
  price_1S2Sa3BDgh9JKNMfqNoy03Sg: 2500, // Gold Monthly
  price_1S2Sa3BDgh9JKNMfT37vxnVD: 2500, // Gold Annual
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { urls } = await request.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'URLs are required' }, { status: 400 });
    }

    // Validate URLs - allow URLs with or without protocol
    const validUrls = urls.filter((url) => {
      try {
        // Try as-is first
        new URL(url);
        return true;
      } catch {
        try {
          // Try adding https:// prefix
          new URL(`https://${url}`);
          return true;
        } catch {
          // Check if it looks like a domain/path
          return typeof url === 'string' && url.trim().length > 0 && !url.includes(' ');
        }
      }
    });

    if (validUrls.length === 0) {
      return NextResponse.json({ error: 'No valid URLs provided' }, { status: 400 });
    }

    // Find user and subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: { in: ['active', 'trialing'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.subscriptions.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 403 });
    }

    const subscription = user.subscriptions[0];

    // Update monthly limit based on current price ID
    const currentLimit = PLAN_LIMITS[subscription.priceId as keyof typeof PLAN_LIMITS] || 500;
    if (subscription.monthlyLimit !== currentLimit) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { monthlyLimit: currentLimit },
      });
    }

    // Check usage limits based on trial status
    const urlCount = validUrls.length;
    const isTrialing = subscription.status === 'trialing';

    let remaining: number;
    let limitType: string;

    if (isTrialing) {
      remaining = subscription.trialLimit - subscription.trialUsed;
      limitType = 'trial';
    } else {
      remaining = currentLimit - subscription.usedThisMonth;
      limitType = 'monthly';
    }

    if (urlCount > remaining) {
      const message = isTrialing
        ? `Trial limit exceeded. You need ${urlCount} analyses but only have ${remaining} left in your trial. Please upgrade to continue.`
        : `Monthly limit exceeded. You need ${urlCount} analyses but only have ${remaining} left this month.`;

      return NextResponse.json({ error: message }, { status: 403 });
    }

    // Create or update URL analysis records
    const analysisPromises = validUrls.map(async (url) => {
      // Normalize URL before saving to database (Facebook redirects, www cleanup, etc.)
      const cleanUrl = normalizeUrl(url);
      console.log('🆔 URL processing - Original:', url, '-> Normalized:', cleanUrl);

      // Check if user already has this URL analyzed
      const existingAnalysis = await prisma.urlAnalysis.findFirst({
        where: {
          userId: user.id,
          url: cleanUrl,
        },
      });

      if (existingAnalysis) {
        // Update existing analysis - this will update the updatedAt timestamp automatically
        return prisma.urlAnalysis.update({
          where: { id: existingAnalysis.id },
          data: {
            status: 'pending',
            // Clear previous results to indicate fresh analysis
            results: undefined,
          },
        });
      } else {
        // Create new analysis
        return prisma.urlAnalysis.create({
          data: {
            userId: user.id,
            url: cleanUrl,
            status: 'pending',
          },
        });
      }
    });

    const analyses = await Promise.all(analysisPromises);

    // Deduct credits for ALL analyses (including re-analyses)
    const totalAnalysesCount = analyses.length;

    console.log('🔍 Credit deduction debug:', {
      totalAnalyses: totalAnalysesCount,
      isTrialing,
      previousUsed: isTrialing ? subscription.trialUsed : subscription.usedThisMonth,
      willDeduct: totalAnalysesCount,
    });

    // Update subscription usage for ALL analyses (trial or monthly)
    const updateData = isTrialing
      ? { trialUsed: subscription.trialUsed + totalAnalysesCount }
      : { usedThisMonth: subscription.usedThisMonth + totalAnalysesCount };

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });
    console.log('✅ Credits deducted:', totalAnalysesCount);

    // Real Facebook Ads analysis with saved data
    const completionPromises = analyses.map(async (analysis) => {
      console.log('🎆 Analyzing URL:', analysis.url);
      // Get real reach data from ads database
      const totalReach = await getTotalReachForUrl(analysis.url);
      const { category: reachCategory, color: reachColor } = getReachCategory(totalReach);
      console.log('🎆 Analysis result for', analysis.url, '- Total reach:', totalReach);

      // Get historical chart data
      const historicalData = await getHistoricalReachForAnalysis(analysis.url);

      // Calculate metadata based on real data
      let adCount = 0;
      let totalDays = 0;
      let firstDay = null;
      let lastDay = null;
      let avgReachPerDay = 0;

      if (totalReach > 0) {
        if (historicalData.length > 0) {
          // Use real historical data
          adCount = historicalData.reduce((sum, day) => sum + day.adCount, 0);
          totalDays = historicalData.length;
          firstDay = historicalData[0].date;
          lastDay = historicalData[historicalData.length - 1].date;
          avgReachPerDay = totalDays > 0 ? Math.round(totalReach / totalDays) : 0;
        } else {
          // Fallback to minimal values
          adCount = 1;
          totalDays = 1;
          firstDay = new Date().toISOString().split('T')[0];
          lastDay = firstDay;
          avgReachPerDay = totalReach;
        }
      }

      // Save complete analysis results to database
      return prisma.urlAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          results: {
            url: analysis.url,
            totalReach,
            adCount,
            avgReachPerDay,
            totalDays,
            firstDay,
            lastDay,
            reachCategory,
            reachColor,
            chartData: historicalData, // Save historical chart data
            analyzed_at: new Date().toISOString(),
          },
        },
      });
    });

    await Promise.all(completionPromises);

    const message = `Successfully analyzed ${totalAnalysesCount} URL${totalAnalysesCount !== 1 ? 's' : ''}. ${totalAnalysesCount} credit${totalAnalysesCount !== 1 ? 's' : ''} deducted.`;

    return NextResponse.json({
      success: true,
      message,
      analyses: analyses.map((a) => ({
        id: a.id,
        url: a.url,
        status: a.status,
      })),
      usage: {
        used: isTrialing
          ? subscription.trialUsed + totalAnalysesCount
          : subscription.usedThisMonth + totalAnalysesCount,
        limit: isTrialing ? subscription.trialLimit : currentLimit,
        remaining: remaining - totalAnalysesCount,
        type: limitType,
        isTrialing: isTrialing,
      },
    });
  } catch (error) {
    console.error('Error analyzing URLs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
