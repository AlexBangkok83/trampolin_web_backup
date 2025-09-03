import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Get subscription counts by status
    const subscriptionCounts = await prisma.subscription.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Calculate metrics
    const totalSubscriptions = subscriptionCounts.reduce((sum, group) => sum + group._count.id, 0);
    const activeSubscriptions = subscriptionCounts.find(g => g.status === 'active')?._count.id || 0;
    const trialingSubscriptions = subscriptionCounts.find(g => g.status === 'trialing')?._count.id || 0;
    const pastDueSubscriptions = subscriptionCounts.find(g => g.status === 'past_due')?._count.id || 0;
    const canceledSubscriptions = subscriptionCounts.find(g => g.status === 'canceled')?._count.id || 0;

    // Calculate monthly revenue from active subscriptions
    // Assuming Gold=$69, Silver=$29, Bronze=$9 based on typical pricing
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { monthlyLimit: true }
    });

    let monthlyRevenue = 0;
    activeSubs.forEach(sub => {
      if (sub.monthlyLimit === 2500) monthlyRevenue += 69; // Gold
      else if (sub.monthlyLimit === 1000) monthlyRevenue += 29; // Silver
      else if (sub.monthlyLimit === 500) monthlyRevenue += 9; // Bronze
    });

    // Calculate churn rate (canceled in last month vs total active at start of month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const recentCancellations = await prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: {
          gte: oneMonthAgo
        }
      }
    });

    const churnRate = totalSubscriptions > 0 ? (recentCancellations / totalSubscriptions) * 100 : 0;

    return NextResponse.json({
      totalSubscriptions,
      activeSubscriptions,
      trialingSubscriptions,
      pastDueSubscriptions,
      canceledSubscriptions,
      monthlyRevenue,
      churnRate: Math.round(churnRate * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error('Error fetching subscription metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription metrics' },
      { status: 500 }
    );
  }
}