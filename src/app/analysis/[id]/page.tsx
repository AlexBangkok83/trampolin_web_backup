'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  Target,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import ReachChart from '@/components/charts/ReachChart';

interface AnalysisResult {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  firstAnalyzedAt: string;
  lastUpdatedAt: string;
  totalReach: number;
  adCount: number;
  avgReachPerDay: number;
  totalDays: number;
  firstDay: string | null;
  lastDay: string | null;
  reachCategory: string;
  reachColor: string;
}

export default function ResultPage() {
  const params = useParams();
  // const router = useRouter(); // unused
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [chartData, setChartData] = useState<
    Array<{
      url: string;
      originalUrl: string;
      data: Array<{ date: string; reach: number; adCount: number }>;
    }>
  >([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch(`/api/analysis/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch result');
        }
        const data = await response.json();
        setAnalysis(data.analysis);

        // Handle both new analyses (with saved chart data) and old analyses (need to fetch chart data)
        if (data.analysis?.chartData && data.analysis.chartData.length > 0) {
          // Use saved chart data from the database (new analyses)
          setChartData([
            {
              url: `https://${data.analysis.url}`,
              originalUrl: data.analysis.url,
              data: data.analysis.chartData,
            },
          ]);
          setChartLoading(false);
        } else if (data.analysis?.url && data.analysis.totalReach > 0) {
          // Fetch chart data live for old analyses that don't have saved data
          setChartLoading(true);

          try {
            // Fetch real historical data from the server
            const chartResponse = await fetch('/api/ads/historical-reach', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url: data.analysis.url }),
            });

            if (chartResponse.ok) {
              const chartResult = await chartResponse.json();

              if (chartResult.success && chartResult.data && chartResult.data.length > 0) {
                // Use real historical data
                setChartData([
                  {
                    url: `https://${data.analysis.url}`,
                    originalUrl: data.analysis.url,
                    data: chartResult.data,
                  },
                ]);
              } else {
                // No historical data available - show empty chart
                setChartData([]);
              }
            } else {
              // API failed - show empty chart
              setChartData([]);
            }
          } catch (error) {
            console.error('Error fetching historical data:', error);
            // Error - show empty chart
            setChartData([]);
          }

          setChartLoading(false);
        } else {
          // No saved chart data and no reach data - show empty chart
          setChartData([]);
          setChartLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchResult();
    }
  }, [params.id]);

  // Load favorite status from localStorage
  useEffect(() => {
    if (params.id) {
      const savedFavorites = localStorage.getItem('favoritedProducts');
      if (savedFavorites) {
        const favorites = JSON.parse(savedFavorites);
        setIsFavorited(favorites.includes(params.id));
      }
    }
  }, [params.id]);

  // Toggle favorite status
  const toggleFavorite = () => {
    const savedFavorites = localStorage.getItem('favoritedProducts');
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    if (isFavorited) {
      // Remove from favorites
      const newFavorites = favorites.filter((id: string) => id !== params.id);
      localStorage.setItem('favoritedProducts', JSON.stringify(newFavorites));
      setIsFavorited(false);
    } else {
      // Add to favorites
      const newFavorites = [...favorites, params.id];
      localStorage.setItem('favoritedProducts', JSON.stringify(newFavorites));
      setIsFavorited(true);
    }
  };

  const handleReAnalyze = async () => {
    if (!analysis) return;

    setIsReanalyzing(true);
    try {
      // Use just the clean URL without protocol for the API call
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: [analysis.url] }),
      });

      const data = await response.json();

      if (response.ok) {
        // Wait a moment then refresh to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        console.error('Re-analyze failed:', data.error || 'Unknown error');
        alert(`Re-analysis failed: ${data.error || 'Unknown error'}`);
        setIsReanalyzing(false);
      }
    } catch (error) {
      console.error('Error re-analyzing:', error);
      alert('Re-analysis failed due to network error');
      setIsReanalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-gray-300"></div>
          <div className="space-y-4">
            <div className="h-32 rounded bg-gray-300"></div>
            <div className="h-64 rounded bg-gray-300"></div>
            <div className="h-48 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="container mx-auto py-6">
        <Link href="/history">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">{error || 'Analysis not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Link href="/history">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
      </Link>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-indigo-600" />
              <span>Analysis Result</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleReAnalyze}
                disabled={isReanalyzing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                {isReanalyzing ? 'Re-analyzing...' : 'Re-analyze'}
              </Button>
              <Button
                onClick={toggleFavorite}
                variant="ghost"
                size="sm"
                className={`p-2 ${
                  isFavorited
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
              <a
                href={`https://${analysis.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Visit Page
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {analysis.url}
              </h1>
              <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  const firstAnalyzed = new Date(analysis.firstAnalyzedAt);
                  const lastUpdated = new Date(analysis.lastUpdatedAt);
                  const isUpdated = firstAnalyzed.getTime() !== lastUpdated.getTime();

                  const formatTimestamp = (date: Date) =>
                    `${date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}, ${date.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short',
                    })}`;

                  if (isUpdated) {
                    return (
                      <>
                        <p>Analyzed at {formatTimestamp(firstAnalyzed)}</p>
                        <p>Updated at {formatTimestamp(lastUpdated)}</p>
                      </>
                    );
                  } else {
                    return <p>Analyzed at {formatTimestamp(firstAnalyzed)}</p>;
                  }
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analysis.reachColor}`}>
              {new Intl.NumberFormat().format(analysis.totalReach)}
            </div>
            <p className="text-xs text-muted-foreground">{analysis.reachCategory} performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ad Count</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analysis.adCount}
            </div>
            <p className="text-xs text-muted-foreground">Active advertisements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg/Day</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {new Intl.NumberFormat().format(analysis.avgReachPerDay)}
            </div>
            <p className="text-xs text-muted-foreground">Daily average reach</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {analysis.totalDays}
            </div>
            <p className="text-xs text-muted-foreground">Campaign duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Reach Chart */}
      {(chartData.length > 0 || chartLoading) && (
        <div className="mb-6">
          <ReachChart datasets={chartData} isLoading={chartLoading} />
        </div>
      )}

      {/* Analysis Details */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Analysis Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">Date Range</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {analysis.firstDay && analysis.lastDay
                  ? `${analysis.firstDay} to ${analysis.lastDay}`
                  : 'Date range not available'}
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
                Performance Category
              </h3>
              <p className={`font-medium capitalize ${analysis.reachColor}`}>
                {analysis.reachCategory} reach
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Product Information Section */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-500 dark:text-gray-400">Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Coming Soon: Detailed product information from Shopify scraping
            </p>
            <div className="grid grid-cols-1 gap-4 text-sm text-gray-400 md:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium">Product Details</h4>
                <p>Title, description, pricing, variants</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium">Ad Copy Analysis</h4>
                <p>Messaging, headlines, call-to-actions</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="mb-2 font-medium">Performance Insights</h4>
                <p>Conversion metrics, engagement data</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
