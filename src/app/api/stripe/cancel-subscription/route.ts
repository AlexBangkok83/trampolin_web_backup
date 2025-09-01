import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cancelSubscription } from '@/lib/stripe';
import { StripeSubscriptionWithPeriods } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SubscriptionStatus } from '@prisma/client';

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  cancelAtPeriodEnd: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validatedData = cancelSubscriptionSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        subscriptions: {
          where: {
            stripeSubscriptionId: validatedData.subscriptionId,
            status: { in: ['active', 'trialing', 'past_due'] },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user owns the subscription
    const subscription = user.subscriptions[0];
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or not accessible' },
        { status: 404 },
      );
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await cancelSubscription(validatedData.subscriptionId);

    // Update subscription status in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: canceledSubscription.status as SubscriptionStatus,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        currentPeriodEnd: new Date(
          (canceledSubscription as StripeSubscriptionWithPeriods).current_period_end * 1000,
        ),
        canceled_at: canceledSubscription.canceled_at,
      },
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}
