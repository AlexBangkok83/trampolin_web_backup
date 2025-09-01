import * as React from 'react';
import { Header } from '@/components/marketing/Header';
import { Footer } from '@/components/marketing/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
