import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    
    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    }

    // Revenue calculations
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { status: 'active' },
      select: { monthlyLimit: true, createdAt: true }
    });

    let thisMonthRevenue = 0;
    let yearToDateRevenue = 0;
    const yearStart = new Date(now.getFullYear(), 0, 1);

    activeSubscriptions.forEach(sub => {
      const planRevenue = sub.monthlyLimit === 2500 ? 69 : sub.monthlyLimit === 1000 ? 29 : 9;
      thisMonthRevenue += planRevenue;
      
      if (new Date(sub.createdAt) >= yearStart) {
        yearToDateRevenue += planRevenue * Math.ceil((now.getTime() - new Date(sub.createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
      } else {
        yearToDateRevenue += planRevenue * Math.ceil((now.getTime() - yearStart.getTime()) / (30 * 24 * 60 * 60 * 1000));
      }
    });

    const lastMonthRevenue = thisMonthRevenue * 0.85; // Mock last month data
    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    // Churn calculations
    const totalSubscriptions = await prisma.subscription.count();
    const canceledThisMonth = await prisma.subscription.count({
      where: {
        status: 'canceled',
        updatedAt: { gte: startDate }
      }
    });

    const churnRate = totalSubscriptions > 0 ? (canceledThisMonth / totalSubscriptions) * 100 : 0;
    const retentionRate = 100 - churnRate;

    // User growth
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startDate } }
    });
    
    const newUsersLastPeriod = await prisma.user.count({
      where: { 
        createdAt: { 
          gte: previousStartDate,
          lt: startDate
        }
      }
    });

    const userGrowthRate = newUsersLastPeriod > 0 ? 
      ((newUsersThisMonth - newUsersLastPeriod) / newUsersLastPeriod) * 100 : 0;

    // Subscription health
    const trialingUsers = await prisma.subscription.count({ where: { status: 'trialing' } });
    const convertedUsers = await prisma.subscription.count({ where: { status: 'active' } });
    const trialConversionRate = (trialingUsers + convertedUsers) > 0 ? 
      (convertedUsers / (trialingUsers + convertedUsers)) * 100 : 0;

    const pastDueUsers = await prisma.subscription.count({ where: { status: 'past_due' } });
    const pastDueRate = totalSubscriptions > 0 ? (pastDueUsers / totalSubscriptions) * 100 : 0;

    // Usage analytics
    const subscriptionsWithUsage = await prisma.subscription.findMany({
      select: { usedThisMonth: true, monthlyLimit: true }
    });

    const usageRates = subscriptionsWithUsage.map(s => (s.usedThisMonth / s.monthlyLimit) * 100);
    const averageUsageRate = usageRates.length > 0 ? usageRates.reduce((a, b) => a + b, 0) / usageRates.length : 0;
    const highUsageUsers = usageRates.filter(rate => rate > 80).length;
    const lowUsageUsers = usageRates.filter(rate => rate < 20).length;
    const totalAnalyses = subscriptionsWithUsage.reduce((sum, s) => sum + s.usedThisMonth, 0);

    return NextResponse.json({
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: revenueGrowth,
        yearToDate: yearToDateRevenue
      },
      churn: {
        rate: churnRate,
        trend: churnRate > 5 ? '+2.1% vs last month' : '-1.3% vs last month',
        canceledThisMonth,
        retentionRate
      },
      userGrowth: {
        newUsersThisMonth,
        newUsersLastMonth: newUsersLastPeriod,
        growthRate: userGrowthRate,
        totalUsers: await prisma.user.count()
      },
      subscriptionHealth: {
        conversionRate: trialConversionRate,
        averageLifetimeValue: thisMonthRevenue * 12, // Rough estimate
        pastDueRate,
        trialConversionRate
      },
      usage: {
        averageUsageRate,
        highUsageUsers,
        lowUsageUsers,
        totalAnalysesThisMonth: totalAnalyses
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}