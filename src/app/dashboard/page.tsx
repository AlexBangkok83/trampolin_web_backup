'use client';

import { useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { format } from 'date-fns';
import { useChartData } from '@/hooks/useChartData';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Data types for our charts
type UserGrowthData = {
  month: string;
  users: number;
};

type SalesData = {
  quarter: string;
  sales: number;
};

type TrafficSource = {
  device: string;
  percentage: number;
};

type RevenueSource = {
  source: string;
  percentage: number;
};

// Chart card component
const ChartCard = ({
  title,
  description,
  children,
  className = '',
  lastUpdated,
  onRefresh,
  isLoading = false,
  error,
  retryCount,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
  retryCount?: number;
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={`rounded-lg bg-white p-6 shadow dark:bg-gray-800 ${className}`}>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh data"
          >
            {isLoading || isRefreshing ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="h-64">
        {error ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mb-2 text-red-500">
                <svg
                  className="mx-auto h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
              {retryCount && retryCount > 0 && (
                <p className="mt-1 text-xs text-gray-500">Retry attempt: {retryCount}/3</p>
              )}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="mt-2 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        ) : (
          children
        )}
      </div>
      {lastUpdated && (
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
          </p>
          <div className="flex items-center gap-1">
            <div
              className={`h-2 w-2 rounded-full ${
                Date.now() - lastUpdated.getTime() < 60000
                  ? 'bg-green-500'
                  : Date.now() - lastUpdated.getTime() < 300000
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            ></div>
            <span className="text-xs text-gray-400">
              {Date.now() - lastUpdated.getTime() < 60000
                ? 'Fresh'
                : Date.now() - lastUpdated.getTime() < 300000
                  ? 'Recent'
                  : 'Stale'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data fetchers
const fetchUserGrowthData = async (): Promise<UserGrowthData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { month: 'Jan', users: 100 },
        { month: 'Feb', users: 150 },
        { month: 'Mar', users: 200 },
        { month: 'Apr', users: 180 },
        { month: 'May', users: 250 },
        { month: 'Jun', users: 300 },
      ]);
    }, 500);
  });
};

const fetchSalesData = async (): Promise<SalesData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { quarter: 'Q1', sales: 12000 },
        { quarter: 'Q2', sales: 15000 },
        { quarter: 'Q3', sales: 18000 },
        { quarter: 'Q4', sales: 20000 },
      ]);
    }, 500);
  });
};

const fetchTrafficData = async (): Promise<TrafficSource[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { device: 'Desktop', percentage: 65 },
        { device: 'Mobile', percentage: 30 },
        { device: 'Tablet', percentage: 5 },
      ]);
    }, 500);
  });
};

const fetchRevenueData = async (): Promise<RevenueSource[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { source: 'Products', percentage: 60 },
        { source: 'Services', percentage: 30 },
        { source: 'Subscriptions', percentage: 10 },
      ]);
    }, 500);
  });
};

export default function DashboardPage() {
  // User Growth Chart
  const {
    chartData: userGrowthData,
    isLoading: isUserGrowthLoading,
    refreshData: refreshUserGrowth,
    lastUpdated: userGrowthLastUpdated,
    error: userGrowthError,
    retryCount: userGrowthRetryCount,
  } = useChartData<UserGrowthData, 'line'>({
    dataFetcher: fetchUserGrowthData,
    xField: 'month',
    yField: 'users',
    label: 'Users',
    type: 'line',
    refreshInterval: 300, // 5 minutes
  });

  // Sales Chart
  const {
    chartData: salesData,
    isLoading: isSalesLoading,
    refreshData: refreshSales,
    lastUpdated: salesLastUpdated,
    error: salesError,
    retryCount: salesRetryCount,
  } = useChartData<SalesData, 'bar'>({
    dataFetcher: fetchSalesData,
    xField: 'quarter',
    yField: 'sales',
    label: 'Sales ($)',
    type: 'bar',
    refreshInterval: 300, // 5 minutes
  });

  // Traffic Sources Chart
  const {
    chartData: trafficData,
    isLoading: isTrafficLoading,
    refreshData: refreshTraffic,
    lastUpdated: trafficLastUpdated,
    error: trafficError,
    retryCount: trafficRetryCount,
  } = useChartData<TrafficSource, 'doughnut'>({
    dataFetcher: fetchTrafficData,
    xField: 'device',
    yField: 'percentage',
    label: 'Traffic Sources',
    type: 'doughnut',
    refreshInterval: 300, // 5 minutes
  });

  // Revenue Sources Chart
  const {
    chartData: revenueData,
    isLoading: isRevenueLoading,
    refreshData: refreshRevenue,
    lastUpdated: revenueLastUpdated,
    error: revenueError,
    retryCount: revenueRetryCount,
  } = useChartData<RevenueSource, 'pie'>({
    dataFetcher: fetchRevenueData,
    xField: 'source',
    yField: 'percentage',
    label: 'Revenue Sources',
    type: 'pie',
    refreshInterval: 300, // 5 minutes
  });

  // Handle refresh all charts
  const refreshAll = useCallback(() => {
    refreshUserGrowth();
    refreshSales();
    refreshTraffic();
    refreshRevenue();
  }, [refreshUserGrowth, refreshSales, refreshTraffic, refreshRevenue]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <button
            onClick={refreshAll}
            className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* User Growth */}
          <ChartCard
            title="User Growth"
            description="Monthly active users over time"
            isLoading={isUserGrowthLoading}
            onRefresh={refreshUserGrowth}
            lastUpdated={userGrowthLastUpdated}
            error={userGrowthError}
            retryCount={userGrowthRetryCount}
          >
            <Line data={userGrowthData} />
          </ChartCard>

          {/* Sales */}
          <ChartCard
            title="Sales Performance"
            description="Quarterly sales figures"
            isLoading={isSalesLoading}
            onRefresh={refreshSales}
            lastUpdated={salesLastUpdated}
            error={salesError}
            retryCount={salesRetryCount}
          >
            <Bar data={salesData} />
          </ChartCard>

          {/* Traffic Sources */}
          <ChartCard
            title="Traffic Sources"
            description="Device breakdown of website traffic"
            isLoading={isTrafficLoading}
            onRefresh={refreshTraffic}
            lastUpdated={trafficLastUpdated}
            error={trafficError}
            retryCount={trafficRetryCount}
          >
            <Doughnut data={trafficData} />
          </ChartCard>

          {/* Revenue Sources */}
          <ChartCard
            title="Revenue Sources"
            description="Revenue breakdown by source"
            isLoading={isRevenueLoading}
            onRefresh={refreshRevenue}
            lastUpdated={revenueLastUpdated}
            error={revenueError}
            retryCount={revenueRetryCount}
          >
            <Pie data={revenueData} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
