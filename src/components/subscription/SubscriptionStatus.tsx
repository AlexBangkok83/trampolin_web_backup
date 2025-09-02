'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface Subscription {
  id: string;
  status: string;
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId: string;
}

interface SubscriptionStatusProps {
  onSubscriptionChange?: (subscription: Subscription | null) => void;
}

export default function SubscriptionStatus({ onSubscriptionChange }: SubscriptionStatusProps) {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        onSubscriptionChange?.(data.subscription);
      } else if (response.status === 404) {
        // No subscription found
        setSubscription(null);
        onSubscriptionChange?.(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch subscription');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  }, [onSubscriptionChange]);

  useEffect(() => {
    if (session?.user) {
      fetchSubscription();
    }
  }, [session, fetchSubscription]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
      case 'canceled':
        return { text: 'Canceled', color: 'text-red-600', bg: 'bg-red-100' };
      case 'past_due':
        return { text: 'Past Due', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'incomplete':
        return { text: 'Incomplete', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'paused':
        return { text: 'Paused', color: 'text-gray-600', bg: 'bg-gray-100' };
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!session) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <p className="text-gray-600">Please sign in to view your subscription status.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="animate-pulse">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-4 text-red-600">
          <p>Error: {error}</p>
        </div>
        <button
          onClick={fetchSubscription}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Subscription Status</h3>
        <p className="mb-4 text-gray-600">You don&apos;t have an active subscription.</p>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Subscribe to unlock premium features and get the most out of our platform.
          </p>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(subscription.status);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusDisplay.bg} ${statusDisplay.color}`}
        >
          {statusDisplay.text}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gray-500">Plan ID</p>
          <p className="mt-1 text-sm text-gray-900">{subscription.priceId}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Customer ID</p>
          <p className="mt-1 font-mono text-sm text-gray-900">{subscription.stripeCustomerId}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Current Period Start</p>
          <p className="mt-1 text-sm text-gray-900">
            {formatDate(subscription.currentPeriodStart)}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">Current Period End</p>
          <p className="mt-1 text-sm text-gray-900">{formatDate(subscription.currentPeriodEnd)}</p>
        </div>
      </div>

      {subscription.cancelAtPeriodEnd && (
        <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                Your subscription will be canceled at the end of the current billing period on{' '}
                {formatDate(subscription.currentPeriodEnd)}.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={fetchSubscription}
          className="text-sm text-blue-600 hover:text-blue-500 focus:underline focus:outline-none"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
}
