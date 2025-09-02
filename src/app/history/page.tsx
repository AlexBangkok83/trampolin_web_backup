'use client';

import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

export default function History() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="flex">
        <Sidebar currentPage="history" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-7xl">
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
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
