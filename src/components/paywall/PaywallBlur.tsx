'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { 
  LockClosedIcon, 
  CreditCardIcon, 
  SparklesIcon,
  ExclamationTriangleIcon 
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

export function PaywallBlur({ children, isBlocked, reason, planName, usageInfo }: PaywallBlurProps) {
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
          borderColor: 'border-blue-200'
        };
      
      case 'payment_overdue':
        return {
          icon: <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />,
          title: 'Payment Required',
          message: 'Your subscription payment is overdue. Update your payment method to restore access.',
          actionText: 'Update Payment',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      
      case 'trial_expired':
        return {
          icon: <SparklesIcon className="h-12 w-12 text-purple-500" />,
          title: 'Trial Expired',
          message: 'Your free trial has ended. Subscribe now to continue accessing analytics.',
          actionText: 'Subscribe Now',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      
      case 'usage_exceeded':
        return {
          icon: <LockClosedIcon className="h-12 w-12 text-amber-500" />,
          title: 'Usage Limit Reached',
          message: planName === 'Gold' 
            ? `You've used ${usageInfo?.used}/${usageInfo?.limit} analyses this month. Purchase additional credits or upgrade to continue.`
            : `You've used ${usageInfo?.used}/${usageInfo?.limit} analyses this month. Upgrade your plan to continue.`,
          actionText: planName === 'Gold' ? 'Buy More Credits' : 'Upgrade Plan',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        };
      
      default:
        return {
          icon: <LockClosedIcon className="h-12 w-12 text-gray-500" />,
          title: 'Access Restricted',
          message: 'This content requires an active subscription.',
          actionText: 'Upgrade Now',
          actionLink: '/dashboard/subscription',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const blockedContent = getBlockedContent();

  return (
    <div className="relative">
      {/* Blurred Content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Paywall Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className={`max-w-md w-full mx-4 ${blockedContent.bgColor} ${blockedContent.borderColor} border-2 rounded-xl p-8 text-center shadow-lg`}>
          <div className="flex justify-center mb-4">
            {blockedContent.icon}
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {blockedContent.title}
          </h3>
          
          <p className="text-gray-600 mb-6">
            {blockedContent.message}
          </p>

          {/* Current Usage Info */}
          {usageInfo && reason === 'usage_exceeded' && (
            <div className="mb-6 p-3 bg-white rounded-lg border">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Monthly Usage</span>
                <span>{Math.round((usageInfo.used / usageInfo.limit) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((usageInfo.used / usageInfo.limit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {usageInfo.used.toLocaleString()} / {usageInfo.limit.toLocaleString()} analyses used
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={blockedContent.actionLink}
              className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {blockedContent.actionText}
            </Link>
            
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
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
export function usePaywallCheck(subscription: unknown) {
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
        limit: sub.activeLimit
      }
    };
  }

  return { isBlocked: false, reason: null };
}