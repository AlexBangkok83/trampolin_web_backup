'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionCard from '@/components/subscription/SubscriptionCard';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

// Sample pricing plans - in a real app, these would come from your Stripe dashboard
const PRICING_PLANS = [
  {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 9,
    interval: 'month' as const,
    features: ['Up to 5 projects', 'Basic analytics', 'Email support', '1GB storage'],
  },
  {
    id: 'price_pro_monthly',
    name: 'Pro',
    price: 29,
    interval: 'month' as const,
    popular: true,
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      '10GB storage',
      'Team collaboration',
      'API access',
    ],
  },
  {
    id: 'price_enterprise_monthly',
    name: 'Enterprise',
    price: 99,
    interval: 'month' as const,
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'Unlimited storage',
      'Advanced security',
      'SLA guarantee',
    ],
  },
];

interface Subscription {
  id: string;
  status: string;
  priceId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId: string;
}

export default function SubscriptionPage() {
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSubscriptionChange = (subscription: Subscription | null) => {
    setCurrentSubscription(subscription);
  };

  const handleSubscriptionUpdate = () => {
    // Refresh the subscription data
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    // Refresh the subscription data after cancellation
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your subscription, view billing information, and upgrade your plan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Subscription Status */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                <SubscriptionStatus
                  key={refreshKey}
                  onSubscriptionChange={handleSubscriptionChange}
                />

                {currentSubscription && (
                  <SubscriptionCard
                    subscription={{
                      id: currentSubscription.id,
                      status: currentSubscription.status,
                      priceId: currentSubscription.priceId,
                      currentPeriodStart: new Date(currentSubscription.currentPeriodStart),
                      currentPeriodEnd: new Date(currentSubscription.currentPeriodEnd),
                      cancelAtPeriodEnd: currentSubscription.cancelAtPeriodEnd,
                    }}
                    onCancel={handleCancel}
                    onUpdate={handleSubscriptionUpdate}
                  />
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full rounded-md border border-gray-200 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    Download Invoice
                  </button>
                  <button className="w-full rounded-md border border-gray-200 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    Update Payment Method
                  </button>
                  <button className="w-full rounded-md border border-gray-200 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                    Billing History
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-lg font-medium text-gray-900">Support</h3>
                <p className="mb-4 text-sm text-gray-600">
                  Need help with your subscription? Our support team is here to help.
                </p>
                <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Contact Support
                </button>
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className="mt-12">
            <SubscriptionPlans
              plans={PRICING_PLANS}
              currentPriceId={currentSubscription?.priceId}
              onSubscribe={handleSubscriptionUpdate}
            />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
