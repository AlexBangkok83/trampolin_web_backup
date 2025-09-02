'use client';

export default function SavedProducts() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saved Products</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  Your bookmarked products for quick re-analysis
                </p>
              </div>

              {/* Saved Products Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Wireless Earbuds Pro
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        klipiq.se/products/wireless-earbuds-pro
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      15.2K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total reach</div>
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Last analyzed: 2 hours ago
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                      Update Analysis
                    </button>
                    <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Smart Fitness Watch
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        shopify.com/products/smart-watch
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      23.5K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total reach</div>
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Last analyzed: 1 day ago
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                      Update Analysis
                    </button>
                    <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      View Details
                    </button>
                  </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Premium Headphones
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        example.com/headphones-premium
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-4">
                    <div className="mb-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      8.7K
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total reach</div>
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Last analyzed: 3 days ago
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                      Update Analysis
                    </button>
                    <button className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              {/* Empty State (when no saved products) */}
              <div className="mt-12 hidden text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 16a4 4 0 11-8 0 4 4 0 018 0zm-8 8a6 6 0 00-6 6v6h12v-6a6 6 0 00-6-6z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No saved products
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Start by analyzing products and bookmarking the high-performers.
                </p>
                <div className="mt-6">
                  <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900">
                    Analyze Your First Product
                  </button>
                </div>
              </div>
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trampolin</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Analyze Facebook ads reach data to discover winning products and track competitor performance.
              </p>
              {/* Social Icons */}
              <div className="mt-4 flex space-x-3">
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                PRODUCT
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="/analyze" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Product Analysis
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Bulk Export
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                SUPPORT
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Status Page
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Feature Requests
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                LEGAL
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Data Processing Agreement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Refund Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-12 flex flex-col items-center justify-between border-t border-gray-200 pt-8 dark:border-gray-700 md:flex-row">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Trampolin. All rights reserved.
            </div>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Security
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Accessibility
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                GDPR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
