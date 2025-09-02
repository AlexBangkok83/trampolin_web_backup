'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, PieChart, DoughnutChart } from '@/components/charts';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';

export default function AnalyticsDashboard() {
  const { data, loading, error, refetch } = useAnalyticsData();

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 py-6">
        <Skeleton className="mb-6 h-10 w-64" />
        <div className="grid gap-6">
          <Skeleton className="h-80 w-full" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-6">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error?.message || 'Failed to load analytics data'}</p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={refetch}
                  className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Analytics Dashboard"
      description="Visualize your data with interactive charts and metrics"
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Uploads Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart
                  data={data.uploadsOverTime}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File Size Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <DoughnutChart
                  data={data.fileSizeDistribution}
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Uploads Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <LineChart
                data={data.uploadsOverTime}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upload Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="h-80">
                  <PieChart
                    data={data.statusDistribution}
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
                </div>
                <div className="h-80">
                  <BarChart
                    data={data.statusDistribution}
                    options={{
                      indexAxis: 'y' as const,
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          ticks: {
                            precision: 0,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rows Processed Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <LineChart
                data={data.rowsOverTime}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>File Size vs. Rows Processed</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <BarChart
                data={{
                  labels: data.fileSizeDistribution.labels,
                  datasets: [
                    {
                      label: 'Number of Files',
                      data: data.fileSizeDistribution.datasets[0].data,
                      backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
