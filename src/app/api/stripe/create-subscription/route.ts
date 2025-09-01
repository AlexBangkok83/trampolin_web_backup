import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSubscription, createCustomer } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  metadata: z.record(z.string()).optional(),
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
    const validatedData = createSubscriptionSchema.parse(body);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let customerId = user.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createCustomer({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });

      customerId = customer.id;

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create subscription
    const subscription = await createSubscription({
      customerId,
      priceId: validatedData.priceId,
      metadata: {
        userId: user.id,
        ...validatedData.metadata,
      },
    });

    // Store subscription in database
    await prisma.subscription.create({
      data: {
        id: subscription.id,
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        priceId: validatedData.priceId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error('Error creating subscription:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
