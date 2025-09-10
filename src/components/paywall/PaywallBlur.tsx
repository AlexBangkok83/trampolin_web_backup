'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import {
  LockClosedIcon,
  CreditCardIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface PaywallBlurProps {
  children: ReactNode;
  isBlocked: boolean;
  reason: 'subscription_required' | 'payment_overdue' | 'trial_expired' | 'usage_exceeded';
  planName?: string;
  usageInfo?: {
    used: number;
    limit: number;
  };
}

export function PaywallBlur({
  children,
  isBlocked,
  reason,
  planName,
  usageInfo,
}: PaywallBlurProps) {
  if (!isBlocked) {
    return <>{children}</>;
  }

  const getBlockedContent = () => {
    switch (reason) {
      case 'subscription_required':
        return {
          icon: <CreditCardIcon className="h-12 w-12 text-blue-500" />,
          title: 'Subscription Required',
          message: 'Upgrade to access detailed analytics and insights.',
          actionText: 'Choose Your Plan',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };

      case 'payment_overdue':
        return {
          icon: <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />,
          title: 'Payment Required',
          message:
            'Your subscription payment is overdue. Update your payment method to restore access.',
          actionText: 'Update Payment',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };

      case 'trial_expired':
        return {
          icon: <SparklesIcon className="h-12 w-12 text-purple-500" />,
          title: 'Trial Expired',
          message: 'Your free trial has ended. Subscribe now to continue accessing analytics.',
          actionText: 'Subscribe Now',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
        };

      case 'usage_exceeded':
        return {
          icon: <LockClosedIcon className="h-12 w-12 text-amber-500" />,
          title: 'Usage Limit Reached',
          message:
            planName === 'Gold'
              ? `You've used ${usageInfo?.used}/${usageInfo?.limit} analyses this month. Purchase additional credits or upgrade to continue.`
              : `You've used ${usageInfo?.used}/${usageInfo?.limit} analyses this month. Upgrade your plan to continue.`,
          actionText: planName === 'Gold' ? 'Buy More Credits' : 'Upgrade Plan',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };

      default:
        return {
          icon: <LockClosedIcon className="h-12 w-12 text-gray-500" />,
          title: 'Access Restricted',
          message: 'This content requires an active subscription.',
          actionText: 'Upgrade Now',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const blockedContent = getBlockedContent();

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="pointer-events-none select-none blur-sm filter">{children}</div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div
          className={`mx-4 w-full max-w-md ${blockedContent.bgColor} ${blockedContent.borderColor} rounded-xl border-2 p-8 text-center shadow-lg`}
        >
          <div className="mb-4 flex justify-center">{blockedContent.icon}</div>

          <h3 className="mb-2 text-xl font-bold text-gray-900">{blockedContent.title}</h3>

          <p className="mb-6 text-gray-600">{blockedContent.message}</p>

          {/* Current Usage Info */}
          {usageInfo && reason === 'usage_exceeded' && (
            <div className="mb-6 rounded-lg border bg-white p-3">
              <div className="mb-1 flex justify-between text-sm text-gray-600">
                <span>Monthly Usage</span>
                <span>{Math.round((usageInfo.used / usageInfo.limit) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min((usageInfo.used / usageInfo.limit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {usageInfo.used.toLocaleString()} / {usageInfo.limit.toLocaleString()} analyses used
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={blockedContent.actionLink}
              className="inline-flex w-full items-center justify-center rounded-lg border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {blockedContent.actionText}
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to determine if content should be blocked
export function usePaywallCheck(subscription: unknown, userRole?: string) {
  // Admin users bypass all subscription checks
  if (userRole === 'admin') {
    return { isBlocked: false, reason: null };
  }

  if (!subscription || typeof subscription !== 'object') {
    return { isBlocked: true, reason: 'subscription_required' as const };
  }

  const sub = subscription as {
    status?: string;
    isTrialing?: boolean;
    activeUsed?: number;
    activeLimit?: number;
  };

  // Check payment status
  if (sub.status === 'past_due' || sub.status === 'unpaid') {
    return { isBlocked: true, reason: 'payment_overdue' as const };
  }

  // Check if trial expired
  if (sub.status === 'canceled' && sub.isTrialing) {
    return { isBlocked: true, reason: 'trial_expired' as const };
  }

  // Check usage limits
  if (sub.activeUsed && sub.activeLimit && sub.activeUsed >= sub.activeLimit) {
    return {
      isBlocked: true,
      reason: 'usage_exceeded' as const,
      usageInfo: {
        used: sub.activeUsed,
        limit: sub.activeLimit,
      },
    };
  }

  return { isBlocked: false, reason: null };
}
