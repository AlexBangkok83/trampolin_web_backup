'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface CustomerDetails {
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

export default function AdminCustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
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
    subscriptionStatus: '',
  });

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/users/${customerId}`);

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.user);
        const currentSubscription = data.user.subscriptions?.[0];
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          roleId: data.user.role?.id || '',
          monthlyLimit: currentSubscription?.monthlyLimit || 0,
          subscriptionStatus: currentSubscription?.status || 'none',
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load customer details');
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/roles');
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      Promise.all([fetchCustomerDetails(), fetchRoles()]);
    }
  }, [customerId, fetchCustomerDetails, fetchRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/users/${customerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push(`/dashboard/admin/customer/${customerId}`);
      } else {
        const error = await response.json();
        setError(error.message || 'Failed to update customer');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError('Failed to update customer');
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
              <div className="h-8 w-1/4 rounded bg-gray-200"></div>
              <div className="space-y-4">
                <div className="h-64 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  if (error || !customer) {
    return (
      <AuthGuard requiredRole="admin">
        <AdminLayout>
          <div className="p-6">
            <div className="py-12 text-center">
              <h3 className="text-lg font-medium text-gray-900">Error</h3>
              <p className="mt-2 text-sm text-gray-500">{error || 'Customer not found'}</p>
              <Link
                href="/dashboard/admin/users"
                className="mt-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Back to Customers
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
                href={`/dashboard/admin/customer/${customerId}`}
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Back to Customer
              </Link>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">Edit Customer</h1>
            <p className="text-gray-600">
              Modify customer details, role, and subscription settings
            </p>
          </div>

          <div className="max-w-2xl">
            {/* Edit Form */}
            <div className="rounded-lg bg-white shadow">
              <form onSubmit={handleSubmit}>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
                </div>

                <div className="space-y-6 px-6 py-6">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                      <UserIcon className="mr-2 inline h-4 w-4" />
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Customer's full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                      <EnvelopeIcon className="mr-2 inline h-4 w-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">
                      <ShieldCheckIcon className="mr-2 inline h-4 w-4" />
                      Role
                    </label>
                    <select
                      id="role"
                      value={formData.roleId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, roleId: e.target.value }))}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subscription Status */}
                  <div>
                    <label
                      htmlFor="subscriptionStatus"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      <CreditCardIcon className="mr-2 inline h-4 w-4" />
                      Subscription Status
                    </label>
                    <select
                      id="subscriptionStatus"
                      value={formData.subscriptionStatus}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, subscriptionStatus: e.target.value }))
                      }
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
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
                      <label
                        htmlFor="monthlyLimit"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Monthly Usage Limit
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          id="monthlyLimit"
                          value={formData.monthlyLimit === 999999 ? '' : formData.monthlyLimit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              monthlyLimit: e.target.value ? parseInt(e.target.value) : 0,
                            }))
                          }
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Monthly limit"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, monthlyLimit: 999999 }))}
                          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Unlimited
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.monthlyLimit === 999999
                          ? 'Unlimited usage'
                          : `${formData.monthlyLimit.toLocaleString()} analyses per month`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                  <Link
                    href={`/dashboard/admin/customer/${customerId}`}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
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
