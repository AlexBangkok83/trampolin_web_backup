import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl">
          Unlock Insights from Your Data
        </h1>
        <p className="text-muted-foreground mt-4 text-lg md:text-xl">
          Trampolin is a powerful analytics platform that helps you make sense of your data with
          beautiful, interactive visualizations.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/dashboard">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
