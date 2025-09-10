import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user by email
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

    // Admin users get unlimited access without subscriptions
    if (user.role?.name === 'admin') {
      return NextResponse.json({
        id: 'admin-unlimited',
        monthlyLimit: 999999,
        usedThisMonth: 0,
        trialLimit: 999999,
        trialUsed: 0,
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        status: 'active',
        isTrialing: false,
        // Active limits (unlimited for admin)
        activeLimit: 999999,
        activeUsed: 0,
        activeRemaining: 999999,
      });
    }

    if (user.subscriptions.length === 0) {
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
