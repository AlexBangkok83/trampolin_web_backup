import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const PasswordResetSchema = z.object({
  email: z.string().email('Valid email is required'),
});

// Password reset token expires in 1 hour
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = PasswordResetSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure reset token
      const resetToken = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY);

      // Store reset token (you may want to add a PasswordReset model to your schema)
      // For now, we'll use the VerificationToken model
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: resetToken,
          expires: expiresAt,
        },
      });

      // Create reset URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

      // Send password reset email
      await sendPasswordResetEmail({
        userName: user.name || 'User',
        userEmail: user.email!,
        resetToken,
        resetUrl,
        expiresAt,
      });
    }

    // Always return success response
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error) {
    console.error('Password reset email API error:', error);

    if (error instanceof Error && error.message.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 },
    );
  }
}

// GET endpoint to verify reset tokens
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ error: 'Token and email are required' }, { status: 400 });
    }

    // Verify token exists and is not expired
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: email,
          token: token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: email,
            token: token,
          },
        },
      });

      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      expiresAt: verificationToken.expires,
    });
  } catch (error) {
    console.error('Password reset token verification error:', error);
    return NextResponse.json({ error: 'Failed to verify reset token' }, { status: 500 });
  }
}
