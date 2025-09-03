import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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
      where: { id },
      include: { role: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role?.name === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Prevent self-deletion
    if (targetUser.id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    // Delete user (Prisma will cascade delete related records)
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User ${targetUser.email} deleted successfully` 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
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

    // Fetch specific user with detailed info
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
        urlAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 analyses
          select: {
            id: true,
            url: true,
            createdAt: true,
            results: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PATCH(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await _request.json();
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

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true, subscriptions: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name || null,
        email: body.email,
        roleId: body.roleId || null,
      },
      include: {
        role: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Update or create subscription if needed
    if (body.subscriptionStatus && body.subscriptionStatus !== 'none') {
      const currentSubscription = targetUser.subscriptions[0];
      
      if (currentSubscription) {
        // Update existing subscription
        await prisma.subscription.update({
          where: { id: currentSubscription.id },
          data: {
            status: body.subscriptionStatus,
            monthlyLimit: body.monthlyLimit || 1000,
          }
        });
      } else {
        // Create new subscription
        await prisma.subscription.create({
          data: {
            userId: id,
            stripeCustomerId: `admin_created_${id}`,
            status: body.subscriptionStatus,
            priceId: 'admin_managed',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            monthlyLimit: body.monthlyLimit || 1000,
            usedThisMonth: 0,
          }
        });
      }
    } else if (body.subscriptionStatus === 'none' && targetUser.subscriptions[0]) {
      // Remove subscription
      await prisma.subscription.delete({
        where: { id: targetUser.subscriptions[0].id }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}