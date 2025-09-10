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
        role: true,
        subscriptions: {
          where: { status: { in: ['active', 'trialing'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admin users bypass subscription checks
    const isAdmin = user.role?.name === 'admin';

    if (!isAdmin && user.subscriptions.length === 0) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 403 });
    }

    const subscription = isAdmin ? null : user.subscriptions[0];

    let currentLimit = 500;
    let isTrialing = false;
    let remaining = Infinity;
    let limitType = 'unlimited';

    // Only check subscription limits for non-admin users
    if (!isAdmin && subscription) {
      // Update monthly limit based on current price ID
      currentLimit = PLAN_LIMITS[subscription.priceId as keyof typeof PLAN_LIMITS] || 500;
      if (subscription.monthlyLimit !== currentLimit) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { monthlyLimit: currentLimit },
        });
      }

      // Check usage limits based on trial status
      const urlCount = validUrls.length;
      isTrialing = subscription.status === 'trialing';

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
    }

    // Create a Search record for this batch (even if single URL)
    const search = await prisma.search.create({
      data: {
        userId: user.id,
        status: 'pending',
        urlCount: validUrls.length,
      },
    });

    console.log('🔍 Created search record:', search.id, 'for', validUrls.length, 'URLs');

    // Create or update URL analysis records linked to this search
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
        // Update existing analysis - link to new search and reset status
        return prisma.urlAnalysis.update({
          where: { id: existingAnalysis.id },
          data: {
            status: 'pending',
            searchId: search.id, // Link to the batch search
            // Clear previous results to indicate fresh analysis
            results: undefined,
          },
        });
      } else {
        // Create new analysis linked to search
        return prisma.urlAnalysis.create({
          data: {
            userId: user.id,
            url: cleanUrl,
            status: 'pending',
            searchId: search.id, // Link to the batch search
          },
        });
      }
    });

    const analyses = await Promise.all(analysisPromises);

    // First, check which URLs actually have data before charging credits
    const dataCheckPromises = analyses.map(async (analysis) => {
      const totalReach = await getTotalReachForUrl(analysis.url);
      return { analysis, hasData: totalReach > 0, totalReach };
    });

    const dataCheckResults = await Promise.all(dataCheckPromises);
    const urlsWithData = dataCheckResults.filter((result) => result.hasData);
    const urlsWithoutData = dataCheckResults.filter((result) => !result.hasData);

    // Only charge credits for URLs that have data (and only for non-admin users)
    const creditsToCharge = isAdmin ? 0 : urlsWithData.length;

    console.log('🔍 Credit charging analysis:', {
      totalAnalyses: analyses.length,
      urlsWithData: urlsWithData.length,
      urlsWithoutData: urlsWithoutData.length,
      creditsToCharge,
      isAdmin,
      isTrialing,
      previousUsed: isAdmin
        ? 'N/A (admin)'
        : isTrialing
          ? subscription?.trialUsed
          : subscription?.usedThisMonth,
    });

    // Update subscription usage only for URLs with data (skip for admin users)
    if (!isAdmin && creditsToCharge > 0 && subscription) {
      const updateData = isTrialing
        ? { trialUsed: subscription.trialUsed + creditsToCharge }
        : { usedThisMonth: subscription.usedThisMonth + creditsToCharge };

      await prisma.subscription.update({
        where: { id: subscription.id },
        data: updateData,
      });
      console.log(
        '✅ Credits charged:',
        creditsToCharge,
        '(',
        urlsWithoutData.length,
        'URLs had no data - no charge)',
      );
    } else if (isAdmin) {
      console.log('👑 Admin user - no credits charged');
    } else {
      console.log('ℹ️ No credits charged - all URLs returned no data');
    }

    // Process analysis results using the already-fetched data
    const completionPromises = dataCheckResults.map(async ({ analysis, totalReach }) => {
      console.log('🎆 Processing analysis for:', analysis.url, '- Total reach:', totalReach);
      const { category: reachCategory, color: reachColor } = getReachCategory(totalReach);

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

    // Update the search record with total reach and completion status
    const totalSearchReach = dataCheckResults.reduce((sum, result) => sum + result.totalReach, 0);
    await prisma.search.update({
      where: { id: search.id },
      data: {
        status: 'completed',
        totalReach: totalSearchReach,
      },
    });

    console.log('\ud83c\udf86 Search completed:', search.id, 'with total reach:', totalSearchReach);

    const totalAnalysesCount = analyses.length;
    let message;
    if (isAdmin) {
      message = `Successfully analyzed ${totalAnalysesCount} URL${totalAnalysesCount !== 1 ? 's' : ''} (admin - no credits charged).`;
    } else if (creditsToCharge === totalAnalysesCount) {
      message = `Successfully analyzed ${totalAnalysesCount} URL${totalAnalysesCount !== 1 ? 's' : ''}. ${creditsToCharge} credit${creditsToCharge !== 1 ? 's' : ''} deducted.`;
    } else if (creditsToCharge === 0) {
      message = `Analyzed ${totalAnalysesCount} URL${totalAnalysesCount !== 1 ? 's' : ''} - no data found, no credits charged.`;
    } else {
      message = `Analyzed ${totalAnalysesCount} URL${totalAnalysesCount !== 1 ? 's' : ''} - ${creditsToCharge} with data (charged), ${urlsWithoutData.length} with no data (free).`;
    }

    return NextResponse.json({
      success: true,
      message,
      analyses: analyses.map((a) => ({
        id: a.id,
        url: a.url,
        status: a.status,
      })),
      dataBreakdown: {
        totalAnalyzed: totalAnalysesCount,
        withData: urlsWithData.length,
        withoutData: urlsWithoutData.length,
        creditsCharged: creditsToCharge,
      },
      usage: isAdmin
        ? {
            used: 0,
            limit: Infinity,
            remaining: Infinity,
            type: 'admin',
            isTrialing: false,
          }
        : {
            used: isTrialing
              ? (subscription?.trialUsed || 0) + creditsToCharge
              : (subscription?.usedThisMonth || 0) + creditsToCharge,
            limit: isTrialing ? subscription?.trialLimit || 0 : currentLimit,
            remaining: remaining - creditsToCharge,
            type: limitType,
            isTrialing: isTrialing,
          },
    });
  } catch (error) {
    console.error('Error analyzing URLs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
