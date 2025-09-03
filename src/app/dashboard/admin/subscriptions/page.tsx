'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import {
  CreditCardIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  GiftIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

interface SubscriptionWithUser {
  id: string;
  status: string;
  monthlyLimit: number;
  usedThisMonth: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  priceId: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  pastDueSubscriptions: number;
  canceledSubscriptions: number;
  monthlyRevenue: number;
  churnRate: number;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithUser | null>(null);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionsData();
  }, []);

  const fetchSubscriptionsData = async () => {
    try {
      setLoading(true);
      const [subscriptionsRes, metricsRes] = await Promise.all([
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/subscription-metrics')
      ]);

      if (subscriptionsRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        setSubscriptions(subscriptionsData.subscriptions);
      }

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = 
      subscription.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { icon: <CheckCircleIcon className="h-4 w-4" />, class: 'bg-green-100 text-green-800 border-green-200' };
      case 'trialing':
        return { icon: <ClockIcon className="h-4 w-4" />, class: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'past_due':
        return { icon: <ExclamationTriangleIcon className="h-4 w-4" />, class: 'bg-red-100 text-red-800 border-red-200' };
      case 'canceled':
        return { icon: <XCircleIcon className="h-4 w-4" />, class: 'bg-gray-100 text-gray-800 border-gray-200' };
      default:
        return { icon: <CreditCardIcon className="h-4 w-4" />, class: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPlanName = (limit: number) => {
    if (limit === 500) return 'Bronze';
    if (limit === 1000) return 'Silver';
    if (limit === 2500) return 'Gold';
    return 'Custom';
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = used / limit;
    if (percentage > 0.9) return 'bg-red-500';
    if (percentage > 0.7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const uniqueStatuses = ['all', 'active', 'trialing', 'past_due', 'canceled'];

  const handleExtendTrial = async (subscriptionId: string, days: number) => {
    setActionLoading(`extend-${subscriptionId}`);
    try {
      const response = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, days })
      });
      
      if (response.ok) {
        await fetchSubscriptionsData();
        alert(`Trial extended by ${days} days successfully`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to extend trial');
      }
    } catch (error) {
      console.error('Failed to extend trial:', error);
      alert('Failed to extend trial');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdjustCredits = async (subscriptionId: string, credits: number) => {
    setActionLoading(`credits-${subscriptionId}`);
    try {
      const response = await fetch('/api/admin/adjust-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, credits })
      });
      
      if (response.ok) {
        await fetchSubscriptionsData();
        alert(`${credits > 0 ? 'Added' : 'Removed'} ${Math.abs(credits)} credits successfully`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to adjust credits');
      }
    } catch (error) {
      console.error('Failed to adjust credits:', error);
      alert('Failed to adjust credits');
    } finally {
      setActionLoading(null);
    }
  };

  const AdminToolsModal = ({ subscription, onClose }: { subscription: SubscriptionWithUser; onClose: () => void }) => {
    const [trialDays, setTrialDays] = useState(7);
    const [creditAmount, setCreditAmount] = useState(100);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Admin Tools: {subscription.user.name || subscription.user.email}
          </h3>
          
          {/* Trial Extension */}
          {subscription.status === 'trialing' && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                Extend Trial
              </h4>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="number"
                  value={trialDays}
                  onChange={(e) => setTrialDays(Number(e.target.value))}
                  min="1"
                  max="90"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
              <button
                onClick={() => handleExtendTrial(subscription.id, trialDays)}
                disabled={actionLoading === `extend-${subscription.id}`}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {actionLoading === `extend-${subscription.id}` ? 'Extending...' : `Extend Trial by ${trialDays} Days`}
              </button>
            </div>
          )}
          
          {/* Credit Adjustment */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2 flex items-center">
              <GiftIcon className="h-4 w-4 mr-2" />
              Adjust Credits
            </h4>
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="100"
              />
              <span className="text-sm text-gray-600">credits</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleAdjustCredits(subscription.id, creditAmount)}
                disabled={actionLoading === `credits-${subscription.id}`}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
              >
                {actionLoading === `credits-${subscription.id}` ? 'Adding...' : 'Add Credits'}
              </button>
              <button
                onClick={() => handleAdjustCredits(subscription.id, -creditAmount)}
                disabled={actionLoading === `credits-${subscription.id}`}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm disabled:opacity-50"
              >
                {actionLoading === `credits-${subscription.id}` ? 'Removing...' : 'Remove Credits'}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
            <p className="text-gray-600 mt-1">Monitor subscriptions, billing, and revenue metrics</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Active Subscriptions"
              value={metrics?.activeSubscriptions || 0}
              icon={CheckCircleIcon}
              loading={loading}
            />
            <MetricCard
              title="Monthly Revenue"
              value={`$${metrics?.monthlyRevenue || 0}`}
              icon={BanknotesIcon}
              loading={loading}
            />
            <MetricCard
              title="Trial Users"
              value={metrics?.trialingSubscriptions || 0}
              icon={ClockIcon}
              loading={loading}
            />
            <MetricCard
              title="Past Due"
              value={metrics?.pastDueSubscriptions || 0}
              icon={ExclamationTriangleIcon}
              loading={loading}
            />
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-lg shadow">
            {/* Table Header with Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-medium text-gray-900">All Subscriptions</h2>
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {filteredSubscriptions.length} of {subscriptions.length}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    {uniqueStatuses.map(status => (
                      <option key={status} value={status}>
                        {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="px-6 py-8">
                  <div className="animate-pulse space-y-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                        <div className="h-8 bg-gray-200 rounded w-32"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Billing Cycle
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscriptions.map((subscription) => {
                      const statusBadge = getStatusBadge(subscription.status);
                      const planName = getPlanName(subscription.monthlyLimit);
                      
                      return (
                        <tr key={subscription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {subscription.user.name?.[0]?.toUpperCase() || subscription.user.email?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {subscription.user.name || 'No name'}
                                </div>
                                <div className="text-sm text-gray-500">{subscription.user.email}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{planName}</div>
                            <div className="text-sm text-gray-500">
                              {subscription.monthlyLimit === 999999 ? 'Unlimited' : `${subscription.monthlyLimit.toLocaleString()}/month`}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusBadge.class}`}>
                              {statusBadge.icon}
                              <span className="ml-1">{subscription.status.replace('_', ' ')}</span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 min-w-0">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getUsageColor(subscription.usedThisMonth, subscription.monthlyLimit)}`}
                                    style={{ 
                                      width: `${Math.min((subscription.usedThisMonth / subscription.monthlyLimit) * 100, 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {subscription.usedThisMonth.toLocaleString()}/{subscription.monthlyLimit === 999999 ? '∞' : subscription.monthlyLimit.toLocaleString()}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(subscription.currentPeriodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {subscription.status === 'canceled' ? 'Canceled' : `${Math.ceil((new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left`}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                            <div className="flex items-center justify-center space-x-2">
                              <button 
                                onClick={() => {
                                  setSelectedSubscription(subscription);
                                  setShowAdminTools(true);
                                }}
                                className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                              >
                                <WrenchScrewdriverIcon className="h-3 w-3 mr-1" />
                                Admin Tools
                              </button>
                              <button className="inline-flex items-center px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors">
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Empty State */}
            {filteredSubscriptions.length === 0 && !loading && (
              <div className="text-center py-12">
                <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No subscriptions found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.' 
                    : 'No subscription data available.'}
                </p>
              </div>
            )}
          </div>
          
          {/* Admin Tools Modal */}
          {showAdminTools && selectedSubscription && (
            <AdminToolsModal
              subscription={selectedSubscription}
              onClose={() => {
                setShowAdminTools(false);
                setSelectedSubscription(null);
              }}
            />
          )}
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}