'use client';

export default function History() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Search History</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                  View all your previous product analyses
                </p>
              </div>

              {/* Filters */}
              <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="min-w-64 flex-1">
                    <input
                      type="text"
                      placeholder="Search by product URL or name..."
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400">
                      <option>All time</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                    </select>
                  </div>
                  <div>
                    <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400">
                      <option>All results</option>
                      <option>High reach (&gt;10K)</option>
                      <option>Medium reach (5K-10K)</option>
                      <option>Low reach (&lt;5K)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 dark:shadow-gray-900/20">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Product URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Reach
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Date Analyzed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    <tr>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Wireless Earbuds Pro
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            klipiq.se/products/wireless-earbuds
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          15.2K
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          High performer
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        2 hours ago
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Saved
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Re-analyze
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Smart Fitness Watch
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            shopify.com/products/smart-watch
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          23.5K
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          High performer
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        1 day ago
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Saved
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Re-analyze
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Gaming Keyboard RGB
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            example.com/gaming-keyboard
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                          7.8K
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Medium reach</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        2 days ago
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Analyzed
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Re-analyze
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Bluetooth Speaker
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            store.example/bluetooth-speaker
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">2.1K</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Low reach</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        3 days ago
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Analyzed
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Re-analyze
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            Premium Coffee Maker
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            coffee.shop/premium-maker
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-bold text-green-600 dark:text-green-400">
                          18.9K
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          High performer
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-200">
                        1 week ago
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          Analyzed
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            View
                          </button>
                          <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                            Re-analyze
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300">
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">1</span> to{' '}
                  <span className="font-medium">5</span> of <span className="font-medium">47</span>{' '}
                  results
                </div>
                <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                  <button className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                    Previous
                  </button>
                  <button className="relative inline-flex items-center border border-gray-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 dark:border-gray-600 dark:bg-blue-900/30 dark:text-blue-400">
                    1
                  </button>
                  <button className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    2
                  </button>
                  <button className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                    3
                  </button>
                  <button className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                    Next
                  </button>
                </nav>
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
