'use client';

// Removed unused useState import
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, DoughnutChart } from '@/components/charts';
import { useChartData } from '@/hooks/useChartData';

// Sample data for demonstration
const sampleData = [
  { month: 'Jan', revenue: 4000, users: 100, churn: 5 },
  { month: 'Feb', revenue: 3000, users: 150, churn: 3 },
  { month: 'Mar', revenue: 5000, users: 200, churn: 7 },
  { month: 'Apr', revenue: 2780, users: 180, churn: 4 },
  { month: 'May', revenue: 1890, users: 250, churn: 6 },
  { month: 'Jun', revenue: 2390, users: 300, churn: 2 },
  { month: 'Jul', revenue: 3490, users: 350, churn: 8 },
];

export default function AnalyticsDashboard() {
  // Use the custom hook for different chart data
  const { chartData: revenueData } = useChartData<{ month: string; revenue: number }, 'line'>({
    data: sampleData,
    xField: 'month',
    yField: 'revenue',
    label: 'Revenue',
    type: 'line',
  });

  const { chartData: usersData } = useChartData<{ month: string; users: number }, 'line'>({
    data: sampleData,
    xField: 'month',
    yField: 'users',
    label: 'Active Users',
    type: 'line',
  });

  const { chartData: churnData } = useChartData<{ month: string; churn: number }, 'bar'>({
    data: sampleData,
    xField: 'month',
    yField: 'churn',
    label: 'Churn Rate',
    type: 'bar',
  });

  const { chartData: revenueBarData } = useChartData<{ month: string; revenue: number }, 'bar'>({
    data: sampleData,
    xField: 'month',
    yField: 'revenue',
    label: 'Revenue',
    type: 'bar',
  });

  const { chartData: pieData } = useChartData<{ month: string; revenue: number }, 'doughnut'>({
    data: sampleData.slice(0, 4), // Only show first 4 months for pie chart
    xField: 'month',
    yField: 'revenue',
    label: 'Revenue by Month',
    type: 'doughnut',
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-3xl font-bold">Analytics Dashboard</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span className="text-muted-foreground h-4 w-4">💰</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${sampleData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </div>
                <p className="text-muted-foreground text-xs">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <span className="text-muted-foreground h-4 w-4">👥</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sampleData[sampleData.length - 1].users}</div>
                <p className="text-muted-foreground text-xs">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Churn</CardTitle>
                <span className="text-muted-foreground h-4 w-4">📉</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    sampleData.reduce((sum, item) => sum + item.churn, 0) / sampleData.length
                  ).toFixed(1)}
                  %
                </div>
                <p className="text-muted-foreground text-xs">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <span className="text-muted-foreground h-4 w-4">🔥</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-muted-foreground text-xs">+201 since last hour</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <LineChart data={revenueData} className="h-[300px]" />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Revenue by Month</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <DoughnutChart data={pieData} className="h-[300px]" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart data={revenueBarData} className="h-[400px]" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <LineChart
                data={usersData}
                className="h-[400px]"
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: 'Monthly Active Users',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Churn Rate</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <BarChart
                data={churnData}
                className="h-[400px]"
                options={{
                  plugins: {
                    title: {
                      display: true,
                      text: 'Monthly Churn Rate (%)',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Churn Rate (%)',
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
