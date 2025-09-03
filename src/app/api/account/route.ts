import { NextRequest, NextResponse } from 'next/server';
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

    // Get user with subscription and analyses
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: true,
        urlAnalyses: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const subscription = user.subscriptions[0];
    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    // Calculate stats
    const totalAnalyses = user.urlAnalyses.length;
    const completedAnalyses = user.urlAnalyses.filter(
      (analysis) => analysis.status === 'completed',
    ).length;
    const savedProducts = user.urlAnalyses.filter(
      (analysis) => analysis.results && analysis.status === 'completed',
    ).length;

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

    const accountData = {
      user: {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        emailVerified: user.emailVerified?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
      },
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: planName,
        pricePerMonth,
        monthlyLimit: subscription.monthlyLimit,
        usedThisMonth: subscription.usedThisMonth,
        trialLimit: subscription.trialLimit,
        trialUsed: subscription.trialUsed,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
      stats: {
        totalAnalyses,
        completedAnalyses,
        savedProducts,
      },
    };

    return NextResponse.json(accountData);
  } catch (error) {
    console.error('Account API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update user profile
    await prisma.user.update({
      where: { email: session.user.email },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
