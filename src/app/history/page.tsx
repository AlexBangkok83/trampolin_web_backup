'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { generateAnalysisId } from '@/utils/reachUtils';
import { Star } from 'lucide-react';
import ThumbnailChart from '@/components/charts/ThumbnailChart';

interface HistoryItem {
  id: string;
  url: string;
  status: string;
  createdAt: string;
  totalReach: number;
  adCount: number;
  avgReachPerDay: number;
  totalDays: number;
  firstDay: string | null;
  lastDay: string | null;
  reachCategory: string;
  reachColor: string;
  isFavorited?: boolean;
  chartData?: Array<{ date: string; reach: number }>;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function History() {
  const router = useRouter();
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [reachFilter, setReachFilter] = useState('all');
  const [favoritesFilter, setFavoritesFilter] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Fetch real chart data for history items that don't have saved chart data (backwards compatibility)
  const fetchRealChartData = async (
    url: string,
  ): Promise<Array<{ date: string; reach: number; adCount: number }>> => {
    try {
      const chartResponse = await fetch('/api/ads/historical-reach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (chartResponse.ok) {
        const chartResult = await chartResponse.json();

        if (chartResult.success && chartResult.data && chartResult.data.length > 0) {
          return chartResult.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching chart data for', url, error);
      return [];
    }
  };

  const fetchHistory = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '10',
          search: searchTerm,
          timeFilter,
          reachFilter,
        });

        const response = await fetch(`/api/history?${params}`);
        if (response.ok) {
          const result = await response.json();

          // Handle both new analyses (with saved chart data) and old analyses (need to fetch chart data)
          const dataWithCharts = await Promise.all(
            (result.data || []).map(async (item: HistoryItem) => {
              // If the item already has chart data (new analyses), use it
              if (item.chartData && item.chartData.length > 0) {
                return {
                  ...item,
                  chartData: item.chartData,
                };
              }

              // If no saved chart data (old analyses), fetch it live for backwards compatibility
              if (item.totalReach > 0) {
                const realChartData = await fetchRealChartData(item.url);
                return {
                  ...item,
                  chartData: realChartData.map((point) => ({
                    date: point.date,
                    reach: point.reach,
                  })),
                };
              }

              // No data available
              return {
                ...item,
                chartData: [],
              };
            }),
          );

          setHistoryData(dataWithCharts);
          setPagination(result.pagination);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error(
            'Failed to fetch history:',
            response.status,
            errorData.error || 'Unknown error',
          );

          // If unauthorized, show empty state rather than error
          if (response.status === 401) {
            setHistoryData([]);
            setPagination({
              currentPage: 1,
              totalPages: 1,
              totalCount: 0,
              hasNext: false,
              hasPrev: false,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, timeFilter, reachFilter],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // Check if it's the same day
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'Today';

    // Calculate calendar day difference correctly
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = Math.abs(nowOnly.getTime() - dateOnly.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleReAnalyze = async (url: string) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: [url] }),
      });

      if (response.ok) {
        // Generate hash-based ID for the new analysis
        const cleanUrl = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const analysisId = generateAnalysisId(cleanUrl);

        // Navigate to the new analysis page
        router.push(`/analysis/${analysisId}`);
      }
    } catch (error) {
      console.error('Error re-analyzing URL:', error);
    }
  };

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoritedProducts');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Toggle favorite status
  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoritedProducts', JSON.stringify([...newFavorites]));
  };

  // Filter history data based on favorites filter
  const filteredHistoryData = historyData.filter((item) => {
    if (favoritesFilter === 'favorites-only') {
      return favorites.has(item.id);
    }
    return true;
  });

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search History</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            View all your previous product analyses
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-64 flex-1">
              <input
                type="text"
                placeholder="Search by product URL or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              />
            </div>
            <div>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              >
                <option value="all">All time</option>
                <option value="last7days">Last 7 days</option>
                <option value="last30days">Last 30 days</option>
                <option value="last3months">Last 3 months</option>
              </select>
            </div>
            <div>
              <select
                value={reachFilter}
                onChange={(e) => setReachFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              >
                <option value="all">All results</option>
                <option value="high">High reach (&gt;10K)</option>
                <option value="medium">Medium reach (5K-10K)</option>
                <option value="low">Low reach (&lt;5K)</option>
              </select>
            </div>
            <div>
              <select
                value={favoritesFilter}
                onChange={(e) => setFavoritesFilter(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
              >
                <option value="all">All products</option>
                <option value="favorites-only">Favorites only</option>
              </select>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/20">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Product URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Reach
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Date Analyzed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        Loading history...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredHistoryData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-gray-400">
                      <svg
                        className="mx-auto mb-4 h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="mb-1 text-lg font-medium text-gray-900 dark:text-white">
                        No search history found
                      </p>
                      <p className="text-sm">
                        Start by analyzing some product URLs on the analyze page.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistoryData.map((item) => {
                  // Extract domain from URL for display
                  const displayName =
                    item.url.split('/').pop()?.replace(/-/g, ' ')?.replace(/\?.*$/, '') ||
                    'Unknown Product';

                  return (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                            {displayName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{item.url}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {item.chartData && item.chartData.length > 0 ? (
                          <div className="h-10 w-24">
                            <ThumbnailChart
                              data={item.chartData}
                              color={
                                item.reachColor?.includes('green')
                                  ? '#10B981'
                                  : item.reachColor?.includes('blue')
                                    ? '#3B82F6'
                                    : item.reachColor?.includes('yellow')
                                      ? '#F59E0B'
                                      : '#6B7280'
                              }
                              height={40}
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-24 items-center justify-center rounded bg-gray-100 dark:bg-gray-700">
                            <span className="text-xs text-gray-400">No data</span>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className={`text-sm font-bold ${item.reachColor}`}>
                          {formatReach(item.totalReach)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.avgReachPerDay > 0 && (
                            <>
                              {formatReach(item.avgReachPerDay)}/day
                              {item.totalDays > 0 && ` • ${item.totalDays} days`}
                            </>
                          )}
                          {item.avgReachPerDay === 0 && (
                            <>
                              {item.reachCategory === 'high' && 'High performer'}
                              {item.reachCategory === 'medium' && 'Medium reach'}
                              {item.reachCategory === 'low' && 'Low reach'}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => toggleFavorite(item.id)}
                            className={`rounded-full p-1 transition-colors ${
                              favorites.has(item.id)
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={
                              favorites.has(item.id) ? 'Remove from favorites' : 'Add to favorites'
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${favorites.has(item.id) ? 'fill-current' : ''}`}
                            />
                          </button>
                          <a
                            href={`/analysis/${item.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View Results
                          </a>
                          <button
                            onClick={() => handleReAnalyze(item.url)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Re-analyze
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * 10, pagination.totalCount)}
            </span>{' '}
            of <span className="font-medium">{pagination.totalCount}</span> results
          </div>
          <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
            <button
              onClick={() => pagination.hasPrev && fetchHistory(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className={`relative inline-flex items-center rounded-l-md border border-gray-300 px-2 py-2 text-sm font-medium transition-colors ${
                pagination.hasPrev
                  ? 'bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  : 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-500'
              }`}
            >
              Previous
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => fetchHistory(pageNum)}
                  className={`relative inline-flex items-center border border-gray-300 px-4 py-2 text-sm font-medium transition-colors ${
                    isCurrentPage
                      ? 'bg-blue-50 text-blue-600 dark:border-gray-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => pagination.hasNext && fetchHistory(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className={`relative inline-flex items-center rounded-r-md border border-gray-300 px-2 py-2 text-sm font-medium transition-colors ${
                pagination.hasNext
                  ? 'bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  : 'cursor-not-allowed bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-500'
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trampolin</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Analyze Facebook ads reach data to discover winning products and track competitor
                performance.
              </p>
              {/* Social Icons */}
              <div className="mt-4 flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                PRODUCT
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="/analyze"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Product Analysis
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    API Access
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Bulk Export
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                SUPPORT
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Status Page
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Feature Requests
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                LEGAL
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Data Processing Agreement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-700 md:flex-row">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Trampolin. All rights reserved.
            </div>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Security
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Accessibility
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                GDPR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
