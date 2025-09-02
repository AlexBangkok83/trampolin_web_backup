'use client';

import * as React from 'react';
import { ChartConfigProvider } from '@/contexts/ChartConfigContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <ChartConfigProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header setSidebarOpen={setSidebarOpen} />
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </ChartConfigProvider>
  );
}
