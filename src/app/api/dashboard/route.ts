import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with subscription and analyses
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: true,
        urlAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions[0];
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Calculate saved count (for now, use analyses with results as "saved")
    const savedCount = user.urlAnalyses.filter(
      (analysis) => analysis.results && analysis.status === 'completed',
    ).length;

    // Calculate average reach from analyses

    // Average reach - return 0 if no real data is available
    const avgReach = 0;
    // TODO: Calculate from real ads reach data when available
    // For now, return 0 to show "NO DATA" state

    // Determine plan name based on price ID
    const planNames: { [key: string]: string } = {
      [process.env.BRONZE_MONTHLY_PRICE!]: 'Bronze',
      [process.env.SILVER_MONTHLY_PRICE!]: 'Silver',
      [process.env.GOLD_MONTHLY_PRICE!]: 'Gold',
    };

    const planPrices: { [key: string]: number } = {
      [process.env.BRONZE_MONTHLY_PRICE!]: 29,
      [process.env.SILVER_MONTHLY_PRICE!]: 39,
      [process.env.GOLD_MONTHLY_PRICE!]: 69,
    };

    const planName = planNames[subscription.priceId] || 'Unknown';
    const pricePerMonth = planPrices[subscription.priceId] || 0;

    const dashboardData = {
      user: {
        name: user.name || 'User',
        email: user.email || '',
      },
      subscription: {
        status: subscription.status,
        monthlyLimit: subscription.monthlyLimit,
        usedThisMonth: subscription.usedThisMonth,
        trialLimit: subscription.trialLimit,
        trialUsed: subscription.trialUsed,
        plan: planName,
        pricePerMonth,
      },
      urlAnalyses: user.urlAnalyses.map((analysis) => ({
        id: analysis.id,
        url: analysis.url,
        status: analysis.status,
        results: analysis.results,
        createdAt: analysis.createdAt.toISOString(),
      })),
      savedCount,
      avgReach,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
