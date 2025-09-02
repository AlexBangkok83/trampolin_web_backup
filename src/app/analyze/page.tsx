'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserSubscription {
  id: string;
  monthlyLimit: number;
  usedThisMonth: number;
  trialLimit: number;
  trialUsed: number;
  currentPeriodEnd: string;
  status: string;
  isTrialing: boolean;
  activeLimit: number;
  activeUsed: number;
  activeRemaining: number;
}

export default function Analyze() {
  const { data: session } = useSession();
  const [urls, setUrls] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch user subscription data
  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls.trim()) return;

    const urlList = urls
      .trim()
      .split('\n')
      .filter((url) => url.trim());
    const urlCount = urlList.length;

    // Check usage limits (trial or monthly)
    if (subscription) {
      const remaining = subscription.activeRemaining;
      if (urlCount > remaining) {
        const limitType = subscription.isTrialing ? 'trial' : 'monthly';
        const upgradeMessage = subscription.isTrialing
          ? 'Please upgrade to a paid plan to continue.'
          : 'Please upgrade your plan or wait for your next billing period.';
        setError(
          `You need ${urlCount} analyses but only have ${remaining} remaining in your ${limitType}. ${upgradeMessage}`,
        );
        return;
      }
    }

    setError(null);
    setSuccess(null);
    setResults([]);
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: urlList }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh subscription data to show updated usage
        await fetchSubscription();
        // Show results
        setResults(result.analyses || []);
        setSuccess(
          `Successfully analyzed ${urlList.length} URL${urlList.length !== 1 ? 's' : ''}! Check your dashboard for detailed results.`,
        );
        setUrls(''); // Clear the textarea
      } else {
        const error = await response.json();
        setError(error.message || 'Analysis failed');
      }
    } catch {
      setError('Failed to analyze URLs. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const remaining = subscription ? subscription.activeRemaining : 0;
  const urlCount = urls
    .trim()
    .split('\n')
    .filter((url) => url.trim()).length;
  return (
    <div className="flex min-h-full flex-col">
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analyze Product</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Enter product URLs to analyze Facebook ads reach data
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
            {success}
          </div>
        )}

        {/* Analysis Form */}
        <form
          onSubmit={handleAnalyze}
          className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          suppressHydrationWarning
        >
          <div className="mb-6">
            <label
              htmlFor="urls"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Product URLs
            </label>
            <textarea
              id="urls"
              name="urls"
              rows={6}
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              disabled={isAnalyzing}
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
              placeholder="Enter one or more product URLs (one per line)&#10;&#10;Examples:&#10;https://shopify.store/products/wireless-earbuds&#10;https://klipiq.se/products/smart-watch&#10;https://example.com/products/fitness-tracker"
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                You can analyze up to 10 URLs at once. Each URL counts as one search.
              </p>
              {urlCount > 0 && (
                <span
                  className={`font-medium ${
                    urlCount > remaining
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {urlCount} URL{urlCount !== 1 ? 's' : ''} selected
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? (
                <span>Loading subscription...</span>
              ) : subscription ? (
                <span>
                  {subscription.isTrialing ? (
                    <>
                      Trial searches remaining:{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {remaining} of {subscription.trialLimit}
                      </span>
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        (Free Trial)
                      </span>
                    </>
                  ) : (
                    <>
                      Searches remaining this month:{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {remaining} of {subscription.activeLimit}
                      </span>
                    </>
                  )}
                </span>
              ) : (
                <span className="text-red-600 dark:text-red-400">No active subscription found</span>
              )}
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !urls.trim() || urlCount > remaining || !subscription}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-gray-800 dark:disabled:bg-gray-600"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze URLs'}
            </button>
          </div>
        </form>

        {/* Quick Start Examples */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Quick Start Examples
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Analyze trending wireless earbuds
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  shopify.store/products/wireless-earbuds
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUrls('https://shopify.store/products/wireless-earbuds')}
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Try this
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Check smart watch performance
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  klipiq.se/products/smart-watch
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUrls('https://klipiq.se/products/smart-watch')}
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Try this
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Fitness tracker analysis
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  example.com/products/fitness-tracker
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUrls('https://example.com/products/fitness-tracker')}
                className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Try this
              </button>
            </div>
          </div>
        </div>

        {/* Results Display */}
        {results.length > 0 && (
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Analysis Results
            </h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={(result as { id?: string }).id || index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                >
                  <div className="flex-1">
                    <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                      {(result as { url?: string }).url}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Status:{' '}
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {(result as { status?: string }).status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {(result as { url?: string }).url?.length || 0} chars
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Character count</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                Analysis completed for {results.length} URL{results.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View Dashboard →
              </button>
            </div>
          </div>
        )}

        {/* How it Works */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">How it works</h3>
          <div className="grid gap-4 text-sm md:grid-cols-3">
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
                1
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Submit URLs</div>
                <div className="text-gray-600 dark:text-gray-300">
                  Enter product URLs from any store
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
                2
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">We analyze</div>
                <div className="text-gray-600 dark:text-gray-300">
                  Count URL characters and structure
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white dark:bg-blue-500">
                3
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Get insights</div>
                <div className="text-gray-600 dark:text-gray-300">
                  View character count and URL breakdown
                </div>
              </div>
            </div>
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
                Analyze Facebook ads reach data to discover winning products and track competitor
                performance.
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
                  <a
                    href="/analyze"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Product Analysis
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    API Access
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
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
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Contact Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Status Page
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
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
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    Data Processing Agreement
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
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
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Security
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Accessibility
              </a>
              <a
                href="#"
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                GDPR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
