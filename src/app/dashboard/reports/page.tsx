'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  FileText,
  TrendingUp,
  BarChart3,
  Download,
  Target,
  Calendar,
  Star,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  getReachCategory,
  generateAnalysisId,
  getHistoricalReachForAnalysis,
} from '@/utils/reachUtils';

interface AnalysisData {
  id: string;
  url: string;
  totalReach: number;
  adCount: number;
  avgReachPerDay: number;
  totalDays: number;
  firstDay: string;
  lastDay: string;
  reachCategory: string;
  reachColor: string;
  createdAt: Date;
}

export default function ReportsPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoritedProducts');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }

    // Load analysis data
    const loadAnalysisData = () => {
      const staticData = [
        {
          url: 'clipia.se/products/clipia',
          adCount: 83,
          totalDays: 20,
          firstDay: '2025-08-15',
          lastDay: '2025-09-04',
          createdAt: new Date('2025-09-05T10:00:00Z'),
        },
        {
          url: 'hemmaro.se/products/muslintacke',
          adCount: 2,
          totalDays: 17,
          firstDay: '2025-08-18',
          lastDay: '2025-09-03',
          createdAt: new Date('2025-09-04T15:30:00Z'),
        },
        {
          url: 'happified.se/products/glimra-eldlykta',
          adCount: 5,
          totalDays: 15,
          firstDay: '2025-08-19',
          lastDay: '2025-09-02',
          createdAt: new Date('2025-09-03T08:45:00Z'),
        },
      ];

      const enrichedData: AnalysisData[] = staticData.map((item) => {
        const id = generateAnalysisId(item.url);
        const totalReach = getHistoricalReachForAnalysis(id, item.createdAt);
        const { category: reachCategory, color: reachColor } = getReachCategory(totalReach);
        const avgReachPerDay = item.totalDays > 0 ? Math.round(totalReach / item.totalDays) : 0;

        return {
          id,
          url: item.url,
          totalReach,
          adCount: item.adCount,
          avgReachPerDay,
          totalDays: item.totalDays,
          firstDay: item.firstDay,
          lastDay: item.lastDay,
          reachCategory,
          reachColor,
          createdAt: item.createdAt,
        };
      });

      setAnalysisData(enrichedData);
      setLoading(false);
    };

    loadAnalysisData();
  }, []);

  const totalReach = analysisData.reduce((sum, item) => sum + item.totalReach, 0);
  const totalAds = analysisData.reduce((sum, item) => sum + item.adCount, 0);
  const avgDailyReach =
    analysisData.length > 0
      ? Math.round(
          analysisData.reduce((sum, item) => sum + item.avgReachPerDay, 0) / analysisData.length,
        )
      : 0;
  const favoriteCount = analysisData.filter((item) => favorites.has(item.id)).length;

  const topPerformer = analysisData.reduce(
    (max, item) => (item.totalReach > (max?.totalReach || 0) ? item : max),
    analysisData[0],
  );

  const exportData = () => {
    const csvContent = [
      [
        'URL',
        'Total Reach',
        'Ad Count',
        'Avg Reach/Day',
        'Campaign Days',
        'Performance Category',
        'Date Range',
      ].join(','),
      ...analysisData.map((item) =>
        [
          item.url,
          item.totalReach,
          item.adCount,
          item.avgReachPerDay,
          item.totalDays,
          item.reachCategory,
          `${item.firstDay} to ${item.lastDay}`,
        ].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advertising-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-gray-300"></div>
          <div className="space-y-4">
            <div className="h-32 rounded bg-gray-300"></div>
            <div className="h-64 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold">Advertising Reports</h1>
          </div>
          <Button onClick={exportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive analysis of advertising performance across all analyzed products
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">
                  {new Intl.NumberFormat().format(totalReach)}
                </div>
                <p className="text-xs text-muted-foreground">Across all campaigns</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{totalAds}</div>
                <p className="text-xs text-muted-foreground">Active advertisements</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Daily Reach</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat().format(avgDailyReach)}
                </div>
                <p className="text-xs text-muted-foreground">Average per day</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Saved Products</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{favoriteCount}</div>
                <p className="text-xs text-muted-foreground">Favorited for tracking</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performer Highlight */}
          {topPerformer && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Top Performing Campaign
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {topPerformer.url}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        Total Reach:{' '}
                        <strong className={topPerformer.reachColor}>
                          {new Intl.NumberFormat().format(topPerformer.totalReach)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>{topPerformer.adCount} ads</span>
                      <span>•</span>
                      <span>{topPerformer.totalDays} days</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/analysis/${topPerformer.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <a
                      href={`https://${topPerformer.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Breakdown</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Detailed analysis of each analyzed product
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData
                  .sort((a, b) => b.totalReach - a.totalReach)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {item.url}
                            </h3>
                            {favorites.has(item.id) && (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            )}
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Total Reach:</span>
                              <div className={`font-semibold ${item.reachColor}`}>
                                {new Intl.NumberFormat().format(item.totalReach)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Ad Count:</span>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.adCount}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Daily Avg:</span>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {new Intl.NumberFormat().format(item.avgReachPerDay)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                              <div className="font-semibold text-gray-900 dark:text-gray-100">
                                {item.totalDays} days
                              </div>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Campaign: {item.firstDay} to {item.lastDay}
                          </div>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <Link href={`/analysis/${item.id}`}>
                            <Button variant="outline" size="sm">
                              View Report
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Insights and Recommendations */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-800 dark:text-green-400">
                      High Performance Leader
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Clipia.se shows exceptional reach with 820K+ impressions and 83 ads,
                      demonstrating strong market penetration.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-400">
                      Campaign Duration Impact
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Longer campaigns (15-20 days) correlate with higher total reach, suggesting
                      sustained advertising drives better results.
                    </p>
                  </div>

                  <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400">
                      Ad Volume Strategy
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      High ad count (80+ ads) appears to drive significantly higher reach,
                      indicating volume-based strategies work well.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-l-indigo-500 bg-gray-50 p-3 dark:bg-gray-800">
                    <h4 className="font-semibold text-indigo-800 dark:text-indigo-400">
                      Scale Successful Campaigns
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Consider extending high-performing campaigns like Clipia.se and increasing ad
                      volume for better reach.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-purple-500 bg-gray-50 p-3 dark:bg-gray-800">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-400">
                      Optimize Underperformers
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Analyze why some products have fewer ads and consider testing different
                      creative approaches or budget allocation.
                    </p>
                  </div>

                  <div className="border-l-4 border-l-green-500 bg-gray-50 p-3 dark:bg-gray-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-400">
                      Monitor Favorites
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Set up alerts for your {favoriteCount} saved products to track performance
                      changes and optimize campaigns proactively.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                Recent Analysis Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-gray-200 py-2 last:border-0 dark:border-gray-700"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.url}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Analyzed{' '}
                          {item.createdAt.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${item.reachColor}`}>
                          {new Intl.NumberFormat().format(item.totalReach)} reach
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.adCount} ads
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
