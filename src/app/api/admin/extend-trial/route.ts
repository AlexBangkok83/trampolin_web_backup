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

    const { subscriptionId, days } = await request.json();

    if (!subscriptionId || !days || days < 1 || days > 90) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // Find the subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'trialing') {
      return NextResponse.json({ error: 'Only trialing subscriptions can have trial periods extended' }, { status: 400 });
    }

    // Extend the trial period
    const newEndDate = new Date(subscription.currentPeriodEnd);
    newEndDate.setDate(newEndDate.getDate() + days);

    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        currentPeriodEnd: newEndDate.toISOString()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Trial extended by ${days} days`,
      newEndDate: newEndDate.toISOString()
    });
  } catch (error) {
    console.error('Error extending trial:', error);
    return NextResponse.json(
      { error: 'Failed to extend trial' },
      { status: 500 }
    );
  }
}