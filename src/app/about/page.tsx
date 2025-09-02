import Link from 'next/link';
import PublicHeader from '../../components/PublicHeader';

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            About Trampolin
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            We&apos;re on a mission to democratize competitive intelligence for marketers and
            entrepreneurs worldwide.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Trampolin was born from a simple frustration: analyzing competitor Facebook ads was
              too time-consuming and expensive. What started as a Slack bot for internal use has
              evolved into a comprehensive platform that serves hundreds of marketers worldwide.
            </p>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
              We believe that every business, regardless of size, should have access to the same
              competitive intelligence tools that large corporations use to dominate their markets.
            </p>

            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">What We Do</h2>
            <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
              Trampolin analyzes Facebook ad performance data for any product URL you provide. By
              leveraging Facebook&apos;s Ad Library API and our proprietary analysis algorithms, we
              deliver instant insights into:
            </p>
            <ul className="mb-8 list-disc space-y-2 pl-6 text-lg text-gray-600 dark:text-gray-300">
              <li>Total advertising reach and impressions</li>
              <li>Ad performance trends over time</li>
              <li>Competitive positioning insights</li>
              <li>Market opportunity analysis</li>
            </ul>

            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
              Why Choose Trampolin?
            </h2>
            <div className="mb-8 grid gap-8 md:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Speed &amp; Accuracy
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get comprehensive analysis in seconds, not hours. Our data comes directly from
                  Facebook&apos;s official sources.
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Affordable Pricing
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Professional-grade competitive intelligence at a fraction of the cost of
                  traditional market research.
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Easy to Use
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  No complex setup or training required. Simply paste a URL and get instant
                  insights.
                </p>
              </div>
              <div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Actionable Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Export detailed reports and save high-performing products for ongoing competitive
                  monitoring.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              Trusted by Marketers Worldwide
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Join hundreds of successful businesses using Trampolin for competitive intelligence
            </p>
          </div>

          <div className="grid gap-8 text-center md:grid-cols-4">
            <div>
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">500+</div>
              <div className="text-gray-600 dark:text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">50K+</div>
              <div className="text-gray-600 dark:text-gray-300">Products Analyzed</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">99.9%</div>
              <div className="text-gray-600 dark:text-gray-300">Uptime</div>
            </div>
            <div>
              <div className="mb-2 text-4xl font-bold text-blue-600 dark:text-blue-400">24/7</div>
              <div className="text-gray-600 dark:text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 dark:bg-blue-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Join the growing community of marketers who rely on Trampolin for competitive
            intelligence.
          </p>
          <Link
            href="/signup"
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-colors hover:bg-gray-100"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-white dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold">Trampolin</h3>
              <p className="text-gray-400">
                The fastest way to analyze Facebook ad performance for any product.
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
