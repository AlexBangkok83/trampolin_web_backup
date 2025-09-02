'use client';

import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

export default function SavedProducts() {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="flex">
        <Sidebar currentPage="saved" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-7xl">
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
                  <button className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900">
                    Analyze Your First Product
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
