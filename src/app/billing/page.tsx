'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreditCard, Download, Calendar, Check } from 'lucide-react';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  monthlyLimit: number;
  usedThisMonth: number;
}

export default function Billing() {
  const { data: session } = useSession();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage your subscription and billing information
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading billing information...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Plan</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                }`}>
                  {subscription?.status || 'No active subscription'}
                </span>
              </div>
              
              {subscription ? (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">{subscription.plan}</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        {subscription.monthlyLimit} searches per month
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Advanced analytics
                      </div>
                      <div className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        Priority support
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Usage This Month</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Searches used:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subscription.usedThisMonth} / {subscription.monthlyLimit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((subscription.usedThisMonth / subscription.monthlyLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-2" />
                        Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Subscribe to unlock advanced features and higher limits
                  </p>
                  <a
                    href="/pricing"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    View Plans
                  </a>
                </div>
              )}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Billing History</h2>
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  <Download className="h-4 w-4 mr-1" />
                  Download All
                </button>
              </div>
              
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="h-8 w-8 mx-auto mb-2" />
                No billing history available
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>
              
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <CreditCard className="h-8 w-8 mx-auto mb-2" />
                No payment method on file
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trampolin</h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Analyze Facebook ads reach data to discover winning products and track competitor performance.
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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
                  <a href="/analyze" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Product Analysis
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    API Access
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Contact Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Status Page
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                    Data Processing Agreement
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Security
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Accessibility
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                GDPR
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}