'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PublicHeader from '../../components/PublicHeader';

export default function Welcome() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [loading, setLoading] = useState(!!sessionId);
  const [, setSession] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      // Verify the checkout session
      fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            setSession(data.session);
          } else {
            setError(data.error || 'Failed to verify session');
          }
        })
        .catch(() => {
          setError('Network error');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <PublicHeader />

      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {loading ? (
            <div>
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Setting up your account...
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Please wait while we confirm your payment details.
              </p>
            </div>
          ) : error ? (
            <div>
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Something went wrong
              </h1>
              <p className="mb-8 text-gray-600 dark:text-gray-300">{error}</p>
              <Link
                href="/signup"
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Try Again
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
                Welcome to Trampolin! 🎉
              </h1>

              <p className="mb-8 text-xl text-gray-600 dark:text-gray-300">
                Your account is all set up and your 7-day free trial has started.
              </p>

              <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  What you get during your trial:
                </h3>
                <ul className="space-y-2 text-left text-gray-700 dark:text-gray-300">
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    10 free URL analyses to test the service
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Full access to Facebook ads reach data
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    CSV export and saved products features
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    7 full days to explore everything
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <Link
                  href="/login"
                  className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Start Analyzing Products
                </Link>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your trial will automatically convert to your selected plan after 7 days.
                  <br />
                  Cancel anytime from your account settings.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
