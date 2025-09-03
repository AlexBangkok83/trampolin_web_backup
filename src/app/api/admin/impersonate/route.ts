import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      include: { role: true }
    });

    if (!adminUser || adminUser.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if target user exists and is not an admin
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot impersonate admin users' }, { status: 400 });
    }

    // Create an impersonation token
    const impersonationToken = await prisma.session.create({
      data: {
        userId: targetUser.id,
        sessionToken: `impersonate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      }
    });

    return NextResponse.json({ 
      success: true,
      impersonationToken: impersonationToken.sessionToken,
      targetUser: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email
      }
    });
  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json(
      { error: 'Failed to create impersonation session' },
      { status: 500 }
    );
  }
}