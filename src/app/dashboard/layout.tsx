'use client';

import { ChartConfigProvider } from '@/contexts/ChartConfigContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ChartConfigProvider>{children}</ChartConfigProvider>;
}
