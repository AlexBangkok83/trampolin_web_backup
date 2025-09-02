import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient, SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Update subscription in database with actual Stripe subscription ID
    if (session.subscription && typeof session.subscription === 'object') {
      const subscription = session.subscription as Stripe.Subscription;

      // Find user by Stripe customer ID
      const customerId =
        typeof session.customer === 'string' ? session.customer : session.customer?.id;

      const dbSubscription = await prisma.subscription.findUnique({
        where: {
          stripeCustomerId: customerId,
        },
        include: {
          user: true,
        },
      });

      if (dbSubscription) {
        // Update with real subscription ID and status
        await prisma.subscription.update({
          where: {
            id: dbSubscription.id,
          },
          data: {
            stripeSubscriptionId: subscription.id,
            status: subscription.status as SubscriptionStatus,
            currentPeriodStart: new Date(
              (subscription as unknown as { current_period_start: number }).current_period_start *
                1000,
            ),
            currentPeriodEnd: new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000,
            ),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        customer_email: session.customer_details?.email,
        payment_status: session.payment_status,
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}
