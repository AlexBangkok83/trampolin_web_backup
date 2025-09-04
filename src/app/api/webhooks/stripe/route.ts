import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { emailStripeEvents } from '@/lib/email-triggers';

// Type definitions for Stripe webhook data
interface StripeSubscriptionData {
  id: string;
  status: string;
  customer: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: {
    data: Array<{
      price: {
        id: string;
      };
    }>;
  };
}

interface StripeInvoiceData {
  id: string;
  subscription: string | null;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription created:', subscription.id);

    // Check if subscription already exists (idempotency)
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (existingSubscription) {
      console.log('Subscription already exists, skipping creation');
      return;
    }

    // Find user by Stripe customer ID
    const user = await prisma.user.findFirst({
      where: { stripeCustomerId: subscription.customer as string },
    });

    if (!user) {
      console.error('User not found for customer:', subscription.customer);
      return;
    }

    // Create subscription record
    await prisma.subscription.create({
      data: {
        id: subscription.id,
        userId: user.id,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        status: subscription.status as SubscriptionStatus,
        priceId: subscription.items.data[0]?.price.id || '',
        currentPeriodStart: new Date(
          (subscription as unknown as StripeSubscriptionData).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (subscription as unknown as StripeSubscriptionData).current_period_end * 1000,
        ),
      },
    });

    // Trigger subscription created email
    const planNameMap: Record<string, string> = {
      [process.env.BRONZE_MONTHLY_PRICE || '']: 'Bronze Plan (Monthly)',
      [process.env.BRONZE_ANNUAL_PRICE || '']: 'Bronze Plan (Annual)',
      [process.env.SILVER_MONTHLY_PRICE || '']: 'Silver Plan (Monthly)',
      [process.env.SILVER_ANNUAL_PRICE || '']: 'Silver Plan (Annual)',
      [process.env.GOLD_MONTHLY_PRICE || '']: 'Gold Plan (Monthly)',
      [process.env.GOLD_ANNUAL_PRICE || '']: 'Gold Plan (Annual)',
    };

    emailStripeEvents
      .subscriptionCreated(user.id, {
        planName: planNameMap[subscription.items.data[0]?.price.id || ''] || 'Subscription Plan',
        amount: subscription.items.data[0]?.price.unit_amount,
        currency: subscription.items.data[0]?.price.currency,
        currentPeriodEnd: new Date(
          (subscription as unknown as StripeSubscriptionData).current_period_end * 1000,
        ),
      })
      .catch((error) => console.error('Email trigger failed:', error));

    console.log('Subscription created successfully');
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription updated:', subscription.id);

    // Find existing subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (!existingSubscription) {
      console.error('Subscription not found:', subscription.id);
      return;
    }

    // Update subscription
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: subscription.status as SubscriptionStatus,
        priceId: subscription.items.data[0]?.price.id || existingSubscription.priceId,
        currentPeriodStart: new Date(
          (subscription as unknown as StripeSubscriptionData).current_period_start * 1000,
        ),
        currentPeriodEnd: new Date(
          (subscription as unknown as StripeSubscriptionData).current_period_end * 1000,
        ),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      },
    });

    // Trigger subscription updated email (for renewals)
    if (subscription.status === 'active') {
      const user = await prisma.user.findUnique({
        where: { id: existingSubscription.userId },
      });

      if (user) {
        const planNameMap: Record<string, string> = {
          [process.env.BRONZE_MONTHLY_PRICE || '']: 'Bronze Plan (Monthly)',
          [process.env.BRONZE_ANNUAL_PRICE || '']: 'Bronze Plan (Annual)',
          [process.env.SILVER_MONTHLY_PRICE || '']: 'Silver Plan (Monthly)',
          [process.env.SILVER_ANNUAL_PRICE || '']: 'Silver Plan (Annual)',
          [process.env.GOLD_MONTHLY_PRICE || '']: 'Gold Plan (Monthly)',
          [process.env.GOLD_ANNUAL_PRICE || '']: 'Gold Plan (Annual)',
        };

        emailStripeEvents
          .subscriptionUpdated(user.id, {
            planName:
              planNameMap[subscription.items.data[0]?.price.id || ''] || 'Subscription Plan',
            amount: subscription.items.data[0]?.price.unit_amount,
            currency: subscription.items.data[0]?.price.currency,
            currentPeriodEnd: new Date(
              (subscription as unknown as StripeSubscriptionData).current_period_end * 1000,
            ),
          })
          .catch((error) => console.error('Email trigger failed:', error));
      }
    }

    console.log('Subscription updated successfully');
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    console.log('Processing subscription deleted:', subscription.id);

    // Get user info before updating
    const existingSubscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    });

    // Update subscription status to canceled
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'canceled' as SubscriptionStatus,
        canceledAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Trigger subscription canceled email
    if (existingSubscription?.user) {
      const planNameMap: Record<string, string> = {
        [process.env.BRONZE_MONTHLY_PRICE || '']: 'Bronze Plan (Monthly)',
        [process.env.BRONZE_ANNUAL_PRICE || '']: 'Bronze Plan (Annual)',
        [process.env.SILVER_MONTHLY_PRICE || '']: 'Silver Plan (Monthly)',
        [process.env.SILVER_ANNUAL_PRICE || '']: 'Silver Plan (Annual)',
        [process.env.GOLD_MONTHLY_PRICE || '']: 'Gold Plan (Monthly)',
        [process.env.GOLD_ANNUAL_PRICE || '']: 'Gold Plan (Annual)',
      };

      emailStripeEvents
        .subscriptionCanceled(existingSubscription.userId, {
          planName: planNameMap[existingSubscription.priceId] || 'Subscription Plan',
          canceledAt: new Date(),
        })
        .catch((error) => console.error('Email trigger failed:', error));
    }

    console.log('Subscription deleted successfully');
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment succeeded:', invoice.id);

    if (!(invoice as unknown as StripeInvoiceData).subscription) {
      console.log('Invoice not associated with subscription, skipping');
      return;
    }

    const subscriptionId = (invoice as unknown as StripeInvoiceData).subscription as string;

    // Update subscription to active if payment succeeded
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'active' as SubscriptionStatus,
        updatedAt: new Date(),
      },
    });

    console.log('Payment succeeded processed successfully');
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
    throw error;
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log('Processing payment failed:', invoice.id);

    if (!(invoice as unknown as StripeInvoiceData).subscription) {
      console.log('Invoice not associated with subscription, skipping');
      return;
    }

    const subscriptionId = (invoice as unknown as StripeInvoiceData).subscription as string;

    // Get subscription and user info
    const subscription = await prisma.subscription.findFirst({
      where: { stripeSubscriptionId: subscriptionId },
      include: { user: true },
    });

    // Update subscription status based on failure
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: {
        status: 'past_due' as SubscriptionStatus,
        updatedAt: new Date(),
      },
    });

    // Trigger payment failed email
    if (subscription?.user) {
      emailStripeEvents
        .paymentFailed(subscription.userId, {
          amount: invoice.amount_due,
          currency: invoice.currency,
          failureReason: 'Payment method declined',
          subscriptionId: subscription.id,
        })
        .catch((error) => console.error('Email trigger failed:', error));
    }

    console.log('Payment failed processed successfully');
  } catch (error) {
    console.error('Error handling payment failed:', error);
    throw error;
  }
}
