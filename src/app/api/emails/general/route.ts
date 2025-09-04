import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendGeneralTransactionalEmail } from '@/lib/email';
import { z } from 'zod';

const GeneralEmailSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  heading: z.string().min(1, 'Heading is required').max(100, 'Heading too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  actionText: z.string().max(50, 'Action text too long').optional(),
  actionUrl: z.string().url('Invalid URL').optional(),
  footerText: z.string().max(500, 'Footer text too long').optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = GeneralEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const emailData = validation.data;

    // Validate that if actionText is provided, actionUrl must also be provided
    if (emailData.actionText && !emailData.actionUrl) {
      return NextResponse.json(
        { error: 'Action URL is required when action text is provided' },
        { status: 400 },
      );
    }

    // Send general transactional email
    const result = await sendGeneralTransactionalEmail(emailData);

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('General email API error:', error);

    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
