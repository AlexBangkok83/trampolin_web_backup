'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface SubscriptionCardProps {
  subscription: {
    id: string;
    status: string;
    priceId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd?: boolean;
  } | null;
  onCancel?: () => void;
  onUpdate?: () => void;
}

export default function SubscriptionCard({
  subscription,
  onCancel,
  onUpdate,
}: SubscriptionCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    if (!subscription || !session) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          cancelAtPeriodEnd: true,
        }),
      });

      if (response.ok) {
        onCancel?.();
      } else {
        const error = await response.json();
        console.error('Failed to cancel subscription:', error);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!subscription) {
    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">Subscription</h3>
        <p className="mb-4 text-gray-600">You don't have an active subscription.</p>
        <button
          onClick={onUpdate}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Subscribe Now
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(subscription.status)}`}
        >
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Plan ID</p>
          <p className="font-medium">{subscription.priceId}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600">Current Period</p>
          <p className="font-medium">
            {formatDate(subscription.currentPeriodStart)} -{' '}
            {formatDate(subscription.currentPeriodEnd)}
          </p>
        </div>

        {subscription.cancelAtPeriodEnd && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current billing period.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex space-x-3">
        {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
          <button
            onClick={handleCancelSubscription}
            disabled={isLoading}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-50"
          >
            {isLoading ? 'Canceling...' : 'Cancel Subscription'}
          </button>
        )}

        <button
          onClick={onUpdate}
          className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          Manage Plan
        </button>
      </div>
    </div>
  );
}
