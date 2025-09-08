import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

// Plan mapping for limits with fallback validation
const getPlanLimits = () => {
  const limits = {
    bronze: { priceId: process.env.BRONZE_MONTHLY_PRICE || '', limit: 500 },
    silver: { priceId: process.env.SILVER_MONTHLY_PRICE || '', limit: 1000 },
    gold: { priceId: process.env.GOLD_MONTHLY_PRICE || '', limit: 2500 },
  };

  // Validate all price IDs are available
  for (const [plan, config] of Object.entries(limits)) {
    if (!config.priceId) {
      console.error(`Missing environment variable for ${plan.toUpperCase()}_MONTHLY_PRICE`);
      throw new Error(`Plan configuration missing for ${plan}`);
    }
  }

  return limits;
};

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, plan } = await request.json();

    // Validate input
    if (!name || !email || !password || !plan) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Initialize Stripe and plan limits
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment service not configured' }, { status: 500 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    });

    const PLAN_LIMITS = getPlanLimits();

    if (!PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        plan: plan,
      },
    });

    // Get plan details
    const planDetails = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    // Create Stripe Checkout session for trial with payment method collection
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: planDetails.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId: user.id,
          plan: plan,
        },
      },
      success_url: `${process.env.NEXTAUTH_URL}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/signup?plan=${plan}&cancelled=true`,
      allow_promotion_codes: true,
    });

    // Create subscription record in database with pending status
    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: null, // Will be updated via webhook
        status: 'trialing', // Will be properly set via webhook
        priceId: planDetails.priceId,
        monthlyLimit: planDetails.limit,
        usedThisMonth: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      checkoutUrl: checkoutSession.url,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      plan: {
        name: plan.charAt(0).toUpperCase() + plan.slice(1),
        limit: planDetails.limit,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);

    // Log additional context for debugging
    console.error('Environment check:', {
      hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
      hasBronzePrice: !!process.env.BRONZE_MONTHLY_PRICE,
      hasSilverPrice: !!process.env.SILVER_MONTHLY_PRICE,
      hasGoldPrice: !!process.env.GOLD_MONTHLY_PRICE,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    });

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Plan configuration missing')) {
        return NextResponse.json(
          {
            error: 'Service configuration error. Please contact support.',
            details: error.message,
          },
          { status: 500 },
        );
      }

      if (error.message.includes('No such price')) {
        return NextResponse.json(
          {
            error: 'Plan configuration error. Please contact support.',
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create account. Please try again.',
      },
      { status: 500 },
    );
  }
}
