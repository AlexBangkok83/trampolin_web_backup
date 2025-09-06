'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReachChart from '@/components/charts/ReachChart';
import {
  ArrowLeft,
  GitCompare,
  TrendingUp,
  BarChart3,
  Calendar,
  ExternalLink,
  Target,
  Star,
  RefreshCw,
} from 'lucide-react';
import {
  deductCredits,
  hasEnoughCredits,
  getCreditCost,
  getCurrentCredits,
} from '@/utils/creditUtils';

interface ComparisonProduct {
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

interface ComparisonMetadata {
  id: string;
  productIds: string[];
  comparedAt: Date;
  updatedAt: Date;
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ComparisonProduct[]>([]);
  const [chartData, setChartData] = useState<
    Array<{
      url: string;
      originalUrl: string;
      data: Array<{ date: string; reach: number; adCount: number }>;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [comparisonMetadata, setComparisonMetadata] = useState<ComparisonMetadata | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [credits, setCredits] = useState(() => {
    if (typeof window !== 'undefined') {
      return getCurrentCredits();
    }
    return { available: 0, used: 0, total: 0 };
  });

  // Generate comparison ID from product IDs
  const generateComparisonId = (productIds: string[]) => {
    return productIds.sort().join(',');
  };

  // Toggle star for comparison
  const toggleStar = () => {
    if (!comparisonMetadata) return;

    const starredComparisons = JSON.parse(localStorage.getItem('starredComparisons') || '[]');
    const comparisonId = comparisonMetadata.id;

    let newStarredComparisons;
    if (isStarred) {
      newStarredComparisons = starredComparisons.filter((id: string) => id !== comparisonId);
    } else {
      newStarredComparisons = [...starredComparisons, comparisonId];
    }

    localStorage.setItem('starredComparisons', JSON.stringify(newStarredComparisons));
    setIsStarred(!isStarred);
  };

  // Reanalyze all products in comparison
  const handleReanalyzeAll = async () => {
    if (!comparisonMetadata) return;

    // Calculate credit cost (1 credit per product)
    const productCount = comparisonMetadata.productIds.length;
    const creditCost = productCount * getCreditCost('comparison_reanalysis');

    // Check if user has enough credits
    if (!hasEnoughCredits(creditCost)) {
      alert(
        `Insufficient credits! You need ${creditCost} credits to reanalyze ${productCount} products, but you only have ${credits.available} credits available.`,
      );
      return;
    }

    // Confirm the action
    if (
      !confirm(
        `Reanalyzing ${productCount} products will cost ${creditCost} credits. Do you want to continue?`,
      )
    ) {
      return;
    }

    setIsReanalyzing(true);

    // Deduct credits first
    const success = deductCredits(creditCost);
    if (!success) {
      alert('Failed to deduct credits. Please try again.');
      setIsReanalyzing(false);
      return;
    }

    // Update local credits state
    setCredits(getCurrentCredits());

    // Simulate reanalysis - in real app this would trigger actual analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update the comparison metadata
    const updatedMetadata = {
      ...comparisonMetadata,
      updatedAt: new Date(),
    };

    setComparisonMetadata(updatedMetadata);

    // Store updated metadata in localStorage
    const comparisons = JSON.parse(localStorage.getItem('comparisonMetadata') || '{}');
    comparisons[comparisonMetadata.id] = updatedMetadata;
    localStorage.setItem('comparisonMetadata', JSON.stringify(comparisons));

    setIsReanalyzing(false);
  };

  useEffect(() => {
    const productIds = searchParams.get('products')?.split(',') || [];

    if (productIds.length < 2) {
      setLoading(false);
      return;
    }

    // Generate comparison ID and check if it's starred
    const comparisonId = generateComparisonId(productIds);
    const starredComparisons = JSON.parse(localStorage.getItem('starredComparisons') || '[]');
    setIsStarred(starredComparisons.includes(comparisonId));

    // Load or create comparison metadata
    const storedComparisons = JSON.parse(localStorage.getItem('comparisonMetadata') || '{}');
    let metadata = storedComparisons[comparisonId];

    if (!metadata) {
      metadata = {
        id: comparisonId,
        productIds,
        comparedAt: new Date(),
        updatedAt: new Date(),
      };
      storedComparisons[comparisonId] = metadata;
      localStorage.setItem('comparisonMetadata', JSON.stringify(storedComparisons));
    }

    setComparisonMetadata(metadata);

    const loadProducts = async () => {
      try {
        // Fetch all analyses from the history API
        const response = await fetch('/api/history?page=1&limit=100');
        if (!response.ok) {
          throw new Error('Failed to fetch analyses');
        }

        const result = await response.json();
        if (!result.success || !result.data) {
          throw new Error('Invalid response from history API');
        }

        // Filter analyses to only include the requested product IDs
        const allAnalyses = result.data;
        const loadedProducts: ComparisonProduct[] = [];

        for (const productId of productIds) {
          const analysis = allAnalyses.find(
            (item: {
              id: string;
              totalReach: number;
              url: string;
              adCount: number;
              avgReachPerDay: number;
              totalDays: number;
              firstDay: string;
              lastDay: string;
              reachCategory: string;
              reachColor: string;
              createdAt: string;
            }) => item.id === productId,
          );
          if (analysis && analysis.totalReach > 0) {
            loadedProducts.push({
              id: analysis.id,
              url: analysis.url,
              totalReach: analysis.totalReach,
              adCount: analysis.adCount,
              avgReachPerDay: analysis.avgReachPerDay,
              totalDays: analysis.totalDays,
              firstDay: analysis.firstDay,
              lastDay: analysis.lastDay,
              reachCategory: analysis.reachCategory,
              reachColor: analysis.reachColor,
              createdAt: new Date(analysis.createdAt),
            });
          }
        }

        setProducts(loadedProducts);
        setLoading(false);

        // Generate chart data using real historical data for each product
        if (loadedProducts.length > 0) {
          setChartLoading(true);

          try {
            const chartDataResults = await Promise.all(
              loadedProducts.map(async (product) => {
                // Fetch real historical data for this product's URL
                const chartResponse = await fetch('/api/ads/historical-reach', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url: product.url }),
                });

                if (chartResponse.ok) {
                  const chartResult = await chartResponse.json();
                  if (chartResult.success && chartResult.data && chartResult.data.length > 0) {
                    return {
                      url: `https://${product.url}`,
                      originalUrl: product.url,
                      data: chartResult.data,
                    };
                  }
                }

                // Fallback to empty data if historical data fetch fails
                return {
                  url: `https://${product.url}`,
                  originalUrl: product.url,
                  data: [],
                };
              }),
            );

            setChartData(chartDataResults);
          } catch (error) {
            console.error('Error fetching chart data:', error);
          } finally {
            setChartLoading(false);
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="animate-pulse">
          <div className="mb-6 h-8 w-1/3 rounded bg-gray-300"></div>
          <div className="mb-6 h-64 rounded bg-gray-300"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (products.length < 2) {
    return (
      <div className="container mx-auto py-6">
        <Link href="/saved">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Saved Products
          </Button>
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <GitCompare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No products to compare
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              You need at least 2 products selected to make a comparison.
            </p>
            <Link href="/saved">
              <Button>Go to Saved Products</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate comparison metrics
  const topPerformer = products.reduce(
    (max, product) => (product.totalReach > max.totalReach ? product : max),
    products[0],
  );
  const totalReach = products.reduce((sum, product) => sum + product.totalReach, 0);
  const totalAds = products.reduce((sum, product) => sum + product.adCount, 0);
  const avgDailyReach = Math.round(
    products.reduce((sum, product) => sum + product.avgReachPerDay, 0) / products.length,
  );

  return (
    <div className="container mx-auto py-6">
      <Link href="/saved">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Saved Products
        </Button>
      </Link>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GitCompare className="h-6 w-6 text-indigo-600" />
              <span>Product Comparison</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="mr-2 text-sm text-gray-600 dark:text-gray-400">
                Credits: {credits.available}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleStar}
                className={`p-2 ${isStarred ? 'text-amber-500' : 'text-gray-400'}`}
              >
                <Star className={`h-5 w-5 ${isStarred ? 'fill-amber-500' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReanalyzeAll}
                disabled={isReanalyzing}
                className="flex items-center gap-2"
                title={
                  comparisonMetadata ? `Cost: ${comparisonMetadata.productIds.length} credits` : ''
                }
              >
                <RefreshCw className={`h-4 w-4 ${isReanalyzing ? 'animate-spin' : ''}`} />
                {isReanalyzing ? 'Reanalyzing...' : 'Reanalyze All'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Comparing {products.length} products side by side
              </h1>
              {comparisonMetadata && (
                <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {(() => {
                    const comparedAt = new Date(comparisonMetadata.comparedAt);
                    const updatedAt = new Date(comparisonMetadata.updatedAt);
                    const isUpdated = comparedAt.getTime() !== updatedAt.getTime();

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
                          <p>Compared at {formatTimestamp(comparedAt)}</p>
                          <p>Updated at {formatTimestamp(updatedAt)}</p>
                        </>
                      );
                    } else {
                      return <p>Compared at {formatTimestamp(comparedAt)}</p>;
                    }
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Combined Reach</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {new Intl.NumberFormat().format(totalReach)}
            </div>
            <p className="text-xs text-muted-foreground">Total across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAds}</div>
            <p className="text-xs text-muted-foreground">Combined ad count</p>
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
            <p className="text-xs text-muted-foreground">Average per product</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {topPerformer.url.split('/').pop()?.replace(/-/g, ' ')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Intl.NumberFormat().format(topPerformer.totalReach)} reach
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Chart */}
      {(chartData.length > 0 || chartLoading) && (
        <div className="mb-8">
          <ReachChart datasets={chartData} isLoading={chartLoading} />
        </div>
      )}

      {/* Product Comparison Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Side-by-side comparison of key metrics
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    Total Reach
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    Ad Count
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    Avg/Day
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody>
                {products
                  .sort((a, b) => b.totalReach - a.totalReach)
                  .map((product, index) => (
                    <tr
                      key={product.id}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        index === 0
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {product.url.split('/').pop()?.replace(/-/g, ' ')}
                            </div>
                            <div className="max-w-xs truncate text-sm text-gray-500 dark:text-gray-400">
                              {product.url}
                            </div>
                          </div>
                          <div className="ml-4 flex items-center gap-2">
                            <Link href={`/analysis/${product.id}`}>
                              <Button variant="outline" size="sm">
                                Details
                              </Button>
                            </Link>
                            <a
                              href={`https://${product.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button variant="outline" size="sm" className="px-2">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`font-bold ${product.reachColor}`}>
                          {new Intl.NumberFormat().format(product.totalReach)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {product.adCount}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {new Intl.NumberFormat().format(product.avgReachPerDay)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-gray-900 dark:text-gray-100">
                        {product.totalDays} days
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.reachCategory === 'high'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : product.reachCategory === 'medium'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {index === 0 && '👑 '}
                          {product.reachCategory}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length > 1 && (
              <>
                <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                  <h4 className="mb-1 font-semibold text-blue-800 dark:text-blue-400">
                    Performance Gap Analysis
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    The top performer has{' '}
                    {(
                      topPerformer.totalReach / Math.min(...products.map((p) => p.totalReach)) -
                      1
                    ).toFixed(1)}
                    x more reach than the lowest performer, indicating significant opportunity for
                    optimization.
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                  <h4 className="mb-1 font-semibold text-green-800 dark:text-green-400">
                    Ad Volume Strategy
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Products with higher ad counts ({Math.max(...products.map((p) => p.adCount))} vs{' '}
                    {Math.min(...products.map((p) => p.adCount))}) tend to achieve better reach,
                    suggesting volume-based strategies are effective.
                  </p>
                </div>

                <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                  <h4 className="mb-1 font-semibold text-amber-800 dark:text-amber-400">
                    Campaign Duration Impact
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Average campaign duration varies from{' '}
                    {Math.min(...products.map((p) => p.totalDays))} to{' '}
                    {Math.max(...products.map((p) => p.totalDays))} days. Longer campaigns may
                    benefit from sustained market presence.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
