'use client';

import { useState, useCallback, useEffect } from 'react';
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
  ChartType,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { format } from 'date-fns';

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
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
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
      <div className="h-64">{children}</div>
      {lastUpdated && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
        </p>
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

// Custom hook for chart data
const useChartData = <T extends Record<string, unknown>, K extends ChartType>(options: {
  dataFetcher: () => Promise<T[]>;
  xField: keyof T;
  yField: keyof T;
  label: string;
  type: K;
  refreshInterval?: number;
}) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await options.dataFetcher();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();

    if (options.refreshInterval) {
      const interval = setInterval(fetchData, options.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refreshInterval]);

  // Format data for Chart.js
  const chartData = {
    labels: data.map((item) => String(item[options.xField])),
    datasets: [
      {
        label: options.label,
        data: data.map((item) => Number(item[options.yField])),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(8, 145, 178, 0.8)',
          'rgba(6, 95, 70, 0.8)',
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(8, 145, 178, 1)',
          'rgba(6, 95, 70, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return {
    chartData,
    isLoading,
    error,
    refreshData: fetchData,
    lastUpdated,
  };
};

export default function DashboardPage() {
  // User Growth Chart
  const {
    chartData: userGrowthData,
    isLoading: isUserGrowthLoading,
    refreshData: refreshUserGrowth,
    lastUpdated: userGrowthLastUpdated,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 dark:bg-gray-900">
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
          >
            <Chart
              type="line"
              data={userGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </ChartCard>

          {/* Sales */}
          <ChartCard
            title="Quarterly Sales"
            description="Sales performance by quarter"
            isLoading={isSalesLoading}
            onRefresh={refreshSales}
            lastUpdated={salesLastUpdated}
          >
            <Chart
              type="bar"
              data={salesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </ChartCard>

          {/* Traffic Sources */}
          <ChartCard
            title="Traffic Sources"
            description="Distribution of traffic by device"
            isLoading={isTrafficLoading}
            onRefresh={refreshTraffic}
            lastUpdated={trafficLastUpdated}
          >
            <Chart
              type="doughnut"
              data={trafficData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </ChartCard>

          {/* Revenue Sources */}
          <ChartCard
            title="Revenue Sources"
            description="Breakdown of revenue by category"
            isLoading={isRevenueLoading}
            onRefresh={refreshRevenue}
            lastUpdated={revenueLastUpdated}
          >
            <Chart
              type="pie"
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                  },
                },
              }}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
