'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { UserTable } from '@/components/admin/UserTable';
import {
  UsersIcon,
  UserPlusIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

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
  const { data: session } = useSession();
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchUsers(); // Refresh the list
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    }
  };

  const handleLoginAs = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to login as ${userEmail}? You will be redirected to the regular dashboard as that user.`)) {
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
        
        // Store impersonation info in localStorage for potential "exit impersonation" feature
        localStorage.setItem('impersonating', JSON.stringify({
          originalAdmin: session?.user?.email,
          targetUser: data.targetUser,
          startTime: new Date().toISOString()
        }));

        // Redirect to main dashboard as the impersonated user
        // In a real implementation, you'd want to handle the session switch properly
        // For now, we'll redirect with a special query parameter
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


  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Total Users"
              value={users.length}
              icon={UsersIcon}
              loading={loading}
            />
            <MetricCard
              title="Admin Users"
              value={users.filter(u => u.role?.name === 'admin').length}
              icon={UserPlusIcon}
              loading={loading}
            />
            <MetricCard
              title="New This Month"
              value={users.filter(u => new Date().getTime() - new Date(u.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000).length}
              icon={FunnelIcon}
              loading={loading}
            />
          </div>

          {/* Users Table */}
          <UserTable 
            users={users}
            loading={loading}
            onRefresh={fetchUsers}
            onDeleteUser={handleDeleteUser}
            onLoginAs={handleLoginAs}
          />
        </div>
      </AdminLayout>
    </AuthGuard>
  );
}