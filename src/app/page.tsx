'use client';

import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import { getAppUrl } from '../lib/subdomain';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-6xl dark:text-white">
            Trampolin Analytics Platform
            <span className="block text-blue-600 dark:text-blue-400">Facebook Ads & CSV Data</span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
            Analyze Facebook advertising reach data and upload CSV files for comprehensive data visualization and insights.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={getAppUrl('/signup')}
              className="rounded-lg bg-blue-600 px-8 py-4 text-center text-lg font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Start Free Trial
            </a>
            <Link
              href="/pricing"
              className="rounded-lg border border-gray-300 px-8 py-4 text-center text-lg font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Dual Analytics Platform
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Get the competitive intelligence and data insights you need to make informed decisions
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <svg
                  className="h-6 w-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Facebook Ads Intelligence
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get Facebook ad reach data in seconds. Analyze competitor performance and discover winning products.
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
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
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                CSV Data Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload CSV files and visualize your data with interactive charts and comprehensive analytics.
              </p>
            </div>

            <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-gray-700">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <svg
                  className="h-6 w-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Export & Share
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save insights, export reports, and share findings with your team for collaborative analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Three simple steps to get actionable insights
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Upload or Analyze
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Either paste a product URL for Facebook ads analysis or upload your CSV data file.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Get Instant Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our platform processes your data and generates comprehensive analytics with visualizations.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Export Results
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save high-performers and export detailed reports for further analysis and sharing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 dark:bg-blue-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Start Analyzing?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Join hundreds of marketers and analysts who use Trampolin for data-driven insights.
          </p>
          <a
            href={getAppUrl('/signup')}
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-colors hover:bg-gray-100"
          >
            Start Your Free Trial
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">Trampolin</h3>
              <p className="text-gray-400">
                Comprehensive analytics platform for Facebook ads intelligence and CSV data visualization.
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Trampolin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
