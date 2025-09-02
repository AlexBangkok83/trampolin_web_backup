import Link from 'next/link';
import PublicHeader from '../../components/PublicHeader';

export default function Features() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <PublicHeader />

      {/* Hero Section */}
      <section className="px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">
            Powerful Features for
            <span className="block text-blue-600 dark:text-blue-400">Facebook Ad Analysis</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
            Everything you need to analyze, track, and optimize your competitive intelligence
            strategy.
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="space-y-20">
            {/* Feature 1: URL Analysis */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                  Instant URL Analysis
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Simply paste any product URL from e-commerce sites and get comprehensive Facebook
                  ad reach analysis in seconds. Our advanced algorithm scans Facebook&apos;s Ad
                  Library to provide you with accurate performance metrics.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Support for major e-commerce platforms
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Real-time data from Facebook Ad Library
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Lightning-fast analysis in under 10 seconds
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg bg-gray-100 p-8 dark:bg-gray-800">
                <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-700">
                  <div className="mb-4 flex items-center">
                    <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="mr-4 h-3 w-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Trampolin Analysis
                    </span>
                  </div>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Paste product URL here..."
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                      defaultValue="https://example.com/product/wireless-earbuds"
                    />
                    <button className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white">
                      Analyze Now
                    </button>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        15.2K Reach
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        High performing product
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Bulk Analysis */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="lg:order-2">
                <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                  Bulk URL Processing
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Analyze multiple products at once to save time and get comprehensive competitive
                  insights. Perfect for agencies and businesses managing multiple product lines.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Process up to 100 URLs simultaneously
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      CSV upload and download
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-blue-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Progress tracking and notifications
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-8 dark:from-blue-900/20 dark:to-blue-800/20 lg:order-1">
                <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-700">
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-600 dark:bg-gray-800">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bulk Analysis Results
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        wireless-earbuds.com
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        15.2K
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        smart-watch.shop
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        23.5K
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        gaming-keyboard.com
                      </span>
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        7.8K
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        bluetooth-speaker.net
                      </span>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                        2.1K
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Advanced Filtering */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                  Smart Filtering &amp; Analytics
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Find the highest-performing products quickly with advanced filtering options. Sort
                  by reach, date, performance level, and more to identify winning strategies.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Filter by reach ranges (High, Medium, Low)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Time-based filtering (Last 7 days, 30 days, etc.)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-purple-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Search by product name or URL
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-8 dark:from-purple-900/20 dark:to-purple-800/20">
                <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-700">
                  <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                    Filter Results
                  </h3>
                  <div className="space-y-3">
                    <select className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-white">
                      <option>High reach (&gt;10K)</option>
                    </select>
                    <select className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-white">
                      <option>Last 30 days</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                    />
                    <div className="pt-2 text-sm text-gray-500 dark:text-gray-400">
                      Found 12 high-performing products
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Export & Save */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="lg:order-2">
                <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
                  Export &amp; Save High Performers
                </h2>
                <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
                  Keep track of winning products and export your findings for further analysis.
                  Build your own database of high-performing Facebook ad campaigns.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      One-click save for promising products
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Export to CSV with all metrics
                    </span>
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">
                      Organize saved products with tags
                    </span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-8 dark:from-green-900/20 dark:to-green-800/20 lg:order-1">
                <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-700">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Saved Products</h3>
                    <button className="text-sm text-blue-600 dark:text-blue-400">Export CSV</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Wireless Earbuds Pro
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          15.2K reach
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-between rounded bg-yellow-50 p-3 dark:bg-yellow-900/20">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Smart Fitness Watch
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          23.5K reach
                        </div>
                      </div>
                      <svg
                        className="h-5 w-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20 dark:bg-blue-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Analyze Your Competition?</h2>
          <p className="mb-8 text-xl text-blue-100">
            Start using these powerful features today with our free trial.
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
