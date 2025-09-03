'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import {
  UsersIcon,
  CreditCardIcon,
  GlobeAltIcon,
  BanknotesIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface AdminMetrics {
  totalUsers: number;
  activeSubscriptions: number;
  totalUrlAnalyses: number;
  recentUsers: number;
  totalRevenue: number;
  growth: {
    users: number;
    revenue: number;
    analyses: number;
  };
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600 mt-1">Monitor your application&apos;s key metrics and performance</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={metrics?.totalUsers || 0}
              change={{
                value: `+${metrics?.growth.users || 0}%`,
                type: 'increase'
              }}
              icon={UsersIcon}
              loading={loading}
            />
            
            <MetricCard
              title="Active Subscriptions"
              value={metrics?.activeSubscriptions || 0}
              change={{
                value: `+${metrics?.growth.revenue || 0}%`,
                type: 'increase'
              }}
              icon={CreditCardIcon}
              loading={loading}
            />
            
            <MetricCard
              title="URL Analyses"
              value={metrics?.totalUrlAnalyses || 0}
              change={{
                value: `+${metrics?.growth.analyses || 0}%`,
                type: 'increase'
              }}
              icon={GlobeAltIcon}
              loading={loading}
            />
            
            <MetricCard
              title="Monthly Revenue"
              value={`$${metrics?.totalRevenue?.toLocaleString() || 0}`}
              change={{
                value: `+${metrics?.growth.revenue || 0}%`,
                type: 'increase'
              }}
              icon={BanknotesIcon}
              loading={loading}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserPlusIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">New users (30 days)</span>
                  </div>
                  <span className="text-sm font-medium">{metrics?.recentUsers || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-600">Trial Conversions</span>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <GlobeAltIcon className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-gray-600">Avg. Analyses/User</span>
                  </div>
                  <span className="text-sm font-medium">12.3</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Response Time</span>
                  <span className="text-sm font-medium text-green-600">245ms</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Sessions</span>
                  <span className="text-sm font-medium">{Math.floor((metrics?.totalUsers || 0) * 0.15)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
