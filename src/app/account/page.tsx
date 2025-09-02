'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AccountData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: string | null;
    createdAt: string;
  };
  subscription: {
    id: string;
    status: string;
    plan: string;
    pricePerMonth: number;
    monthlyLimit: number;
    usedThisMonth: number;
    trialLimit: number;
    trialUsed: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
  };
  stats: {
    totalAnalyses: number;
    completedAnalyses: number;
    savedProducts: number;
  };
}

export default function Account() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [accountData, setAccountData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      fetchAccountData();
    }
  }, [status, session, router]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account');
      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }
      const data = await response.json();
      setAccountData(data);
    } catch (error) {
      console.error('Error fetching account data:', error);
      setError('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: FormData) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/account', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      await fetchAccountData(); // Refresh data
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      past_due: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      unpaid: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    return (
      <span
        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.canceled}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="flex">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-4xl">
              <div className="py-12 text-center">
                <div className="text-gray-600 dark:text-gray-300">Loading your account...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="flex">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-4xl">
              <div className="py-12 text-center">
                <div className="text-red-600 dark:text-red-400">
                  {error || 'Failed to load account'}
                </div>
                <button
                  onClick={fetchAccountData}
                  className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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

  const { user, subscription, stats } = accountData;
  const isTrialing = subscription.status === 'trialing';
  const currentUsage = isTrialing ? subscription.trialUsed : subscription.usedThisMonth;
  const currentLimit = isTrialing ? subscription.trialLimit : subscription.monthlyLimit;
  const usagePercentage = (currentUsage / currentLimit) * 100;

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Account Settings
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Manage your account and subscription settings.
                </p>
              </div>

              <div className="space-y-8">
                {/* Profile Information */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                    Profile Information
                  </h2>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleUpdateProfile(formData);
                    }}
                  >
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          defaultValue={user.name}
                          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          defaultValue={user.email}
                          className="mt-1 block w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-gray-900 shadow-sm dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                          disabled
                        />
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Email cannot be changed for security reasons
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={updating}
                        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {updating ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Subscription Details */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                    Subscription Details
                  </h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Current Plan
                      </h3>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          {subscription.plan} Plan
                        </span>
                        {getStatusBadge(subscription.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {isTrialing ? 'Trial Period' : `$${subscription.pricePerMonth}/month`}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Usage This Period
                      </h3>
                      <div className="mt-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-900 dark:text-white">
                            {currentUsage} / {currentLimit} searches
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {Math.round(usagePercentage)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Billing Period
                      </h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(subscription.currentPeriodStart)} -{' '}
                        {formatDate(subscription.currentPeriodEnd)}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Account Created
                      </h3>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {subscription.cancelAtPeriodEnd && (
                    <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Your subscription is scheduled to cancel at the end of the current billing
                        period.
                      </p>
                    </div>
                  )}
                </div>

                {/* Usage Statistics */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">
                    Usage Statistics
                  </h2>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalAnalyses}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Analyses</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.completedAnalyses}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.savedProducts}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Saved Products</div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <h2 className="mb-6 text-lg font-semibold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border border-red-200 p-4 dark:border-red-800">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Cancel Subscription
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Cancel your subscription at the end of the current billing period.
                        </p>
                      </div>
                      <button className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
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
                Analyze Facebook ads reach data to discover winning products and track competitor performance.
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
                  <a href="/analyze" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Product Analysis
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Status Page
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Data Processing Agreement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Security
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Accessibility
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                GDPR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
