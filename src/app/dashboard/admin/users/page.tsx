'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { UserTable } from '@/components/admin/UserTable';
import { UsersIcon, UserPlusIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: {
    name: string;
  } | null;
  createdAt: string;
  subscription?: {
    status: string;
    monthlyLimit: number;
    usedThisMonth: number;
  } | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
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
            <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
            <p className="mt-1 text-gray-600">
              Manage customer accounts, subscriptions, and permissions
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <MetricCard
              title="Total Customers"
              value={users.length}
              icon={UsersIcon}
              loading={loading}
            />
            <MetricCard
              title="Admin Accounts"
              value={users.filter((u) => u.role?.name === 'admin').length}
              icon={UserPlusIcon}
              loading={loading}
            />
            <MetricCard
              title="New This Month"
              value={
                users.filter(
                  (u) =>
                    new Date().getTime() - new Date(u.createdAt).getTime() <
                    30 * 24 * 60 * 60 * 1000,
                ).length
              }
              icon={FunnelIcon}
              loading={loading}
            />
          </div>

          {/* Users Table */}
          <UserTable users={users} loading={loading} onRefresh={fetchUsers} />
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}
