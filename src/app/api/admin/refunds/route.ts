import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch recent refunds from Stripe
    const refunds = await stripe.refunds.list({
      limit: 50,
      expand: ['data.charge', 'data.payment_intent'],
    });

    return NextResponse.json({
      refunds: refunds.data.map((refund) => ({
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
        created: refund.created,
        charge_id: refund.charge,
        payment_intent_id: refund.payment_intent,
        metadata: refund.metadata,
      })),
    });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { chargeId, paymentIntentId, amount, reason, note, userEmail } = await request.json();

    // Validate required fields
    if (!chargeId && !paymentIntentId) {
      return NextResponse.json(
        {
          error: 'Either charge ID or payment intent ID is required',
        },
        { status: 400 },
      );
    }

    if (!reason) {
      return NextResponse.json(
        {
          error: 'Refund reason is required',
        },
        { status: 400 },
      );
    }

    // Create refund in Stripe
    const refundData: Stripe.RefundCreateParams = {
      reason: reason as Stripe.RefundCreateParams.Reason,
      metadata: {
        admin_user: session.user.email!,
        customer_email: userEmail || 'unknown',
        admin_note: note || '',
        refund_timestamp: new Date().toISOString(),
      },
    };

    if (chargeId) {
      refundData.charge = chargeId;
    } else {
      refundData.payment_intent = paymentIntentId;
    }

    if (amount) {
      refundData.amount = amount;
    }

    const refund = await stripe.refunds.create(refundData);

    // Log refund in our database for audit trail
    try {
      await prisma.refund.create({
        data: {
          stripeRefundId: refund.id,
          stripeChargeId: (refund.charge as string) || '',
          stripePaymentIntentId: (refund.payment_intent as string) || '',
          amount: refund.amount,
          currency: refund.currency,
          reason: refund.reason || '',
          status: refund.status || 'pending',
          adminUserId: user.id,
          customerEmail: userEmail || '',
          adminNote: note || '',
          metadata: refund.metadata || {},
        },
      });
    } catch (dbError) {
      console.error('Failed to log refund in database:', dbError);
      // Continue anyway since Stripe refund succeeded
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        status: refund.status,
        reason: refund.reason,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating refund:', error);

    if (
      error &&
      typeof error === 'object' &&
      'type' in error &&
      error.type === 'StripeCardError' &&
      'message' in error
    ) {
      return NextResponse.json(
        {
          error: `Stripe error: ${(error as { message: string }).message}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
