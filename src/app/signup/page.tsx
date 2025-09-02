'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import PublicHeader from '../../components/PublicHeader';

const plans = {
  bronze: {
    name: 'Bronze Plan',
    price: '$29',
    features: '500 URL analyses per month',
    value: 'bronze',
  },
  silver: {
    name: 'Silver Plan',
    price: '$39',
    features: '1,000 URL analyses per month',
    value: 'silver',
  },
  gold: {
    name: 'Gold Plan',
    price: '$69',
    features: '2,500 URL analyses per month',
    value: 'gold',
  },
};

export default function Signup() {
  const searchParams = useSearchParams();
  const selectedPlan = searchParams?.get('plan') || 'silver';
  const [currentPlan, setCurrentPlan] = useState(selectedPlan);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          plan: currentPlan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresPayment && data.checkoutUrl) {
          // Redirect to Stripe Checkout to add payment method
          window.location.href = data.checkoutUrl;
        } else {
          setSuccess(true);
          console.log('Account created successfully:', data);
        }
      } else {
        setError(data.error || 'Failed to create account');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 transition-colors dark:bg-gray-900">
      <PublicHeader />
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-300">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800 dark:shadow-gray-900/20">
            {success ? (
              <div className="text-center">
                <div className="mb-4">
                  <svg
                    className="mx-auto h-12 w-12 text-green-500"
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
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Account Created!
                </h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Your {currentPlan} plan is now active with a 7-day free trial.
                </p>
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Sign In to Continue
                </Link>
              </div>
            ) : (
              <div>
                {error && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Full name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 dark:disabled:bg-gray-800"
                        placeholder="Create a password"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  {/* Subscription Plan Selection */}
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Choose your plan
                    </label>
                    <div className="space-y-3">
                      {Object.entries(plans).map(([key, plan]) => (
                        <div
                          key={key}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            currentPlan === key
                              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                              : 'border-gray-200 bg-white hover:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-blue-400'
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              id={key}
                              name="plan"
                              type="radio"
                              value={plan.value}
                              checked={currentPlan === key}
                              onChange={() => setCurrentPlan(key)}
                              className="h-4 w-4 border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-400 dark:focus:ring-blue-400"
                            />
                            <label htmlFor={key} className="ml-3 flex-1 cursor-pointer">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {plan.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {plan.features}
                                  </div>
                                </div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {plan.price}/mo
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-blue-400 dark:focus:ring-blue-400"
                    />
                    <label
                      htmlFor="terms"
                      className="ml-2 block text-sm text-gray-900 dark:text-gray-200"
                    >
                      I agree to the{' '}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Privacy Policy
                      </a>
                    </label>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 dark:disabled:bg-gray-600"
                    >
                      {loading ? 'Creating Account...' : 'Start free trial'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {!success && (
              <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
                7-day free trial, then billed monthly. Cancel anytime.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
