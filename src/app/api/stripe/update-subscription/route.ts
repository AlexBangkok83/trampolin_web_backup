import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateSubscription } from '@/lib/stripe';
import { StripeSubscriptionWithPeriods } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { SubscriptionStatus } from '@prisma/client';

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  newPriceId: z.string().min(1, 'New price ID is required'),
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
    const validatedData = updateSubscriptionSchema.parse(body);

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

    // Update subscription in Stripe
    const updatedSubscription = await updateSubscription(
      validatedData.subscriptionId,
      validatedData.newPriceId,
    );

    // Update subscription in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: updatedSubscription.status as SubscriptionStatus,
        priceId: validatedData.newPriceId,
        currentPeriodStart: new Date(
          (updatedSubscription as StripeSubscriptionWithPeriods).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (updatedSubscription as StripeSubscriptionWithPeriods).current_period_end * 1000,
        ),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_start: (updatedSubscription as StripeSubscriptionWithPeriods)
          .current_period_start,
        current_period_end: (updatedSubscription as StripeSubscriptionWithPeriods)
          .current_period_end,
      },
    });
  } catch (error) {
    console.error('Error updating subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
