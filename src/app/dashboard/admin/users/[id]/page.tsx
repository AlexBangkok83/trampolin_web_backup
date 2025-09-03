'use client';

import { useState, useEffect } from 'react';
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
    results: any;
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

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/users/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user || !confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
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
    if (!user || !confirm(`Are you sure you want to login as ${user.email}? You will be redirected to the regular dashboard as that user.`)) {
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
        localStorage.setItem('impersonating', JSON.stringify({
          originalAdmin: session?.user?.email,
          targetUser: data.targetUser,
          startTime: new Date().toISOString()
        }));

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
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
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
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-sm text-gray-500">{error || 'User not found'}</p>
              <Link
                href="/dashboard/admin/users"
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
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
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Users
                </Link>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/admin/users/${userId}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit User
                </Link>
                
                <button
                  onClick={handleLoginAs}
                  className="inline-flex items-center px-3 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                >
                  <UserCircleIcon className="h-4 w-4 mr-2" />
                  Login As User
                </button>
                
                {user.role?.name !== 'admin' && (
                  <button
                    onClick={handleDeleteUser}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete User
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xl">
                    {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {user.name || 'No name set'}
                  </h1>
                  <p className="text-gray-500">{user.email}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <div className="flex items-center space-x-1">
                      {user.role?.name === 'admin' && (
                        <ShieldCheckIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        user.role?.name === 'admin'
                          ? 'bg-red-100 text-red-800 border-red-200'
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                      }`}>
                        {user.role?.name || 'user'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscription Details */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Subscription Details
                </h3>
              </div>
              <div className="px-6 py-4">
                {currentSubscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Status</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                        currentSubscription.status === 'active'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : currentSubscription.status === 'trialing'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {currentSubscription.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Monthly Limit</span>
                      <span className="text-sm text-gray-900">
                        {currentSubscription.monthlyLimit === 999999 ? '∞' : currentSubscription.monthlyLimit.toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Used This Month</span>
                      <span className="text-sm text-gray-900">
                        {currentSubscription.usedThisMonth.toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Usage</span>
                        <span>
                          {Math.round((currentSubscription.usedThisMonth / currentSubscription.monthlyLimit) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            currentSubscription.usedThisMonth / currentSubscription.monthlyLimit > 0.8 
                              ? 'bg-red-500' 
                              : currentSubscription.usedThisMonth / currentSubscription.monthlyLimit > 0.6 
                              ? 'bg-yellow-500' 
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((currentSubscription.usedThisMonth / currentSubscription.monthlyLimit) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Created: {new Date(currentSubscription.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(currentSubscription.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No Subscription</h4>
                    <p className="mt-1 text-sm text-gray-500">This user does not have an active subscription</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Recent URL Analyses
                </h3>
              </div>
              <div className="px-6 py-4">
                {user.urlAnalyses.length > 0 ? (
                  <div className="space-y-3">
                    {user.urlAnalyses.map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {(analysis.results as any)?.title || analysis.url}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {analysis.url}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(analysis.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No URL Analyses</h4>
                    <p className="mt-1 text-sm text-gray-500">This user has not analyzed any URLs yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Subscriptions History */}
          {user.subscriptions.length > 1 && (
            <div className="mt-8 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Subscription History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.subscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${
                            subscription.status === 'active'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : subscription.status === 'trialing'
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                          }`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {subscription.monthlyLimit === 999999 ? '∞' : subscription.monthlyLimit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(subscription.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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