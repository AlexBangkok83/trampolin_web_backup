'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

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
          <Sidebar currentPage="account" />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 p-8">
              <div className="mx-auto max-w-4xl">
                <div className="py-12 text-center">
                  <div className="text-gray-600 dark:text-gray-300">Loading your account...</div>
                </div>
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    );
  }

  if (error || !accountData) {
    return (
      <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
        <div className="flex">
          <Sidebar currentPage="account" />
          <div className="flex flex-1 flex-col">
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
            <Footer />
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
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="flex">
        <Sidebar currentPage="account" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-4xl">
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
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
