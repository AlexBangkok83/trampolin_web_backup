'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { ChartConfigProvider } from '@/contexts/ChartConfigContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';
import { DoughnutChart } from '@/components/charts/DoughnutChart';
import { ChartConfigPanel } from '@/components/charts/ChartConfigPanel';

type ChartCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
};

const ChartCard = ({ title, description, children, className = '' }: ChartCardProps) => (
  <Card className={className}>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="h-80">{children}</CardContent>
  </Card>
);

export default function DashboardPage() {
  // Sample data - replace with real data from your API
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Sales',
        data: [400, 300, 600, 500],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const pieChartData = {
    labels: ['Desktop', 'Mobile', 'Tablet'],
    datasets: [
      {
        data: [60, 30, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
        ],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Direct', 'Referral', 'Social'],
    datasets: [
      {
        data: [55, 30, 15],
        backgroundColor: [
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
      },
    ],
  };

  return (
    <AuthGuard>
      <ChartConfigProvider>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <div className="flex items-center space-x-2">
                  <ChartConfigPanel />
                  <AuthStatus />
                </div>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <ChartCard
                title="User Growth"
                description="Monthly active users over time"
                className="md:col-span-2"
              >
                <LineChart data={lineChartData} />
              </ChartCard>

              <ChartCard title="Quarterly Sales" description="Sales performance by quarter">
                <BarChart data={barChartData} />
              </ChartCard>

              <ChartCard title="Traffic Sources" description="Distribution of traffic sources">
                <PieChart data={pieChartData} />
              </ChartCard>

              <ChartCard
                title="Revenue Sources"
                description="Breakdown of revenue streams"
                className="md:col-span-2 lg:col-span-1"
              >
                <DoughnutChart data={doughnutChartData} />
              </ChartCard>
            </div>
          </main>
        </div>
      </ChartConfigProvider>
    </AuthGuard>
  );
}
