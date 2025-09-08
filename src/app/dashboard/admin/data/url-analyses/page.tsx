'use client';

import { useState, useEffect, useCallback } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/outline';
// import ThumbnailChart from '@/components/charts/ThumbnailChart';

interface SearchStatItem {
  url: string;
  searchCount: number;
  totalReach: number;
  reachCategory: string;
  reachColor: string;
  status: string;
  firstAnalyzedAt: string | null;
  lastAnalyzedAt: string | null;
  uniqueUsers: number;
  userEmails: string[];
}

interface SearchStatsSummary {
  totalSearches: number;
  uniqueUrls: number;
  urlsWithData: number;
  urlsWithoutData: number;
  averageSearchesPerUrl: number;
}

interface SearchStatsResponse {
  success: boolean;
  data: SearchStatItem[];
  summary: SearchStatsSummary;
}

export default function SearchStatisticsPage() {
  const [searchStats, setSearchStats] = useState<SearchStatItem[]>([]);
  const [summary, setSummary] = useState<SearchStatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSearchStats = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/search-statistics');
      if (response.ok) {
        const data: SearchStatsResponse = await response.json();
        setSearchStats(data.data);
        setSummary(data.summary);
      } else {
        console.error('Failed to fetch search statistics');
      }
    } catch (error) {
      console.error('Error fetching search statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearchStats();
  }, [fetchSearchStats]);

  // Filter data based on search term
  const filteredStats = searchStats.filter((item) =>
    item.url.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Search Statistics</h1>
            <p className="mt-2 text-sm text-gray-600">
              Analyze which URLs users search for most frequently and their performance metrics.
            </p>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MagnifyingGlassIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Searches</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(summary.totalSearches)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Unique URLs</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(summary.uniqueUrls)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">URLs With Data</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(summary.urlsWithData)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                      <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">URLs No Data</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatNumber(summary.urlsWithoutData)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-xs font-semibold text-blue-600">Ø</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Avg Searches/URL</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {summary.averageSearchesPerUrl}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Filter */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-md border-gray-300 py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Statistics Table */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Search Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Reach
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    First/Last Analyzed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <span className="ml-2 text-gray-600">Loading search statistics...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStats.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <MagnifyingGlassIcon className="mx-auto mb-4 h-12 w-12" />
                        <p className="text-lg font-medium">No search statistics found</p>
                        <p className="text-sm">No URL analyses have been performed yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStats.map((item, index) => (
                    <tr key={item.url} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {/* Search Count - Featured as the first column */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <span className="text-sm font-bold text-blue-600">
                              {item.searchCount}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-xs text-gray-500">searches</p>
                          </div>
                        </div>
                      </td>

                      {/* Product URL */}
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <p
                            className="truncate text-sm font-medium text-gray-900"
                            title={item.url}
                          >
                            {item.url}
                          </p>
                          <p className="text-xs text-gray-500">{item.url.split('/')[0]}</p>
                        </div>
                      </td>

                      {/* Reach */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                              item.reachColor === 'text-green-600'
                                ? 'bg-green-100 text-green-800'
                                : item.reachColor === 'text-yellow-600'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : item.reachColor === 'text-red-600'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {formatNumber(item.totalReach)}
                          </div>
                          <p className="mt-1 text-xs capitalize text-gray-500">
                            {item.reachCategory}
                          </p>
                        </div>
                      </td>

                      {/* Users */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.uniqueUsers} users
                          </p>
                          <div className="text-xs text-gray-500">
                            {item.userEmails.slice(0, 2).map((email) => (
                              <div key={email}>{email}</div>
                            ))}
                            {item.userEmails.length > 2 && (
                              <div>+{item.userEmails.length - 2} more</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* First/Last Analyzed */}
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        <div>
                          <p>First: {formatDate(item.firstAnalyzedAt)}</p>
                          <p>Last: {formatDate(item.lastAnalyzedAt)}</p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            item.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : item.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Summary */}
          {!loading && filteredStats.length > 0 && (
            <div className="mt-6 text-sm text-gray-700">
              Showing {filteredStats.length} of {searchStats.length} URLs
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
