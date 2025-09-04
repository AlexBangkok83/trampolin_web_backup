import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { impersonationToken } = body;

    if (!impersonationToken) {
      return NextResponse.json({ error: 'Impersonation token required' }, { status: 400 });
    }

    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(impersonationToken, secret);

    const { targetUserId } = payload as {
      targetUserId: string;
      targetEmail: string;
      targetName: string;
    };

    // Verify the target user still exists and is not admin
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (targetUser.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot impersonate admin users' }, { status: 400 });
    }

    // Create a session token for the target user
    const sessionToken = `impersonate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create the session record
    await prisma.session.create({
      data: {
        userId: targetUserId,
        sessionToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Return session data
    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error('Switch user error:', error);
    return NextResponse.json({ error: 'Failed to switch user session' }, { status: 500 });
  }
}
