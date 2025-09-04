import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { creditPacks = 1 } = body; // Number of 100-credit packs to purchase

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with subscription info
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const activeSubscription = user.subscriptions[0];
    if (!activeSubscription) {
      return NextResponse.json(
        {
          error: 'Active subscription required to purchase credits',
        },
        { status: 400 },
      );
    }

    // Check if user is on Gold plan (only Gold users can buy extra credits)
    const goldPriceIds = [process.env.GOLD_MONTHLY_PRICE, process.env.GOLD_ANNUAL_PRICE].filter(
      Boolean,
    );

    if (!goldPriceIds.includes(activeSubscription.priceId)) {
      return NextResponse.json(
        {
          error: 'Credit purchases are only available for Gold plan subscribers',
        },
        { status: 400 },
      );
    }

    // Calculate dynamic pricing
    const goldPlanPrice = 6900; // $69.00 in cents
    const goldPlanCredits = 2500;
    const creditCostCents = goldPlanPrice / goldPlanCredits;
    const discountedCreditCost = creditCostCents * 0.5; // 50% discount
    const creditPackSize = 100;
    const creditPackPrice = Math.ceil(discountedCreditCost * creditPackSize);

    const totalCredits = creditPackSize * creditPacks;
    const totalPrice = creditPackPrice * creditPacks;

    // Create Stripe checkout session for credit purchase
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId || undefined,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Additional Analysis Credits (${totalCredits} credits)`,
              description: `${creditPacks} pack${creditPacks > 1 ? 's' : ''} of 100 additional URL analysis credits each`,
              metadata: {
                type: 'credit_addon',
                eligible_plans: 'gold',
                credits_per_pack: creditPackSize.toString(),
                packs: creditPacks.toString(),
              },
            },
            unit_amount: creditPackPrice,
          },
          quantity: creditPacks,
        },
      ],
      mode: 'payment', // One-time payment
      success_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?credit_purchase=success&credits=${totalCredits}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/subscription?credit_purchase=canceled`,
      metadata: {
        user_id: user.id,
        credit_packs: creditPacks.toString(),
        total_credits: totalCredits.toString(),
        subscription_id: activeSubscription.id,
      },
    });

    return NextResponse.json({
      checkout_url: checkoutSession.url,
      session_id: checkoutSession.id,
      pricing: {
        creditPackSize,
        creditPacks,
        totalCredits,
        pricePerPack: creditPackPrice / 100,
        totalPrice: totalPrice / 100,
        savings: '50% off regular rate',
      },
    });
  } catch (error) {
    console.error('Credit purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to create credit purchase session' },
      { status: 500 },
    );
  }
}
