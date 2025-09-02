'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { ChartConfigProvider } from '@/contexts/ChartConfigContext';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider session={session}>
        <ChartConfigProvider>{children}</ChartConfigProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
