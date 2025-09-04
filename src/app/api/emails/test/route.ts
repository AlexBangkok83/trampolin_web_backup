import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { testEmailConfiguration } from '@/lib/email';

export async function POST() {
  try {
    // Check authentication - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Test email configuration
    const result = await testEmailConfiguration();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        emailId: result.id,
      });
    } else {
      return NextResponse.json(
        {
          error: 'Email configuration test failed',
          details: result.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Email test API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to test email configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // Check authentication - admin only
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Return email service configuration status
    const config = {
      resendApiKey: !!process.env.RESEND_API_KEY,
      emailFrom: process.env.EMAIL_FROM || 'Not configured',
      emailReplyTo: process.env.EMAIL_REPLY_TO || 'Not configured',
      adminEmails: (process.env.ADMIN_EMAILS || 'Not configured').split(','),
      domain: process.env.NEXTAUTH_URL || 'Not configured',
    };

    return NextResponse.json({
      success: true,
      configured: config.resendApiKey,
      configuration: config,
    });
  } catch (error) {
    console.error('Email configuration check error:', error);

    return NextResponse.json({ error: 'Failed to check email configuration' }, { status: 500 });
  }
}
