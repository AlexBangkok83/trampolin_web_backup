'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
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
  onDeleteUser: (userId: string) => void;
  onLoginAs: (userId: string, userEmail: string) => void;
}

export function UserTable({ users, loading, onRefresh, onDeleteUser, onLoginAs }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [accountStatusFilter, setAccountStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role?.name === roleFilter;
    
    const matchesStatus = accountStatusFilter === 'all' || 
      (accountStatusFilter === 'subscribed' && user.subscription?.status === 'active') ||
      (accountStatusFilter === 'trial' && user.subscription?.status === 'trialing') ||
      (accountStatusFilter === 'unsubscribed' && (!user.subscription || ['canceled', 'past_due'].includes(user.subscription.status)));
    
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
    if (subscription?.status === 'active') return { text: 'Subscribed', class: 'bg-green-100 text-green-800 border-green-200' };
    if (subscription?.status === 'trialing') return { text: 'Trial User', class: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (subscription?.status) return { text: 'Subscription Issue', class: 'bg-red-100 text-red-800 border-red-200' };
    return { text: 'Free User', class: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const uniqueRoles = ['all', ...new Set(users.map(u => u.role?.name || 'user'))];
  const uniqueAccountStatuses = ['all', 'subscribed', 'trial', 'unsubscribed'];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Table Header with Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-medium text-gray-900">All Users</h2>
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
              {filteredUsers.length} of {users.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
            </div>
            
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {uniqueRoles.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Account Status Filter */}
            <select
              value={accountStatusFilter}
              onChange={(e) => setAccountStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {uniqueAccountStatuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Users' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
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
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role?.name === 'admin' && (
                        <ShieldCheckIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRoleBadge(user.role?.name || 'user')}`}>
                        {user.role?.name || 'user'}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getAccountStatusDisplay(user.subscription).class}`}>
                      {getAccountStatusDisplay(user.subscription).text}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date().getTime() - new Date(user.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 ? (
                      <span className="text-green-600 font-medium">Recent</span>
                    ) : new Date().getTime() - new Date(user.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 ? (
                      <span className="text-blue-600">This month</span>
                    ) : (
                      <span>Older</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        href={`/dashboard/admin/users/${user.id}`}
                        className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      
                      <Link
                        href={`/dashboard/admin/users/${user.id}/edit`}
                        className="inline-flex items-center px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      
                      {user.role?.name !== 'admin' && (
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      )}
                      
                      {user.role?.name !== 'admin' && (
                        <button 
                          onClick={() => onLoginAs(user.id, user.email || 'User')}
                          className="inline-flex items-center px-2 py-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded transition-colors"
                        >
                          <UserCircleIcon className="h-4 w-4 mr-1" />
                          Login As
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && !loading && (
        <div className="text-center py-12">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || roleFilter !== 'all' || accountStatusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first user.'}
          </p>
          {(searchTerm || roleFilter !== 'all' || accountStatusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setAccountStatusFilter('all');
              }}
              className="mt-3 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}