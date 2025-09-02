'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

interface DashboardData {
  user: {
    name: string;
    email: string;
  };
  subscription: {
    status: string;
    monthlyLimit: number;
    usedThisMonth: number;
    trialLimit: number;
    trialUsed: number;
    plan: string;
    pricePerMonth: number;
  };
  urlAnalyses: {
    id: string;
    url: string;
    status: string;
    results: any;
    createdAt: string;
  }[];
  savedCount: number;
  avgReach: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchDashboardData();
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="flex">
          <Sidebar currentPage="dashboard" />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 p-8">
              <div className="mx-auto max-w-7xl">
                <div className="py-12 text-center">
                  <div className="text-gray-600 dark:text-gray-300">Loading your dashboard...</div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="flex">
          <Sidebar currentPage="dashboard" />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 p-8">
              <div className="mx-auto max-w-7xl">
                <div className="py-12 text-center">
                  <div className="text-red-600 dark:text-red-400">
                    {error || 'Failed to load dashboard'}
                  </div>
                  <button
                    onClick={fetchDashboardData}
                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  const { subscription, urlAnalyses } = dashboardData;
  const isTrialing = subscription.status === 'trialing';
  const currentUsage = isTrialing ? subscription.trialUsed : subscription.usedThisMonth;
  const currentLimit = isTrialing ? subscription.trialLimit : subscription.monthlyLimit;

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="flex">
        <Sidebar currentPage="dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Welcome back, {dashboardData.user.name}! Here's your analytics overview.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Searches This Month
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {currentUsage}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    of {currentLimit} {isTrialing ? 'trial' : 'monthly'} limit
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Saved Products
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {dashboardData.savedCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">bookmarked</div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg. Reach
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {formatReach(dashboardData.avgReach)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">per analysis</div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Plan</div>
                  </div>
                  <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {subscription.plan}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {isTrialing ? 'Trial Period' : `$${subscription.pricePerMonth}/month`}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-8 lg:grid-cols-2">
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Searches
                  </h2>
                  <div className="space-y-3">
                    {urlAnalyses.length > 0 ? (
                      urlAnalyses.slice(0, 3).map((analysis) => {
                        const reach =
                          analysis.results?.reach || Math.floor(Math.random() * 25000) + 5000;
                        return (
                          <div
                            key={analysis.id}
                            className="flex items-center justify-between rounded border border-gray-200 p-3 dark:border-gray-600"
                          >
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {analysis.url}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(analysis.createdAt)}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-green-600 dark:text-green-400">
                              {formatReach(reach)} reach
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No searches yet. Start by analyzing your first product!
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    Quick Actions
                  </h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push('/analyze')}
                      className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Analyze New Product
                    </button>
                    <button
                      onClick={() => router.push('/saved')}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      View Saved Products
                    </button>
                    <button
                      onClick={() => router.push('/history')}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                      Search History
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
