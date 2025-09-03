import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { subscriptionId, credits } = await request.json();

    if (!subscriptionId || typeof credits !== 'number') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Find the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Calculate new usage 
    // Adding credits = reducing usedThisMonth (more available)
    // Removing credits = increasing usedThisMonth (less available)
    const newUsage = Math.max(0, subscription.usedThisMonth - credits);
    
    // Update the subscription usage
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        usedThisMonth: newUsage
      }
    });

    const action = credits > 0 ? 'added' : 'removed';
    const amount = Math.abs(credits);

    return NextResponse.json({ 
      success: true, 
      message: `${action} ${amount} credits`,
      newUsage,
      creditsAdjusted: credits
    });
  } catch (error) {
    console.error('Error adjusting credits:', error);
    return NextResponse.json(
      { error: 'Failed to adjust credits' },
      { status: 500 }
    );
  }
}