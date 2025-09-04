import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';
import { z } from 'zod';

const WelcomeEmailSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  userEmail: z.string().email('Valid email is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication - admin only for manual welcome emails
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validation = WelcomeEmailSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { userName, userEmail } = validation.data;

    // Send welcome email
    const result = await sendWelcomeEmail({
      userName,
      userEmail,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('Welcome email API error:', error);

    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
