/**
 * Email triggers for common application events
 * These functions are designed to be called from other parts of the application
 */

import {
  sendWelcomeEmail,
  sendSubscriptionNotificationEmail,
  sendAdminNotificationEmail,
  SubscriptionEmailData,
  AdminNotificationData,
} from './email';
import { prisma } from './prisma';

/**
 * Trigger welcome email when a new user registers
 */
export async function triggerWelcomeEmail(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user?.email) {
      console.warn('Cannot send welcome email: user not found or no email');
      return;
    }

    await sendWelcomeEmail({
      userName: user.name || 'User',
      userEmail: user.email,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    // Also trigger admin notification for new signup
    await triggerAdminNotification({
      type: 'new_signup',
      userName: user.name || 'User',
      userEmail: user.email,
      userId,
      details: {
        registrationTime: new Date().toISOString(),
        source: 'direct_registration',
      },
    });

    console.log('Welcome email sent successfully for user:', userId);
  } catch (error) {
    console.error('Failed to trigger welcome email:', error);
    // Don't throw error - email failures shouldn't break user registration
  }
}

/**
 * Trigger subscription notification emails
 */
export async function triggerSubscriptionEmail(
  userId: string,
  subscriptionType: SubscriptionEmailData['subscriptionType'],
  additionalData?: Partial<SubscriptionEmailData>,
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user?.email) {
      console.warn('Cannot send subscription email: user not found or no email');
      return;
    }

    // Get subscription details if not provided
    let subscriptionData = additionalData;
    if (!subscriptionData && ['new', 'renewed', 'cancelled'].includes(subscriptionType)) {
      const subscription = await prisma.subscription.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (subscription) {
        // Map subscription data (you'd need to add plan name mapping based on priceId)
        const planNameMap: Record<string, string> = {
          [process.env.BRONZE_MONTHLY_PRICE || '']: 'Bronze Plan (Monthly)',
          [process.env.BRONZE_ANNUAL_PRICE || '']: 'Bronze Plan (Annual)',
          [process.env.SILVER_MONTHLY_PRICE || '']: 'Silver Plan (Monthly)',
          [process.env.SILVER_ANNUAL_PRICE || '']: 'Silver Plan (Annual)',
          [process.env.GOLD_MONTHLY_PRICE || '']: 'Gold Plan (Monthly)',
          [process.env.GOLD_ANNUAL_PRICE || '']: 'Gold Plan (Annual)',
        };

        subscriptionData = {
          planName: planNameMap[subscription.priceId] || 'Subscription Plan',
          nextBillingDate: subscription.currentPeriodEnd,
          cancelDate: subscription.canceledAt || undefined,
        };
      }
    }

    await sendSubscriptionNotificationEmail({
      userName: user.name || 'User',
      userEmail: user.email,
      subscriptionType,
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
      ...subscriptionData,
    });

    // Also trigger admin notification for subscription changes
    await triggerAdminNotification({
      type: 'subscription_change',
      userName: user.name || 'User',
      userEmail: user.email,
      userId,
      details: {
        subscriptionType,
        timestamp: new Date().toISOString(),
        ...subscriptionData,
      },
    });

    console.log(
      'Subscription email sent successfully for user:',
      userId,
      'type:',
      subscriptionType,
    );
  } catch (error) {
    console.error('Failed to trigger subscription email:', error);
    // Don't throw error - email failures shouldn't break subscription processes
  }
}

/**
 * Trigger admin notification emails
 */
export async function triggerAdminNotification(data: AdminNotificationData) {
  try {
    await sendAdminNotificationEmail(data);
    console.log('Admin notification sent successfully for:', data.type, data.userEmail);
  } catch (error) {
    console.error('Failed to trigger admin notification:', error);
    // Log error but don't throw - admin notifications are not critical
  }
}

/**
 * Trigger email when payment fails
 */
export async function triggerPaymentFailedEmail(userId: string, details?: Record<string, unknown>) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user?.email) {
      console.warn('Cannot send payment failed email: user not found or no email');
      return;
    }

    // Get subscription info
    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    const planNameMap: Record<string, string> = {
      [process.env.BRONZE_MONTHLY_PRICE || '']: 'Bronze Plan (Monthly)',
      [process.env.BRONZE_ANNUAL_PRICE || '']: 'Bronze Plan (Annual)',
      [process.env.SILVER_MONTHLY_PRICE || '']: 'Silver Plan (Monthly)',
      [process.env.SILVER_ANNUAL_PRICE || '']: 'Silver Plan (Annual)',
      [process.env.GOLD_MONTHLY_PRICE || '']: 'Gold Plan (Monthly)',
      [process.env.GOLD_ANNUAL_PRICE || '']: 'Gold Plan (Annual)',
    };

    await sendSubscriptionNotificationEmail({
      userName: user.name || 'User',
      userEmail: user.email,
      subscriptionType: 'payment_failed',
      planName: subscription ? planNameMap[subscription.priceId] : 'Your Plan',
      dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    // Also trigger admin notification
    await triggerAdminNotification({
      type: 'payment_failed',
      userName: user.name || 'User',
      userEmail: user.email,
      userId,
      details: {
        timestamp: new Date().toISOString(),
        subscriptionId: subscription?.id,
        ...details,
      },
    });

    console.log('Payment failed email sent successfully for user:', userId);
  } catch (error) {
    console.error('Failed to trigger payment failed email:', error);
  }
}

/**
 * Helper function to send internal API requests for emails
 */
export async function sendEmailViaAPI(endpoint: string, data: Record<string, unknown>) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/emails/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SYSTEM_API_KEY}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email API error:', error);
      return { success: false, error };
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error) {
    console.error('Email API request failed:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Integration with NextAuth events
 * Call this from your NextAuth configuration
 */
export const emailAuthEvents = {
  async signIn({
    user,
    isNewUser,
  }: {
    user: { id: string; email?: string | null; name?: string | null };
    isNewUser?: boolean;
  }) {
    if (isNewUser && user.id) {
      // Trigger welcome email for new users
      await triggerWelcomeEmail(user.id);
    }
  },
};

/**
 * Integration with Stripe webhook events
 * Call these from your Stripe webhook handlers
 */
export const emailStripeEvents = {
  async subscriptionCreated(userId: string, subscriptionData: Record<string, unknown>) {
    const data = subscriptionData as {
      planName?: string;
      amount?: number;
      currency?: string;
      currentPeriodEnd?: Date;
    };
    await triggerSubscriptionEmail(userId, 'new', {
      planName: data.planName,
      amount: data.amount,
      currency: data.currency,
      nextBillingDate: data.currentPeriodEnd,
    });
  },

  async subscriptionUpdated(userId: string, subscriptionData: Record<string, unknown>) {
    const data = subscriptionData as {
      planName?: string;
      amount?: number;
      currency?: string;
      currentPeriodEnd?: Date;
    };
    await triggerSubscriptionEmail(userId, 'renewed', {
      planName: data.planName,
      amount: data.amount,
      currency: data.currency,
      nextBillingDate: data.currentPeriodEnd,
    });
  },

  async subscriptionCanceled(userId: string, subscriptionData: Record<string, unknown>) {
    const data = subscriptionData as {
      planName?: string;
      canceledAt?: Date;
    };
    await triggerSubscriptionEmail(userId, 'cancelled', {
      planName: data.planName,
      cancelDate: data.canceledAt,
    });
  },

  async paymentFailed(userId: string, paymentData: Record<string, unknown>) {
    await triggerPaymentFailedEmail(userId, {
      amount: paymentData.amount,
      currency: paymentData.currency,
      lastFourDigits: paymentData.lastFourDigits,
      failureReason: paymentData.failureReason,
    });
  },
};
