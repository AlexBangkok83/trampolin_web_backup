import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
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
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 });
    }

    const subscription = user.subscriptions[0];

    // Check if we need to reset monthly usage
    const now = new Date();
    const lastReset = new Date(subscription.lastUsageReset);
    const currentPeriodStart = new Date(subscription.currentPeriodStart);

    let updatedSubscription = subscription;

    // If we're in a new billing period, reset the usage
    if (now >= currentPeriodStart && lastReset < currentPeriodStart) {
      updatedSubscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          usedThisMonth: 0,
          lastUsageReset: now,
        },
      });
    }

    // Determine if user is in trial and what limits to show
    const isTrialing = updatedSubscription.status === 'trialing';
    const currentLimit = isTrialing
      ? updatedSubscription.trialLimit
      : updatedSubscription.monthlyLimit;
    const currentUsed = isTrialing
      ? updatedSubscription.trialUsed
      : updatedSubscription.usedThisMonth;

    return NextResponse.json({
      id: updatedSubscription.id,
      monthlyLimit: updatedSubscription.monthlyLimit,
      usedThisMonth: updatedSubscription.usedThisMonth,
      trialLimit: updatedSubscription.trialLimit,
      trialUsed: updatedSubscription.trialUsed,
      currentPeriodEnd: updatedSubscription.currentPeriodEnd.toISOString(),
      status: updatedSubscription.status,
      isTrialing: isTrialing,
      // Active limits (trial or monthly)
      activeLimit: currentLimit,
      activeUsed: currentUsed,
      activeRemaining: currentLimit - currentUsed,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
