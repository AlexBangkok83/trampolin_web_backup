'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import Footer from '../../../components/Footer';

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
}

export default function TrampolinDashboard() {
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

    if (status === 'loading') return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [status, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const isTrialing = dashboardData.subscription.status === 'trialing';
  const usagePercentage = isTrialing 
    ? Math.round((dashboardData.subscription.trialUsed / dashboardData.subscription.trialLimit) * 100)
    : Math.round((dashboardData.subscription.usedThisMonth / dashboardData.subscription.monthlyLimit) * 100);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900" suppressHydrationWarning>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {dashboardData.user.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here&apos;s your Trampolin analytics overview
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Usage Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isTrialing ? 'Trial Usage' : 'Monthly Usage'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isTrialing 
                      ? `${dashboardData.subscription.trialUsed} of ${dashboardData.subscription.trialLimit} searches`
                      : `${dashboardData.subscription.usedThisMonth} of ${dashboardData.subscription.monthlyLimit} searches`
                    }
                  </p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{usagePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage >= 90 ? 'bg-red-500' : 
                      usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  ></div>
                </div>
                {usagePercentage >= 90 && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    ⚠️ You&apos;re running low on searches
                  </p>
                )}
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {dashboardData.subscription.plan} Plan
                  </p>
                </div>
                <div className="text-2xl">💳</div>
              </div>
              
              <div className="mt-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  dashboardData.subscription.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : dashboardData.subscription.status === 'trialing'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                }`}>
                  {isTrialing ? 'Free Trial' : dashboardData.subscription.status}
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">
                  ${dashboardData.subscription.pricePerMonth}/month
                </p>
              </div>
            </div>

            {/* Total Analyses Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Analyses</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All time</p>
                </div>
                <div className="text-2xl">🔍</div>
              </div>
              
              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.urlAnalyses.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  URLs analyzed
                </p>
              </div>
            </div>
          </div>

          {/* Recent Analyses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Analyses</h2>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => router.push('/analyze')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Analysis
                  </button>
                  <button 
                    onClick={() => router.push('/history')}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {dashboardData.urlAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.urlAnalyses.slice(0, 5).map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {analysis.url}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          analysis.status === 'completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : analysis.status === 'processing'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                            : analysis.status === 'failed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}>
                          {analysis.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start by analyzing your first URL to see insights and reach data.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => router.push('/analyze')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Analysis
                    </button>
                    <button 
                      onClick={() => router.push('/saved')}
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Search History
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}