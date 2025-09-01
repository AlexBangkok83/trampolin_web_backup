import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Upload, BarChart2, Settings, FileText } from 'lucide-react';

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Uploads', href: '/dashboard/uploads', icon: Upload },
  { name: 'Analytics', href: '/dashboard/analytics-dashboard', icon: BarChart2 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex w-64 flex-col">
        <div className="flex h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-indigo-600">Trampolin</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center rounded-md px-2 py-2 text-sm font-medium',
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500',
                        'mr-3 h-6 w-6 flex-shrink-0',
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <div className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                    <span className="font-medium text-indigo-600">TU</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">Test User</p>
                    <p className="text-xs font-medium text-gray-500">View profile</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
