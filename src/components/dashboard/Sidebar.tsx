'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  BookmarkIcon,
  FileText,
  Search,
  ChevronLeft,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  X,
  Settings,
  CreditCard,
  LogOut,
  ChevronUp,
} from 'lucide-react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { useTheme } from '@/contexts/ThemeContext';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

const navigation: (NavigationItem | NavigationSection)[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'ANALYTICS',
    items: [
      { name: 'Analyze', href: '/analyze', icon: Search },
      { name: 'Search History', href: '/history', icon: Clock },
      { name: 'Saved Products', href: '/saved', icon: BookmarkIcon },
      { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    ],
  },
  // {
  //   title: 'TOOLS',
  //   items: [
  //     { name: 'Competitor Research', href: '/dashboard/competitor-research', icon: TrendingUp },
  //     { name: 'Find by Demographics', href: '/dashboard/demographics', icon: Users },
  //     { name: 'Industry Analysis', href: '/dashboard/industry', icon: BarChart3 },
  //     { name: 'Bulk Export', href: '/dashboard/bulk-export', icon: Database },
  //   ],
  // },
];

function ThemeToggle({ collapsed }: { collapsed: boolean }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const themes = [
    { name: 'Light', value: 'light' as const, icon: Sun },
    { name: 'Dark', value: 'dark' as const, icon: Moon },
    { name: 'System', value: 'system' as const, icon: Monitor },
  ];

  return (
    <div className="flex items-center justify-center gap-1 p-2">
      {themes.map(({ name, value, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            theme === value
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300',
          )}
          title={collapsed ? name : undefined}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

function SidebarContent({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(['ANALYTICS']),
  );
  const [userDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (title: string) => {
    if (collapsed) return; // Don't toggle when collapsed
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const userName = session?.user?.name || 'User';
  const userInitials =
    userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U';

  return (
    <div
      className={cn(
        'flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-800',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
        {!collapsed ? (
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Trampolin"
              width={120}
              height={48}
              className="h-8 w-auto dark:invert"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Trampolin"
              width={40}
              height={16}
              className="h-4 w-auto dark:invert"
            />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <ChevronLeft className={cn('h-5 w-5 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((item) => {
          if ('href' in item) {
            // Regular navigation item
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                  collapsed && 'justify-center',
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                    'h-5 w-5 flex-shrink-0',
                    !collapsed && 'mr-3',
                  )}
                />
                {!collapsed && item.name}
              </Link>
            );
          } else {
            // Navigation section
            const isExpanded = expandedSections.has(item.title);
            return (
              <div key={item.title}>
                {!collapsed && (
                  <button
                    onClick={() => toggleSection(item.title)}
                    className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <span>{item.title}</span>
                    <ChevronDown
                      className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')}
                    />
                  </button>
                )}

                {/* Section items */}
                <div
                  className={cn(
                    'space-y-1',
                    collapsed || (!collapsed && isExpanded) ? 'block' : 'hidden',
                  )}
                >
                  {item.items.map((subItem) => {
                    const isActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
                          'group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                          collapsed ? 'justify-center' : 'ml-6',
                        )}
                        title={collapsed ? subItem.name : undefined}
                      >
                        <subItem.icon
                          className={cn(
                            isActive
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300',
                            'h-4 w-4 flex-shrink-0',
                            !collapsed && 'mr-3',
                          )}
                        />
                        {!collapsed && subItem.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }
        })}
      </nav>

      {/* Theme Toggle */}
      {!collapsed && (
        <div className="px-2 py-2">
          <ThemeToggle collapsed={collapsed} />
        </div>
      )}

      {/* User Profile Footer */}
      <div
        ref={dropdownRef}
        className="relative flex-shrink-0 border-t border-gray-200 dark:border-gray-700"
      >
        {collapsed ? (
          <div className="flex justify-center p-4">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
            >
              <span className="text-sm font-medium">{userInitials[0]}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex w-full items-center p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <span className="text-sm font-medium">{userInitials[0]}</span>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
                {userName}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {session?.user?.email}
              </p>
            </div>
            <ChevronUp
              className={`h-4 w-4 text-gray-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* Dropdown Menu */}
        {userDropdownOpen && (
          <div
            className={`absolute bottom-full mb-1 ${collapsed ? 'left-4' : 'left-0 right-0'} z-50 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800`}
          >
            <div className="p-2">
              <Link
                href="/account"
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setUserDropdownOpen(false)}
              >
                <Settings className="mr-3 h-4 w-4" />
                Account Settings
              </Link>
              <Link
                href="/billing"
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setUserDropdownOpen(false)}
              >
                <CreditCard className="mr-3 h-4 w-4" />
                Billing
              </Link>
              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:h-screen md:flex-shrink-0">
        <SidebarContent collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </div>

      {/* Mobile Sidebar */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-40 md:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            transition
            className="relative flex w-full max-w-xs flex-1 flex-col bg-white pb-4 pt-5 transition duration-300 ease-in-out data-[closed]:-translate-x-full dark:bg-gray-900"
          >
            <div className="absolute right-0 top-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <SidebarContent collapsed={false} onToggleCollapse={() => {}} />
          </DialogPanel>
          <div className="w-14 flex-shrink-0" aria-hidden="true" />
        </div>
      </Dialog>
    </>
  );
}
