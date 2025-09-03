'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    growth: number;
    yearToDate: number;
  };
  churn: {
    rate: number;
    trend: string;
    canceledThisMonth: number;
    retentionRate: number;
  };
  userGrowth: {
    newUsersThisMonth: number;
    newUsersLastMonth: number;
    growthRate: number;
    totalUsers: number;
  };
  subscriptionHealth: {
    conversionRate: number;
    averageLifetimeValue: number;
    pastDueRate: number;
    trialConversionRate: number;
  };
  usage: {
    averageUsageRate: number;
    highUsageUsers: number;
    lowUsageUsers: number;
    totalAnalysesThisMonth: number;
  };
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]); // fetchAnalytics recreated on each render, but only depends on timeframe

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?timeframe=${timeframe}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
              <p className="text-gray-600 mt-1">Revenue insights, churn analysis, and growth metrics</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Revenue Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Growth</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="This Month Revenue"
                value={analytics ? formatCurrency(analytics.revenue.thisMonth) : '$0'}
                icon={CurrencyDollarIcon}
                loading={loading}
                change={analytics ? {
                  value: `${analytics.revenue.growth > 0 ? '+' : ''}${analytics.revenue.growth.toFixed(1)}%`,
                  type: analytics.revenue.growth > 0 ? 'increase' : analytics.revenue.growth < 0 ? 'decrease' : 'neutral'
                } : undefined}
              />
              <MetricCard
                title="Year to Date"
                value={analytics ? formatCurrency(analytics.revenue.yearToDate) : '$0'}
                icon={ChartBarIcon}
                loading={loading}
              />
              <MetricCard
                title="User Growth Rate"
                value={analytics ? formatPercentage(analytics.userGrowth.growthRate) : '0%'}
                icon={analytics?.userGrowth.growthRate > 0 ? TrendingUpIcon : TrendingDownIcon}
                loading={loading}
              />
              <MetricCard
                title="New Users"
                value={analytics?.userGrowth.newUsersThisMonth || 0}
                icon={UserGroupIcon}
                loading={loading}
              />
            </div>
          </div>

          {/* Churn & Retention Metrics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Churn & Retention Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Monthly Churn Rate"
                value={analytics ? formatPercentage(analytics.churn.rate) : '0%'}
                icon={analytics?.churn.rate > 5 ? ExclamationTriangleIcon : ChartBarIcon}
                loading={loading}
                change={analytics ? {
                  value: analytics.churn.trend,
                  type: analytics.churn.trend.includes('+') ? 'decrease' : 'increase' // Higher churn is bad
                } : undefined}
              />
              <MetricCard
                title="Retention Rate"
                value={analytics ? formatPercentage(analytics.churn.retentionRate) : '0%'}
                icon={UserGroupIcon}
                loading={loading}
              />
              <MetricCard
                title="Canceled This Month"
                value={analytics?.churn.canceledThisMonth || 0}
                icon={TrendingDownIcon}
                loading={loading}
              />
              <MetricCard
                title="Trial Conversion"
                value={analytics ? formatPercentage(analytics.subscriptionHealth.trialConversionRate) : '0%'}
                icon={ClockIcon}
                loading={loading}
              />
            </div>
          </div>

          {/* Subscription Health */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MetricCard
                title="Avg Lifetime Value"
                value={analytics ? formatCurrency(analytics.subscriptionHealth.averageLifetimeValue) : '$0'}
                icon={CurrencyDollarIcon}
                loading={loading}
              />
              <MetricCard
                title="Past Due Rate"
                value={analytics ? formatPercentage(analytics.subscriptionHealth.pastDueRate) : '0%'}
                icon={ExclamationTriangleIcon}
                loading={loading}
              />
              <MetricCard
                title="Conversion Rate"
                value={analytics ? formatPercentage(analytics.subscriptionHealth.conversionRate) : '0%'}
                icon={TrendingUpIcon}
                loading={loading}
              />
            </div>
          </div>

          {/* Usage Analytics */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Avg Usage Rate"
                value={analytics ? formatPercentage(analytics.usage.averageUsageRate) : '0%'}
                icon={ChartBarIcon}
                loading={loading}
              />
              <MetricCard
                title="Total Analyses"
                value={analytics?.usage.totalAnalysesThisMonth || 0}
                icon={CalendarDaysIcon}
                loading={loading}
              />
              <MetricCard
                title="High Usage Users"
                value={analytics?.usage.highUsageUsers || 0}
                icon={TrendingUpIcon}
                loading={loading}
              />
              <MetricCard
                title="Low Usage Users"
                value={analytics?.usage.lowUsageUsers || 0}
                icon={TrendingDownIcon}
                loading={loading}
              />
            </div>
          </div>

          {/* Key Insights */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h2>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                {analytics.churn.rate > 10 && (
                  <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">High Churn Alert</p>
                      <p className="text-sm text-red-700">Monthly churn rate is {formatPercentage(analytics.churn.rate)} - consider retention initiatives.</p>
                    </div>
                  </div>
                )}
                
                {analytics.revenue.growth > 20 && (
                  <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <TrendingUpIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Strong Growth</p>
                      <p className="text-sm text-green-700">Revenue grew {formatPercentage(analytics.revenue.growth)} this month!</p>
                    </div>
                  </div>
                )}
                
                {analytics.usage.lowUsageUsers > analytics.usage.highUsageUsers * 2 && (
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Engagement Opportunity</p>
                      <p className="text-sm text-yellow-700">Many users have low usage - consider onboarding improvements or engagement campaigns.</p>
                    </div>
                  </div>
                )}
                
                {analytics.subscriptionHealth.trialConversionRate < 15 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <ClockIcon className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Trial Conversion Issue</p>
                      <p className="text-sm text-blue-700">Trial conversion rate is only {formatPercentage(analytics.subscriptionHealth.trialConversionRate)} - review trial experience.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No insights available</p>
            )}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}