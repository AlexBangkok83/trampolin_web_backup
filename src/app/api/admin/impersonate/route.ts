import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignJWT } from 'jose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;
    const session = await getServerSession(authOptions);

    // Check if user is admin
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true },
    });

    if (!adminUser || adminUser.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if target user exists and is not an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot impersonate admin users' }, { status: 400 });
    }

    // Create an impersonation JWT token that we can use client-side
    const impersonationData = {
      adminUserId: adminUser.id,
      adminEmail: adminUser.email,
      targetUserId: targetUser.id,
      targetEmail: targetUser.email,
      targetName: targetUser.name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    };

    // Use NextAuth secret for JWT signing
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
    const impersonationToken = await new SignJWT(impersonationData)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    return NextResponse.json({
      success: true,
      impersonationToken,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
      },
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ error: 'Failed to create impersonation session' }, { status: 500 });
  }
}
