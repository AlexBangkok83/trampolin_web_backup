'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import { getMainSiteUrl } from '../lib/subdomain';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage = '' }: SidebarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div
      className={`${isCollapsed ? 'w-16' : 'w-64'} sticky top-0 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800`}
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trampolin</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 px-4 py-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          <a
            href="/dashboard"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium ${
              currentPage === 'dashboard'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'
            } transition-all duration-300`}
            title={isCollapsed ? 'Dashboard' : ''}
          >
            <svg
              className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 ${
                currentPage === 'dashboard'
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z"
              />
            </svg>
            {!isCollapsed && 'Dashboard'}
          </a>

          <a
            href="/analyze"
            className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium ${
              currentPage === 'analyze'
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700'
            } transition-all duration-300`}
            title={isCollapsed ? 'Analyze' : ''}
          >
            <svg
              className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 ${
                currentPage === 'analyze'
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            {!isCollapsed && 'Analyze'}
          </a>
        </div>

        {/* Analytics Section */}
        <div>
          {!isCollapsed && (
            <div className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
              ANALYTICS
            </div>
          )}
          <div className="space-y-1">
            <a
              href="/saved"
              className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
              title={isCollapsed ? 'Saved Products' : ''}
            >
              <svg
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-400 dark:text-gray-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              {!isCollapsed && 'Saved Products'}
            </a>

            <a
              href="/history"
              className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
              title={isCollapsed ? 'Search History' : ''}
            >
              <svg
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-400 dark:text-gray-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {!isCollapsed && 'Search History'}
            </a>

            <a
              href="#"
              className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
              title={isCollapsed ? 'Reports' : ''}
            >
              <svg
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-400 dark:text-gray-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {!isCollapsed && 'Reports'}
            </a>
          </div>
        </div>

        {/* Tools Section */}
        <div>
          {!isCollapsed && (
            <div className="mb-3 text-xs font-semibold tracking-wide text-gray-400 uppercase dark:text-gray-500">
              TOOLS
            </div>
          )}
          <div className="space-y-1">
            {!isCollapsed ? (
              <div className="px-2">
                <div className="flex items-center py-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                  <svg
                    className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Competitor Research
                </div>
                <div className="ml-8 space-y-1">
                  <a
                    href="#"
                    className="block py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Find by Demographics
                  </a>
                  <a
                    href="#"
                    className="block py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Industry Analysis
                  </a>
                </div>
              </div>
            ) : (
              <a
                href="#"
                className="flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                title="Competitor Research"
              >
                <svg
                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </a>
            )}

            <a
              href="#"
              className={`flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-2'} rounded-md py-2 text-sm font-medium text-gray-600 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
              title={isCollapsed ? 'Bulk Export' : ''}
            >
              <svg
                className={`${isCollapsed ? '' : 'mr-3'} h-5 w-5 text-gray-400 dark:text-gray-500`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {!isCollapsed && 'Bulk Export'}
            </a>
          </div>
        </div>

        {/* Theme Toggle */}
        {!isCollapsed && <ThemeToggle />}
      </nav>

      {/* User Profile at Bottom */}
      <div className="relative border-t border-gray-200 p-4 dark:border-gray-700">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className={`flex w-full items-center ${isCollapsed ? 'justify-center px-2' : 'px-2'} rounded-md py-3 text-sm transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
          title={isCollapsed ? session?.user?.name || 'User' : ''}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 dark:bg-blue-600 ${isCollapsed ? '' : 'mr-3'}`}
          >
            <span className="text-sm font-medium text-white">
              {getUserInitials(session?.user?.name)}
            </span>
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {session?.user?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {session?.user?.email || 'No email'}
                </div>
              </div>
              <svg
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </>
          )}
        </button>

        {userMenuOpen && !isCollapsed && (
          <div className="absolute right-4 bottom-full left-4 mb-2 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-600 dark:bg-gray-700">
            <a
              href="/account"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Account Settings
            </a>
            <a
              href="/billing"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg
                className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Billing
            </a>
            <div className="my-2 border-t border-gray-200 dark:border-gray-600"></div>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <svg
                className="mr-3 h-4 w-4 text-red-500 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
