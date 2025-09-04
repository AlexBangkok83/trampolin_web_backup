'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  ArrowLeftIcon,
  UserIcon,
  CreditCardIcon,
  ClockIcon,
  ChartBarIcon,
  PencilIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
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
  stripeCustomerId: string | null;
  subscriptions: Array<{
    id: string;
    status: string;
    monthlyLimit: number;
    usedThisMonth: number;
    currentPeriodStart: string;
    currentPeriodEnd: string;
    canceledAt: string | null;
    priceId: string;
    stripeSubscriptionId: string | null;
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

type TabType = 'user' | 'subscription' | 'activity';

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: session, update } = useSession();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('user');

  // Check if we should start on subscription tab (when coming from subscriptions list)
  useEffect(() => {
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['user', 'subscription', 'activity'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/users/${customerId}`);

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.user);
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

  const handleLoginAs = useCallback(async () => {
    if (!session?.user || !customer) {
      alert('Session not available. Please refresh and try again.');
      return;
    }

    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: customer.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Failed to impersonate user: ${error.error}`);
        return;
      }

      const data = await response.json();

      if (data.success) {
        // Update the NextAuth session with impersonation token
        await update({
          impersonationToken: data.impersonationToken,
        });

        alert(`Successfully logged in as ${customer.email}. Redirecting to dashboard...`);
        // Wait a bit for session to update, then redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      console.error('Impersonation error:', error);
      alert('Failed to impersonate user. Please try again.');
    }
  }, [session?.user, customer, update]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, fetchCustomerDetails]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { icon: CheckCircleIcon, class: 'text-green-700 bg-green-100 border-green-200' },
      trialing: { icon: ClockIcon, class: 'text-blue-700 bg-blue-100 border-blue-200' },
      past_due: { icon: ExclamationTriangleIcon, class: 'text-red-700 bg-red-100 border-red-200' },
      canceled: { icon: XCircleIcon, class: 'text-gray-700 bg-gray-100 border-gray-200' },
      incomplete: {
        icon: ExclamationTriangleIcon,
        class: 'text-yellow-700 bg-yellow-100 border-yellow-200',
      },
    };

    return statusConfig[status as keyof typeof statusConfig] || statusConfig.canceled;
  };

  const getPlanName = (monthlyLimit: number) => {
    if (monthlyLimit >= 999999) return 'Gold';
    if (monthlyLimit >= 10000) return 'Silver';
    if (monthlyLimit >= 1000) return 'Bronze';
    return 'Free';
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
                Back to Users
              </Link>
            </div>
          </div>
        </AdminLayout>
      </AuthGuard>
    );
  }

  const currentSubscription = customer.subscriptions?.[0];

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/admin/users"
                className="inline-flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Back to Customers
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                  <span className="text-xl font-bold text-white">
                    {customer.name?.[0]?.toUpperCase() || customer.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {customer.name || 'Unnamed Customer'}
                  </h1>
                  <p className="text-gray-600">{customer.email}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                      {customer.role?.name || 'user'}
                    </span>
                    {currentSubscription && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getStatusBadge(currentSubscription.status).class}`}
                      >
                        {currentSubscription.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('user')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'user'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <UserIcon className="mr-2 inline h-4 w-4" />
                User Details
              </button>

              <button
                onClick={() => setActiveTab('subscription')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'subscription'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <CreditCardIcon className="mr-2 inline h-4 w-4" />
                Subscription Details
                {currentSubscription && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">
                    {getPlanName(currentSubscription.monthlyLimit)}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('activity')}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === 'activity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="mr-2 inline h-4 w-4" />
                Activity & Usage
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="rounded-lg bg-white shadow">
            {activeTab === 'user' && (
              <UserDetailsTab
                customer={customer}
                onUpdate={fetchCustomerDetails}
                onLoginAs={handleLoginAs}
              />
            )}

            {activeTab === 'subscription' && (
              <SubscriptionDetailsTab customer={customer} onUpdate={fetchCustomerDetails} />
            )}

            {activeTab === 'activity' && <ActivityTab customer={customer} />}
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}

// User Details Tab Component
function UserDetailsTab({
  customer,
  onUpdate,
  onLoginAs,
}: {
  customer: CustomerDetails;
  onUpdate: () => void;
  onLoginAs: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    roleId: customer.role?.id || '',
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('/api/admin/roles');
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
      }
    };
    fetchRoles();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update customer');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      roleId: customer.role?.id || '',
    });
    setEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/dashboard/admin/users';
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete customer');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete customer');
    }
  };

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">User Details</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Customer's full name"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
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
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 text-base font-medium text-gray-900">Basic Information</h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.name || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Role</dt>
                <dd className="mt-1">
                  <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    {customer.role?.name || 'user'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Member Since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="mb-4 text-base font-medium text-gray-900">Account Status</h4>
            <dl className="mb-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Stripe Customer ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {customer.stripeCustomerId || 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Total URL Analyses</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.urlAnalyses?.length || 0} analyses
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Active Subscriptions</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.subscriptions?.length || 0} subscription(s)
                </dd>
              </div>
            </dl>

            <div className="space-y-3">
              {customer.role?.name !== 'admin' && (
                <>
                  <button
                    onClick={onLoginAs}
                    className="inline-flex w-full items-center justify-center rounded-md border border-purple-300 bg-purple-50 px-3 py-2 text-sm font-medium leading-4 text-purple-700 shadow-sm hover:bg-purple-100"
                  >
                    <UserIcon className="mr-2 h-4 w-4" />
                    Login As Customer
                  </button>

                  <button
                    onClick={handleDelete}
                    className="inline-flex w-full items-center justify-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium leading-4 text-red-700 shadow-sm hover:bg-red-100"
                  >
                    Delete Customer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subscription Details Tab Component
function SubscriptionDetailsTab({
  customer,
  onUpdate,
}: {
  customer: CustomerDetails;
  onUpdate: () => void;
}) {
  const currentSubscription = customer.subscriptions?.[0];
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [formData, setFormData] = useState({
    monthlyLimit: currentSubscription?.monthlyLimit || 0,
    subscriptionStatus: currentSubscription?.status || 'none',
  });

  useEffect(() => {
    if (currentSubscription) {
      setFormData({
        monthlyLimit: currentSubscription.monthlyLimit,
        subscriptionStatus: currentSubscription.status,
      });
    }
  }, [currentSubscription]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setEditing(false);
        onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update subscription');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentSubscription) {
      setFormData({
        monthlyLimit: currentSubscription.monthlyLimit,
        subscriptionStatus: currentSubscription.status,
      });
    }
    setEditing(false);
    setError(null);
  };

  if (!currentSubscription) {
    return (
      <div className="p-6 text-center">
        <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Subscription</h3>
        <p className="mt-1 text-sm text-gray-500">
          This customer does not have an active subscription.
        </p>
      </div>
    );
  }

  const planName =
    currentSubscription.monthlyLimit >= 999999
      ? 'Gold'
      : currentSubscription.monthlyLimit >= 10000
        ? 'Silver'
        : currentSubscription.monthlyLimit >= 1000
          ? 'Bronze'
          : 'Free';

  const statusBadge = {
    active: { icon: CheckCircleIcon, class: 'text-green-700 bg-green-100 border-green-200' },
    trialing: { icon: ClockIcon, class: 'text-blue-700 bg-blue-100 border-blue-200' },
    past_due: { icon: ExclamationTriangleIcon, class: 'text-red-700 bg-red-100 border-red-200' },
    canceled: { icon: XCircleIcon, class: 'text-gray-700 bg-gray-100 border-gray-200' },
  }[currentSubscription.status] || {
    icon: XCircleIcon,
    class: 'text-gray-700 bg-gray-100 border-gray-200',
  };

  const usagePercentage =
    (currentSubscription.usedThisMonth / currentSubscription.monthlyLimit) * 100;

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Subscription Details</h3>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Subscription Status
              </label>
              <select
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

            {formData.subscriptionStatus !== 'none' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Usage Limit
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h4 className="mb-4 text-base font-medium text-gray-900">Plan Details</h4>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Plan</dt>
                <dd className="mt-1 text-sm font-medium text-gray-900">{planName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${statusBadge.class}`}
                  >
                    <statusBadge.icon className="mr-1 h-3 w-3" />
                    {currentSubscription.status.replace('_', ' ')}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Monthly Limit</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentSubscription.monthlyLimit === 999999
                    ? 'Unlimited'
                    : `${currentSubscription.monthlyLimit.toLocaleString()} analyses`}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Usage This Month</dt>
                <dd className="mt-1">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="whitespace-nowrap text-xs text-gray-500">
                      {currentSubscription.usedThisMonth.toLocaleString()}/
                      {currentSubscription.monthlyLimit === 999999
                        ? '∞'
                        : currentSubscription.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h4 className="mb-4 text-base font-medium text-gray-900">Billing Information</h4>
            <dl className="mb-6 space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Period</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(currentSubscription.currentPeriodStart).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  -{' '}
                  {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Days Remaining</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {currentSubscription.status === 'canceled'
                    ? 'Canceled'
                    : `${Math.ceil((new Date(currentSubscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stripe Subscription ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">
                  {currentSubscription.stripeSubscriptionId || 'Not available'}
                </dd>
              </div>
            </dl>

            <div className="space-y-3">
              <button
                onClick={() => setShowAdminTools(true)}
                className="inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <WrenchScrewdriverIcon className="mr-2 h-4 w-4" />
                Admin Tools
              </button>
              {currentSubscription.status === 'active' && (
                <button
                  onClick={() => setShowRefundModal(true)}
                  className="inline-flex w-full items-center justify-center rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium leading-4 text-red-700 shadow-sm hover:bg-red-100"
                >
                  <CurrencyDollarIcon className="mr-2 h-4 w-4" />
                  Process Refund
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Tools Modal - placeholder for now */}
      {showAdminTools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Admin Tools</h3>
            <p className="mb-4 text-gray-600">
              Admin tools functionality will be implemented here.
            </p>
            <button
              onClick={() => setShowAdminTools(false)}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Refund Modal - placeholder for now */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Process Refund</h3>
            <p className="mb-4 text-gray-600">Refund functionality will be implemented here.</p>
            <button
              onClick={() => setShowRefundModal(false)}
              className="w-full rounded border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Activity Tab Component
function ActivityTab({ customer }: { customer: CustomerDetails }) {
  return (
    <div className="p-6">
      <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Activity</h3>

      {customer.urlAnalyses && customer.urlAnalyses.length > 0 ? (
        <div className="space-y-4">
          {customer.urlAnalyses.slice(0, 10).map((analysis) => (
            <div
              key={analysis.id}
              className="flex items-center justify-between border-b border-gray-200 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{analysis.url}</p>
                <p className="text-sm text-gray-500">
                  {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            This customer has not performed any URL analyses yet.
          </p>
        </div>
      )}
    </div>
  );
}
