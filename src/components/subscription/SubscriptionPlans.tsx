'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

interface SubscriptionPlansProps {
  plans: PricingPlan[];
  currentPriceId?: string;
  onSubscribe?: (priceId: string) => void;
}

export default function SubscriptionPlans({
  plans,
  currentPriceId,
  onSubscribe,
}: SubscriptionPlansProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!session) {
      // Redirect to login
      window.location.href = '/auth/login';
      return;
    }

    setIsLoading(priceId);
    try {
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      if (response.ok) {
        onSubscribe?.(priceId);
        // Optionally redirect to success page or refresh subscription data
      } else {
        const error = await response.json();
        console.error('Failed to create subscription:', error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleUpdateSubscription = async (newPriceId: string) => {
    if (!session || !currentPriceId) return;

    setIsLoading(newPriceId);
    try {
      const response = await fetch('/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: currentPriceId, // This should be the subscription ID, not price ID
          newPriceId,
        }),
      });

      if (response.ok) {
        onSubscribe?.(newPriceId);
      } else {
        const error = await response.json();
        console.error('Failed to update subscription:', error);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Choose Your Plan</h2>
          <p className="mt-4 text-xl text-gray-600">Select the perfect plan for your needs</p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`divide-y divide-gray-200 rounded-lg border border-gray-200 shadow-sm ${
                plan.popular ? 'border-blue-500 ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="rounded-t-lg bg-blue-500 py-2 text-center text-white">
                  <span className="text-sm font-medium">Most Popular</span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-sm text-gray-500">
                  Perfect for {plan.name.toLowerCase()} users
                </p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/{plan.interval}</span>
                </p>

                <button
                  onClick={() =>
                    currentPriceId ? handleUpdateSubscription(plan.id) : handleSubscribe(plan.id)
                  }
                  disabled={isLoading === plan.id || currentPriceId === plan.id}
                  className={`mt-8 block w-full rounded-md border border-transparent py-2 text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    currentPriceId === plan.id
                      ? 'cursor-not-allowed bg-gray-100 text-gray-500'
                      : plan.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                        : 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500'
                  }`}
                >
                  {isLoading === plan.id
                    ? 'Processing...'
                    : currentPriceId === plan.id
                      ? 'Current Plan'
                      : currentPriceId
                        ? 'Switch to This Plan'
                        : 'Get Started'}
                </button>
              </div>

              <div className="px-6 pb-8 pt-6">
                <h4 className="text-sm font-medium uppercase tracking-wide text-gray-900">
                  What&apos;s included
                </h4>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex space-x-3">
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
