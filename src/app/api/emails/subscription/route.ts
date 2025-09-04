import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendSubscriptionNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const SubscriptionEmailSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Valid email is required'),
  subscriptionType: z.enum(['new', 'cancelled', 'payment_failed', 'renewed'], {
    errorMap: () => ({ message: 'Invalid subscription type' }),
  }),
  planName: z.string().optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  nextBillingDate: z.string().datetime().optional(),
  cancelDate: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication - admin only for manual subscription emails
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = SubscriptionEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const {
      userName,
      userEmail,
      subscriptionType,
      planName,
      amount,
      currency,
      nextBillingDate,
      cancelDate,
    } = validation.data;

    // Send subscription notification email
    const result = await sendSubscriptionNotificationEmail({
      userName,
      userEmail,
      subscriptionType,
      planName,
      amount,
      currency,
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : undefined,
      cancelDate: cancelDate ? new Date(cancelDate) : undefined,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription notification email sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('Subscription email API error:', error);

    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to send subscription notification email' },
      { status: 500 },
    );
  }
}
