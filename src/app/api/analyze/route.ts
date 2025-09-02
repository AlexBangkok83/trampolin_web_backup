import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

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

    // Validate URLs
    const validUrls = urls.filter((url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
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

    // Create URL analysis records and update usage
    const analysisPromises = validUrls.map((url) =>
      prisma.urlAnalysis.create({
        data: {
          userId: user.id,
          url: url,
          status: 'pending',
        },
      }),
    );

    const analyses = await Promise.all(analysisPromises);

    // Update subscription usage (trial or monthly)
    const updateData = isTrialing
      ? { trialUsed: subscription.trialUsed + urlCount }
      : { usedThisMonth: subscription.usedThisMonth + urlCount };

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: updateData,
    });

    // Simple character count analysis instead of complex Facebook Ads analysis
    const completionPromises = analyses.map((analysis) =>
      prisma.urlAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: 'completed',
          results: {
            url: analysis.url,
            character_count: analysis.url.length,
            analysis: {
              total_characters: analysis.url.length,
              url_breakdown: {
                protocol: analysis.url.startsWith('https') ? 'HTTPS (secure)' : 'HTTP',
                length_category:
                  analysis.url.length < 50
                    ? 'Short'
                    : analysis.url.length < 100
                      ? 'Medium'
                      : 'Long',
                has_query_params: analysis.url.includes('?'),
                domain: analysis.url.split('/')[2] || 'unknown',
              },
            },
            analyzed_at: new Date().toISOString(),
          },
        },
      }),
    );

    await Promise.all(completionPromises);

    return NextResponse.json({
      success: true,
      message: `Started analysis for ${urlCount} URL${urlCount !== 1 ? 's' : ''}`,
      analyses: analyses.map((a) => ({
        id: a.id,
        url: a.url,
        status: a.status,
      })),
      usage: {
        used: isTrialing
          ? subscription.trialUsed + urlCount
          : subscription.usedThisMonth + urlCount,
        limit: isTrialing ? subscription.trialLimit : currentLimit,
        remaining: remaining - urlCount,
        type: limitType,
        isTrialing: isTrialing,
      },
    });
  } catch (error) {
    console.error('Error analyzing URLs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
