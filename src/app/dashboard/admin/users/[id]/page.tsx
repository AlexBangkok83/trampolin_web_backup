'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  CalendarIcon,
  CreditCardIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  role: {
    name: string;
  } | null;
  createdAt: string;
  subscriptions: Array<{
    id: string;
    status: string;
    monthlyLimit: number;
    usedThisMonth: number;
    createdAt: string;
    updatedAt: string;
  }>;
  urlAnalyses: Array<{
    id: string;
    url: string;
    results: Record<string, unknown>;
    createdAt: string;
  }>;
}

export default function AdminUserDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load user details');
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId, fetchUserDetails]);

  const handleDeleteUser = async () => {
    if (
      !user ||
      !confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/admin/users');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    }
  };

  const handleLoginAs = async () => {
    if (
      !user ||
      !confirm(
        `Are you sure you want to login as ${user.email}? You will be redirected to the regular dashboard as that user.`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();

        // Store impersonation info in localStorage
        localStorage.setItem(
          'impersonating',
          JSON.stringify({
            originalAdmin: session?.user?.email,
            targetUser: data.targetUser,
            startTime: new Date().toISOString(),
          }),
        );

        // Redirect to main dashboard as the impersonated user
        window.location.href = `/dashboard?impersonating=${userId}&token=${data.impersonationToken}`;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start impersonation');
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      alert('Failed to start impersonation');
    }
  };

  if (loading) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="p-6">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-32 rounded bg-gray-200"></div>
                <div className="h-48 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !user) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="p-6">
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-sm text-gray-500">{error || 'User not found'}</p>
              <Link
                href="/dashboard/admin/users"
                className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  const currentSubscription = user.subscriptions[0];

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard/admin/users"
                  className="inline-flex items-center text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Back to Users
                </Link>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/admin/users/${userId}/edit`}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit User
                </Link>

                <button
                  onClick={handleLoginAs}
                  className="inline-flex items-center rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-100"
                >
                  <UserCircleIcon className="mr-2 h-4 w-4" />
                  Login As User
                </button>

                {user.role?.name !== 'admin' && (
                  <button
                    onClick={handleDeleteUser}
                    className="inline-flex items-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="mb-8 rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-xl font-medium text-white">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name || 'No name set'}</h1>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      {user.role?.name === 'admin' && (
                        <ShieldCheckIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                          user.role?.name === 'admin'
                            ? 'border-red-200 bg-red-100 text-red-800'
                            : 'border-blue-200 bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role?.name || 'user'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Joined{' '}
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Subscription Details */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900">
                  <CreditCardIcon className="mr-2 h-5 w-5" />
                  Subscription Details
                </h3>
              </div>
              <div className="px-6 py-4">
                {currentSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                          currentSubscription.status === 'active'
                            ? 'border-green-200 bg-green-100 text-green-800'
                            : currentSubscription.status === 'trialing'
                              ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                              : 'border-red-200 bg-red-100 text-red-800'
                        }`}
                      >
                        {currentSubscription.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Monthly Limit</span>
                      <span className="text-sm text-gray-900">
                        {currentSubscription.monthlyLimit === 999999
                          ? '∞'
                          : currentSubscription.monthlyLimit.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-500">Used This Month</span>
                      <span className="text-sm text-gray-900">
                        {currentSubscription.usedThisMonth.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <div className="mb-1 flex justify-between text-sm text-gray-500">
                        <span>Usage</span>
                        <span>
                          {Math.round(
                            (currentSubscription.usedThisMonth / currentSubscription.monthlyLimit) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentSubscription.usedThisMonth / currentSubscription.monthlyLimit >
                            0.8
                              ? 'bg-red-500'
                              : currentSubscription.usedThisMonth /
                                    currentSubscription.monthlyLimit >
                                  0.6
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min((currentSubscription.usedThisMonth / currentSubscription.monthlyLimit) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Created: {new Date(currentSubscription.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Updated: {new Date(currentSubscription.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No Subscription</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      This user does not have an active subscription
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="flex items-center text-lg font-medium text-gray-900">
                  <ChartBarIcon className="mr-2 h-5 w-5" />
                  Recent URL Analyses
                </h3>
              </div>
              <div className="px-6 py-4">
                {user.urlAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {user.urlAnalyses.map((analysis) => (
                      <div
                        key={analysis.id}
                        className="flex items-center justify-between border-b border-gray-100 py-2 last:border-b-0"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {((analysis.results as Record<string, unknown>)?.title as string) ||
                              analysis.url}
                          </p>
                          <p className="truncate text-xs text-gray-500">{analysis.url}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No URL Analyses</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      This user has not analyzed any URLs yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Subscriptions History */}
          {user.subscriptions.length > 1 && (
            <div className="mt-8 rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">Subscription History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Monthly Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {user.subscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${
                              subscription.status === 'active'
                                ? 'border-green-200 bg-green-100 text-green-800'
                                : subscription.status === 'trialing'
                                  ? 'border-yellow-200 bg-yellow-100 text-yellow-800'
                                  : 'border-red-200 bg-red-100 text-red-800'
                            }`}
                          >
                            {subscription.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {subscription.monthlyLimit === 999999
                            ? '∞'
                            : subscription.monthlyLimit.toLocaleString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(subscription.createdAt).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {new Date(subscription.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
