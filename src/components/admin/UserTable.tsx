'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ShieldCheckIcon,
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
  } | null;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  onRefresh: () => void;
}

export function UserTable({ users, loading, onRefresh }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role?.name === roleFilter;

    const matchesStatus =
      accountStatusFilter === 'all' ||
      (accountStatusFilter === 'subscribed' && user.subscription?.status === 'active') ||
      (accountStatusFilter === 'trial' && user.subscription?.status === 'trialing') ||
      (accountStatusFilter === 'unsubscribed' &&
        (!user.subscription || ['canceled', 'past_due'].includes(user.subscription.status)));

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccountStatusDisplay = (subscription?: { status: string } | null) => {
    if (subscription?.status === 'active')
      return { text: 'Subscribed', class: 'bg-green-100 text-green-800 border-green-200' };
    if (subscription?.status === 'trialing')
      return { text: 'Trial User', class: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (subscription?.status)
      return { text: 'Subscription Issue', class: 'bg-red-100 text-red-800 border-red-200' };
    return { text: 'Free User', class: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const uniqueRoles = ['all', ...new Set(users.map((u) => u.role?.name || 'user'))];
  const uniqueAccountStatuses = ['all', 'subscribed', 'trial', 'unsubscribed'];

  return (
    <div className="rounded-lg bg-white shadow">
      {/* Table Header with Filters */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900">All Customers</h2>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
              {filteredUsers.length} of {users.length}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="min-w-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {uniqueRoles.map((role) => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>

            {/* Account Status Filter */}
            <select
              value={accountStatusFilter}
              onChange={(e) => setAccountStatusFilter(e.target.value)}
              className="min-w-[140px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {uniqueAccountStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? 'All Users'
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="px-6 py-8">
            <div className="animate-pulse space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                    <div className="h-3 w-1/3 rounded bg-gray-200"></div>
                  </div>
                  <div className="h-6 w-16 rounded bg-gray-200"></div>
                  <div className="h-6 w-20 rounded bg-gray-200"></div>
                  <div className="h-8 w-32 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <table className="w-full divide-y divide-gray-200 rounded-lg border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-80 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="w-32 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Account Status
                  </th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Activity
                  </th>
                  <th className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="w-32 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                          <span className="text-sm font-medium text-white">
                            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {user.role?.name === 'admin' && (
                          <ShieldCheckIcon className="mr-1 h-4 w-4 text-red-500" />
                        )}
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getRoleBadge(user.role?.name || 'user')}`}
                        >
                          {user.role?.name || 'user'}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getAccountStatusDisplay(user.subscription).class}`}
                      >
                        {getAccountStatusDisplay(user.subscription).text}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date().getTime() - new Date(user.createdAt).getTime() <
                      7 * 24 * 60 * 60 * 1000 ? (
                        <span className="font-medium text-green-600">Recent</span>
                      ) : new Date().getTime() - new Date(user.createdAt).getTime() <
                        30 * 24 * 60 * 60 * 1000 ? (
                        <span className="text-blue-600">This month</span>
                      ) : (
                        <span>Older</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <Link
                        href={`/dashboard/admin/customer/${user.id}`}
                        className="inline-flex items-center rounded px-3 py-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
                        title="View Customer"
                      >
                        <EyeIcon className="mr-1 h-4 w-4" />
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="py-12 text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all' || accountStatusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first customer.'}
          </p>
          {(searchTerm || roleFilter !== 'all' || accountStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setAccountStatusFilter('all');
              }}
              className="mt-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
