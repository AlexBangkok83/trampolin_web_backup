import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  headerActions?: ReactNode;
}

export function DashboardLayout({
  children,
  title,
  description,
  headerActions,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            {/* Page header */}
            <div className="mb-6 md:flex md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                  {title}
                </h1>
                {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
              </div>
              {headerActions && <div className="mt-4 flex md:ml-4 md:mt-0">{headerActions}</div>}
            </div>

            {/* Page content */}
            <div className="rounded-lg bg-white p-4 shadow md:p-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
