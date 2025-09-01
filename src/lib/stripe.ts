import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Extended Stripe types to include missing properties
export interface StripeSubscriptionWithPeriods extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

export interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | Stripe.Subscription | null;
}

// Type guards and utility functions
export function hasCurrentPeriod(
  subscription: Stripe.Subscription,
): subscription is StripeSubscriptionWithPeriods {
  return 'current_period_start' in subscription && 'current_period_end' in subscription;
}

export function hasSubscription(invoice: Stripe.Invoice): invoice is StripeInvoiceWithSubscription {
  return 'subscription' in invoice && invoice.subscription !== null;
}

// TypeScript interfaces for Stripe objects
export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  created: number;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: Stripe.Subscription.Status;
  current_period_start: number;
  current_period_end: number;
  items: Stripe.ApiList<Stripe.SubscriptionItem>;
}

export interface CreateCustomerParams {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

// Core utility functions for Stripe operations
export async function createCustomer({
  email,
  name,
  metadata = {},
}: CreateCustomerParams): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      created: customer.created,
    };
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error('Failed to create customer');
  }
}

export async function createSubscription({
  customerId,
  priceId,
  metadata = {},
}: CreateSubscriptionParams): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string,
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating Stripe subscription:', error);
    throw new Error('Failed to update subscription');
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error canceling Stripe subscription:', error);
    throw new Error('Failed to cancel subscription');
  }
}

export async function retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    throw new Error('Failed to retrieve subscription');
  }
}

export async function retrieveCustomer(customerId: string): Promise<StripeCustomer> {
  try {
    const customer = await stripe.customers.retrieve(customerId);

    if (customer.deleted) {
      throw new Error('Customer has been deleted');
    }

    return {
      id: customer.id,
      email: customer.email!,
      name: customer.name || undefined,
      created: customer.created,
    };
  } catch (error) {
    console.error('Error retrieving Stripe customer:', error);
    throw new Error('Failed to retrieve customer');
  }
}

export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  customerId?: string,
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error('Failed to create payment intent');
  }
}

// Webhook utility functions
export async function constructWebhookEvent(
  payload: string,
  signature: string,
  secret: string,
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw new Error('Invalid webhook signature');
  }
}

export async function getSubscriptionFromWebhook(
  subscriptionId: string,
): Promise<Stripe.Subscription> {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription from webhook:', error);
    throw new Error('Failed to retrieve subscription');
  }
}
