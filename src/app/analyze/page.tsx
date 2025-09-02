'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '../../components/Sidebar';
import Footer from '../../components/Footer';

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
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <div className="flex">
        <Sidebar currentPage="analyze" />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-8">
            <div className="mx-auto max-w-4xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Analyze Product
                </h1>
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
                        key={result.id || index}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-600"
                      >
                        <div className="flex-1">
                          <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                            {result.url}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Status:{' '}
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {result.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {result.url?.length || 0} chars
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Character count
                          </div>
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
                <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                  How it works
                </h3>
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
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
