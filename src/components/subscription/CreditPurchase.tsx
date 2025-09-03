'use client';

import { useState, useEffect } from 'react';
import { CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface CreditPricingInfo {
  goldPlanPrice: number;
  goldPlanCredits: number;
  creditPackSize: number;
  creditPackPrice: number;
  calculation: {
    normalCostPerCredit: string;
    discountedCostPerCredit: string;
    savings: string;
  };
}

interface CreditPurchaseProps {
  currentUsage: number;
  monthlyLimit: number;
  isGoldUser: boolean;
}

export function CreditPurchase({ currentUsage, monthlyLimit, isGoldUser }: CreditPurchaseProps) {
  const [creditPacks, setCreditPacks] = useState(1);
  const [pricing, setPricing] = useState<CreditPricingInfo | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (isGoldUser) {
      fetchPricing();
    }
  }, [isGoldUser]);

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/credit-pricing');
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch credit pricing:', error);
    }
  };

  const handlePurchaseCredits = async () => {
    if (!pricing) return;

    setPurchasing(true);
    try {
      const response = await fetch('/api/purchase-credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditPacks
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to initiate credit purchase');
      }
    } catch (error) {
      console.error('Credit purchase error:', error);
      alert('Failed to purchase credits');
    } finally {
      setPurchasing(false);
    }
  };

  const usagePercentage = (currentUsage / monthlyLimit) * 100;
  const isHighUsage = usagePercentage > 80;
  const totalCredits = pricing ? creditPacks * pricing.creditPackSize : 0;
  const totalCost = pricing ? creditPacks * pricing.creditPackPrice : 0;

  // Don't show for non-Gold users
  if (!isGoldUser) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 ${isHighUsage ? 'border-amber-300 ring-2 ring-amber-200' : 'border-amber-200'} p-6`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <SparklesIcon className="h-6 w-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900">
            Need More Credits?
            {isHighUsage && <span className="ml-2 text-sm font-medium text-amber-700">(Running Low!)</span>}
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            As a Gold subscriber, you can purchase additional analysis credits at 50% off the regular rate.
          </p>

          {pricing && (
            <div className="mt-4 space-y-4">
              {/* Pricing Display */}
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Regular Cost:</span>
                    <div className="text-gray-500 line-through">{pricing.calculation.normalCostPerCredit} per credit</div>
                  </div>
                  <div>
                    <span className="font-medium text-amber-700">Your Price:</span>
                    <div className="text-amber-900 font-semibold">{pricing.calculation.discountedCostPerCredit} per credit</div>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {pricing.calculation.savings} Savings!
                  </span>
                </div>
              </div>

              {/* Purchase Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    Credit Packs (100 credits each)
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCreditPacks(Math.max(1, creditPacks - 1))}
                      className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center"
                      disabled={creditPacks <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-amber-900">{creditPacks}</span>
                    <button
                      onClick={() => setCreditPacks(Math.min(10, creditPacks + 1))}
                      className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 hover:bg-amber-200 flex items-center justify-center"
                      disabled={creditPacks >= 10}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex-1 text-right">
                  <div className="text-sm text-amber-700">
                    {totalCredits.toLocaleString()} credits
                  </div>
                  <div className="text-xl font-bold text-amber-900">
                    ${totalCost.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Purchase Button */}
              <button
                onClick={handlePurchaseCredits}
                disabled={purchasing}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {purchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Purchase {totalCredits.toLocaleString()} Credits for ${totalCost.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-amber-600 text-center">
                Credits never expire and roll over month to month • Secure payment via Stripe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}