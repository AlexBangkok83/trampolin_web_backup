import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendAdminNotificationEmail } from '@/lib/email';
import { z } from 'zod';

const AdminNotificationSchema = z.object({
  type: z.enum(['new_signup', 'subscription_change', 'payment_failed', 'refund_request'], {
    errorMap: () => ({ message: 'Invalid notification type' }),
  }),
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Valid email is required'),
  userId: z.string().min(1, 'User ID is required'),
  details: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication - system or admin only
    const session = await getServerSession(authOptions);
    const isSystem =
      request.headers.get('Authorization') === `Bearer ${process.env.SYSTEM_API_KEY}`;

    if (!isSystem && (!session?.user || (session.user as { role?: string }).role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - System or admin access required' },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = AdminNotificationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { type, userName, userEmail, userId, details } = validation.data;

    // Create action URL based on notification type
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    let actionUrl = `${baseUrl}/dashboard/admin/users/${userId}`;

    switch (type) {
      case 'subscription_change':
        actionUrl = `${baseUrl}/dashboard/admin/subscriptions?userId=${userId}`;
        break;
      case 'payment_failed':
        actionUrl = `${baseUrl}/dashboard/admin/payments?userId=${userId}`;
        break;
      case 'refund_request':
        actionUrl = `${baseUrl}/dashboard/admin/refunds?userId=${userId}`;
        break;
    }

    // Send admin notification email
    await sendAdminNotificationEmail({
      type,
      userName,
      userEmail,
      userId,
      details,
      actionUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin notification email sent successfully',
    });
  } catch (error) {
    console.error('Admin notification email API error:', error);

    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      // For admin notifications, we log but don't return error
      console.warn('Admin notification rate limited');
      return NextResponse.json({
        success: true,
        message: 'Admin notification queued (rate limited)',
      });
    }

    return NextResponse.json({ error: 'Failed to send admin notification email' }, { status: 500 });
  }
}
