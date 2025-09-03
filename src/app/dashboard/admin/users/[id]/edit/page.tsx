'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';

interface UserDetails {
  id: string;
  name: string | null;
  email: string | null;
  role: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  subscriptions: Array<{
    id: string;
    status: string;
    monthlyLimit: number;
    usedThisMonth: number;
  }>;
}

interface Role {
  id: string;
  name: string;
}

export default function AdminUserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<UserDetails | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    monthlyLimit: 0,
    subscriptionStatus: ''
  });

  useEffect(() => {
    if (userId) {
      Promise.all([fetchUserDetails(), fetchRoles()]);
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
        const currentSubscription = data.user.subscriptions[0];
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          roleId: data.user.role?.id || '',
          monthlyLimit: currentSubscription?.monthlyLimit || 0,
          subscriptionStatus: currentSubscription?.status || 'none'
        });
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

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/admin/users/${userId}`);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update user');
    } finally {
      setSaving(false);
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
                <div className="h-64 bg-gray-200 rounded"></div>
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

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/admin/users/${userId}`}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back to User
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Edit User</h1>
            <p className="text-gray-600">Modify user details, role, and subscription settings</p>
          </div>

          <div className="max-w-2xl">
            {/* Edit Form */}
            <div className="bg-white rounded-lg shadow">
              <form onSubmit={handleSubmit}>
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">User Information</h3>
                </div>
                
                <div className="px-6 py-6 space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      <UserIcon className="h-4 w-4 inline mr-2" />
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="User's full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      <EnvelopeIcon className="h-4 w-4 inline mr-2" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      <ShieldCheckIcon className="h-4 w-4 inline mr-2" />
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.roleId}
                      onChange={(e) => setFormData(prev => ({ ...prev, roleId: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <label htmlFor="subscriptionStatus" className="block text-sm font-medium text-gray-700 mb-1">
                      <CreditCardIcon className="h-4 w-4 inline mr-2" />
                      Subscription Status
                    </label>
                    <select
                      id="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="none">No Subscription</option>
                      <option value="trialing">Trial</option>
                      <option value="active">Active</option>
                      <option value="past_due">Past Due</option>
                      <option value="canceled">Canceled</option>
                    </select>
                  </div>

                  {/* Monthly Limit */}
                  {formData.subscriptionStatus !== 'none' && (
                    <div>
                      <label htmlFor="monthlyLimit" className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Usage Limit
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          id="monthlyLimit"
                          value={formData.monthlyLimit === 999999 ? '' : formData.monthlyLimit}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            monthlyLimit: e.target.value ? parseInt(e.target.value) : 0 
                          }))}
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Monthly limit"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, monthlyLimit: 999999 }))}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          Unlimited
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.monthlyLimit === 999999 ? 'Unlimited usage' : `${formData.monthlyLimit.toLocaleString()} analyses per month`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                  <Link
                    href={`/dashboard/admin/users/${userId}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </Link>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}