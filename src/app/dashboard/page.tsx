'use client';

'use client';
import { useState, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { ChartConfigProvider } from '@/contexts/ChartConfigContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Chart } from 'react-chartjs-2';
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
  ChartData,
} from 'chart.js';

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

import { ChartConfigPanel } from '@/components/charts/ChartConfigPanel';
import { RefreshButton } from '@/components/ui/refresh-button';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useChartData } from '@/hooks/useChartData';

// Define chart data types
interface UserGrowthData {
  month: string;
  users: number;
}

interface SalesData {
  quarter: string;
  sales: number;
}

interface TrafficSource {
  device: string;
  percentage: number;
}

interface RevenueSource {
  source: string;
  percentage: number;
}

type ChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  lastUpdated?: Date | null;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
};

const ChartCard = ({
  title,
  description,
  children,
  className = '',
  lastUpdated,
  onRefresh,
  isLoading = false,
}: ChartCardProps) => {
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
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <CardDescription className="text-sm">
            {description}
            {lastUpdated && (
              <span className="text-muted-foreground mt-1 block text-xs">
                Last updated: {format(lastUpdated, 'MMM d, yyyy h:mm a')}
              </span>
            )}
          </CardDescription>
        </div>
        {onRefresh && (
          <RefreshButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing || isLoading}
            size="sm"
            variant="outline"
          />
        )}
      </CardHeader>
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
};

// Mock data fetchers - replace with actual API calls
const fetchUserGrowthData = async () => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { month: 'Jan', users: 65 },
    { month: 'Feb', users: 59 },
    { month: 'Mar', users: 80 },
    { month: 'Apr', users: 81 },
    { month: 'May', users: 56 },
    { month: 'Jun', users: 75 },
  ];
};

const fetchSalesData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { quarter: 'Q1', sales: 400 },
    { quarter: 'Q2', sales: 300 },
    { quarter: 'Q3', sales: 600 },
    { quarter: 'Q4', sales: 500 },
  ];
};

const fetchTrafficData = async (): Promise<TrafficSource[]> => {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [
    { device: 'Desktop', percentage: 60 },
    { device: 'Mobile', percentage: 30 },
    { device: 'Tablet', percentage: 10 },
  ];
};

const fetchRevenueData = async (): Promise<RevenueSource[]> => {
  await new Promise((resolve) => setTimeout(resolve, 450));
  return [
    { source: 'Direct', percentage: 55 },
    { source: 'Referral', percentage: 30 },
    { source: 'Social', percentage: 15 },
  ];
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle global refresh
  const handleGlobalRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    toast({
      title: 'Refreshing data',
      description: 'Updating all charts with the latest data.',
    });
  }, [toast]);

  // Error handler for chart data
  const handleChartError = useCallback(
    (error: Error) => {
      toast({
        title: 'Error fetching chart data',
        description: error.message,
        variant: 'destructive',
      });
    },
    [toast],
  );

  return (
    <AuthGuard>
      <ChartConfigProvider>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <div className="flex items-center space-x-4">
                  <RefreshButton
                    onClick={handleGlobalRefresh}
                    isRefreshing={false}
                    variant="outline"
                    size="default"
                    className="mr-2"
                  >
                    Refresh All
                  </RefreshButton>
                  <ChartConfigPanel />
                  <AuthStatus />
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <UserGrowthChart key={`user-growth-${refreshKey}`} onError={handleChartError} />

              <QuarterlySalesChart key={`sales-${refreshKey}`} onError={handleChartError} />

              <TrafficSourcesChart key={`traffic-${refreshKey}`} onError={handleChartError} />

              <RevenueSourcesChart key={`revenue-${refreshKey}`} onError={handleChartError} />
            </div>
          </main>
        </div>
      </ChartConfigProvider>
    </AuthGuard>
  );
}

// Individual chart components for better code organization
function UserGrowthChart({ onError }: { onError: (error: Error) => void }) {
  const { chartData, isLoading, error, refreshData, lastUpdated } = useChartData<
    UserGrowthData,
    'line'
  >({
    dataFetcher: fetchUserGrowthData,
    xField: 'month',
    yField: 'users',
    label: 'Users',
    type: 'line',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    onError(error);
  }

  return (
    <ChartCard
      title="User Growth"
      description="Monthly active users over time"
      className="md:col-span-2"
      lastUpdated={lastUpdated}
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Chart
        type="line"
        data={chartData as ChartData<'line', number[], string>}
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
  );
}

function QuarterlySalesChart({ onError }: { onError: (error: Error) => void }) {
  const { chartData, isLoading, error, refreshData, lastUpdated } = useChartData<SalesData, 'bar'>({
    dataFetcher: fetchSalesData,
    xField: 'quarter',
    yField: 'sales',
    label: 'Sales',
    type: 'bar',
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });

  if (error) {
    onError(error);
  }

  return (
    <ChartCard
      title="Quarterly Sales"
      description="Sales performance by quarter"
      lastUpdated={lastUpdated}
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Chart
        type="bar"
        data={chartData as ChartData<'bar', number[], string>}
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
  );
}

function TrafficSourcesChart({ onError }: { onError: (error: Error) => void }) {
  const { chartData, isLoading, error, refreshData, lastUpdated } = useChartData<
    TrafficSource,
    'pie'
  >({
    dataFetcher: fetchTrafficData,
    xField: 'device',
    yField: 'percentage',
    label: 'Traffic',
    type: 'pie',
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (error) {
    onError(error);
  }

  return (
    <ChartCard
      title="Traffic Sources"
      description="Distribution of traffic sources"
      lastUpdated={lastUpdated}
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Chart
        type="pie"
        data={chartData as ChartData<'pie', number[], string>}
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
  );
}

function RevenueSourcesChart({ onError }: { onError: (error: Error) => void }) {
  const { chartData, isLoading, error, refreshData, lastUpdated } = useChartData<
    RevenueSource,
    'doughnut'
  >({
    dataFetcher: fetchRevenueData,
    xField: 'source',
    yField: 'percentage',
    label: 'Revenue',
    type: 'doughnut',
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  });

  if (error) {
    onError(error);
  }

  return (
    <ChartCard
      title="Revenue Sources"
      description="Breakdown of revenue streams"
      className="md:col-span-2 lg:col-span-1"
      lastUpdated={lastUpdated}
      onRefresh={refreshData}
      isLoading={isLoading}
    >
      <Chart
        type="doughnut"
        data={chartData as ChartData<'doughnut', number[], string>}
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
  );
}
