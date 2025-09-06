'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PaywallBlur, usePaywallCheck } from '@/components/paywall/PaywallBlur';
import ReachChart from '@/components/charts/ReachChart';
import { normalizeUrl } from '@/utils/urlUtils';
import { getSubscriptionWithCache, clearSubscriptionCache } from '@/utils/subscriptionCache';

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

interface PopularExample {
  url: string;
  originalUrl: string;
  description: string;
  totalReach: number;
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
  const [chartData, setChartData] = useState<
    Array<{
      url: string;
      originalUrl: string;
      data: Array<{ date: string; reach: number; adCount: number }>;
    }>
  >([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [examples, setExamples] = useState<PopularExample[]>([]);
  const [examplesLoading, setExamplesLoading] = useState(true);

  // Use cached subscription data with 24-hour cache
  useEffect(() => {
    if (session?.user) {
      fetchSubscriptionData();
    } else {
      setLoading(false);
    }
    fetchExamples();
  }, [session]);

  const fetchSubscriptionData = async () => {
    try {
      // Use cached subscription with 24-hour cache duration
      const subData = await getSubscriptionWithCache();
      if (subData) {
        setSubscription(subData);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExamples = async () => {
    try {
      const response = await fetch('/api/popular-examples');
      if (response.ok) {
        const data = await response.json();
        setExamples(data.examples || []);
      }
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    } finally {
      setExamplesLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urls.trim()) return;

    // Automatically normalize URLs (Facebook redirects, www cleanup, etc.)
    const rawUrlList = urls
      .trim()
      .split('\n')
      .filter((url) => url.trim());

    const normalizedUrlList = rawUrlList.map((url) => {
      const cleaned = normalizeUrl(url.trim());
      // Add back https:// for processing
      return cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    });

    // Update the URLs in the textarea to show the cleaned versions
    if (JSON.stringify(normalizedUrlList) !== JSON.stringify(rawUrlList)) {
      setUrls(normalizedUrlList.join('\n'));
    }

    const urlCount = normalizedUrlList.length;

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
    setChartData([]);
    setIsAnalyzing(true);
    setChartLoading(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: normalizedUrlList }),
      });

      if (response.ok) {
        const result = await response.json();
        // Clear cache and refresh subscription data to show updated usage
        clearSubscriptionCache();
        await fetchSubscriptionData();
        // Show results
        setResults(result.analyses || []);

        // Fetch reach data for chart
        try {
          const reachResponse = await fetch('/api/ads/reach-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ urls: normalizedUrlList }),
          });

          if (reachResponse.ok) {
            const reachData = await reachResponse.json();
            setChartData(reachData.results || []);
          } else {
            console.error('Failed to fetch reach data');
          }
        } catch (error) {
          console.error('Error fetching reach data:', error);
        }

        setSuccess(
          `Successfully analyzed ${normalizedUrlList.length} URL${normalizedUrlList.length !== 1 ? 's' : ''}! Check the chart below for Facebook ads reach data.`,
        );
        setUrls(''); // Clear the textarea
      } else {
        const error = await response.json();
        setError(error.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError('Failed to analyze URLs. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setChartLoading(false);
    }
  };

  const remaining = subscription ? subscription.activeRemaining : 0;
  const urlCount = urls
    .trim()
    .split('\n')
    .filter((url) => url.trim()).length;

  // Check if content should be blocked
  const { isBlocked, reason, usageInfo } = usePaywallCheck(subscription);
  const planName =
    subscription?.activeLimit === 2500
      ? 'Gold'
      : subscription?.activeLimit === 1000
        ? 'Silver'
        : 'Bronze';

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

        {/* Analysis Form with Paywall */}
        <PaywallBlur
          isBlocked={isBlocked}
          reason={reason || 'subscription_required'}
          planName={planName}
          usageInfo={usageInfo}
        >
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

            {/* Usage Progress */}
            {subscription && !loading && (
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {subscription.isTrialing ? 'Trial Usage' : 'Usage This Period'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {subscription.activeUsed} / {subscription.activeLimit}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${Math.min((subscription.activeUsed / subscription.activeLimit) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {remaining} searches remaining
                  {subscription.isTrialing && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">(Free Trial)</span>
                  )}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {loading && <span>Loading subscription...</span>}
                {!subscription && !loading && (
                  <span className="text-red-600 dark:text-red-400">
                    No active subscription found
                  </span>
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

          {/* Chart Display */}
          {(chartData.length > 0 || chartLoading) && (
            <div className="mb-8">
              <ReachChart datasets={chartData} isLoading={chartLoading} />
            </div>
          )}

          {/* Quick Start Examples */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Quick Start Examples
            </h3>
            {examplesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-gray-200 p-3 dark:border-gray-600"
                  >
                    <div className="animate-pulse">
                      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {example.description}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{example.url}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUrls(example.url)}
                      className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Try this
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Analysis Ready
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Facebook Ads Data
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Facebook ads reach analysis completed for {results.length} URL
                  {results.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => (window.location.href = '/history')}
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View History →
                </button>
              </div>
            </div>
          )}
        </PaywallBlur>

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
                  Search Facebook ads database for reach data
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
                  View Facebook ads reach trends and performance
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
