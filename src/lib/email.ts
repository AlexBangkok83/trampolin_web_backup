import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import { SubscriptionNotificationEmail } from '@/components/emails/SubscriptionNotificationEmail';
import { AdminNotificationEmail } from '@/components/emails/AdminNotificationEmail';
import { PasswordResetEmail } from '@/components/emails/PasswordResetEmail';
import { GeneralTransactionalEmail } from '@/components/emails/GeneralTransactionalEmail';

// Initialize Resend with API key (optional for production builds)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Email configuration
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Trampolin <noreply@trampolin.ai>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@trampolin.ai',
  adminEmails: (process.env.ADMIN_EMAILS || 'admin@trampolin.ai').split(','),
  domain: process.env.NEXTAUTH_URL || 'http://localhost:3000',
} as const;

// Rate limiting configuration
const RATE_LIMITS = {
  welcome: { count: 1, window: 60 * 1000 }, // 1 per minute
  subscription: { count: 5, window: 60 * 1000 }, // 5 per minute
  admin: { count: 10, window: 60 * 1000 }, // 10 per minute
  passwordReset: { count: 3, window: 60 * 60 * 1000 }, // 3 per hour
  general: { count: 20, window: 60 * 1000 }, // 20 per minute
} as const;

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if an email type is rate limited for a specific identifier
 */
function isRateLimited(type: keyof typeof RATE_LIMITS, identifier: string): boolean {
  const key = `${type}:${identifier}`;
  const now = Date.now();
  const limit = RATE_LIMITS[type];

  const current = rateLimitStore.get(key);

  if (!current || now > current.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + limit.window });
    return false;
  }

  if (current.count >= limit.count) {
    return true;
  }

  current.count++;
  return false;
}

/**
 * Base email sending function with error handling and logging
 */
async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}) {
  // If Resend is not configured, log and return mock success
  if (!resend) {
    console.log('Email sending disabled (no RESEND_API_KEY):', {
      to: params.to,
      subject: params.subject,
    });
    return { success: true, id: 'mock-email-id' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from || EMAIL_CONFIG.from,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      replyTo: params.replyTo || EMAIL_CONFIG.replyTo,
      headers: params.headers,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', {
      id: data?.id,
      to: params.to,
      subject: params.subject,
    });

    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
}

// Email Templates and Types
export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  dashboardUrl: string;
}

export interface SubscriptionEmailData {
  userName: string;
  userEmail: string;
  subscriptionType: 'new' | 'cancelled' | 'payment_failed' | 'renewed';
  planName?: string;
  amount?: number;
  currency?: string;
  nextBillingDate?: Date;
  cancelDate?: Date;
  dashboardUrl: string;
}

export interface AdminNotificationData {
  type: 'new_signup' | 'subscription_change' | 'payment_failed' | 'refund_request';
  userName: string;
  userEmail: string;
  userId: string;
  details?: Record<string, unknown>;
  actionUrl?: string;
}

export interface PasswordResetData {
  userName: string;
  userEmail: string;
  resetToken: string;
  resetUrl: string;
  expiresAt: Date;
}

export interface GeneralTransactionalData {
  userName: string;
  userEmail: string;
  subject: string;
  heading: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  footerText?: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData) {
  if (isRateLimited('welcome', data.userEmail)) {
    throw new Error('Rate limit exceeded for welcome emails');
  }

  const emailHtml = await render(
    WelcomeEmail({
      userName: data.userName,
      dashboardUrl: data.dashboardUrl,
    }),
  );

  return sendEmail({
    to: data.userEmail,
    subject: 'Welcome to Trampolin - Your Analytics Journey Starts Here',
    html: emailHtml,
    headers: {
      'X-Email-Type': 'welcome',
    },
  });
}

/**
 * Send subscription-related notifications
 */
export async function sendSubscriptionNotificationEmail(data: SubscriptionEmailData) {
  if (isRateLimited('subscription', data.userEmail)) {
    throw new Error('Rate limit exceeded for subscription emails');
  }

  let subject = '';
  switch (data.subscriptionType) {
    case 'new':
      subject = `Welcome to ${data.planName} - Your Subscription is Active`;
      break;
    case 'cancelled':
      subject = "Subscription Cancelled - We'll Miss You";
      break;
    case 'payment_failed':
      subject = 'Payment Failed - Action Required';
      break;
    case 'renewed':
      subject = `Subscription Renewed - ${data.planName} Plan`;
      break;
  }

  const emailHtml = await render(SubscriptionNotificationEmail(data));

  return sendEmail({
    to: data.userEmail,
    subject,
    html: emailHtml,
    headers: {
      'X-Email-Type': 'subscription',
      'X-Subscription-Type': data.subscriptionType,
    },
  });
}

/**
 * Send admin notifications
 */
export async function sendAdminNotificationEmail(data: AdminNotificationData) {
  if (isRateLimited('admin', 'admin-notifications')) {
    console.warn('Rate limit exceeded for admin notifications');
    return; // Don't throw for admin notifications, just log
  }

  let subject = '';
  switch (data.type) {
    case 'new_signup':
      subject = `New User Signup: ${data.userName}`;
      break;
    case 'subscription_change':
      subject = `Subscription Change: ${data.userName}`;
      break;
    case 'payment_failed':
      subject = `Payment Failed: ${data.userName}`;
      break;
    case 'refund_request':
      subject = `Refund Request: ${data.userName}`;
      break;
  }

  const emailHtml = await render(AdminNotificationEmail(data));

  return sendEmail({
    to: EMAIL_CONFIG.adminEmails,
    subject,
    html: emailHtml,
    headers: {
      'X-Email-Type': 'admin-notification',
      'X-Admin-Type': data.type,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: PasswordResetData) {
  if (isRateLimited('passwordReset', data.userEmail)) {
    throw new Error('Rate limit exceeded for password reset emails');
  }

  const emailHtml = await render(PasswordResetEmail(data));

  return sendEmail({
    to: data.userEmail,
    subject: 'Reset Your Trampolin Password',
    html: emailHtml,
    headers: {
      'X-Email-Type': 'password-reset',
    },
  });
}

/**
 * Send general transactional emails
 */
export async function sendGeneralTransactionalEmail(data: GeneralTransactionalData) {
  if (isRateLimited('general', data.userEmail)) {
    throw new Error('Rate limit exceeded for general emails');
  }

  const emailHtml = await render(GeneralTransactionalEmail(data));

  return sendEmail({
    to: data.userEmail,
    subject: data.subject,
    html: emailHtml,
    headers: {
      'X-Email-Type': 'general-transactional',
    },
  });
}

/**
 * Test email connectivity and configuration
 */
export async function testEmailConfiguration() {
  try {
    const testEmail = await sendEmail({
      to: EMAIL_CONFIG.adminEmails[0],
      subject: 'Trampolin Email Service Test',
      html: '<h1>Email Service Test</h1><p>If you receive this email, the Resend configuration is working correctly.</p>',
      headers: {
        'X-Email-Type': 'test',
      },
    });

    return { success: true, message: 'Test email sent successfully', id: testEmail.id };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Clear rate limit for testing purposes
 */
export function clearRateLimit(type: keyof typeof RATE_LIMITS, identifier: string) {
  if (process.env.NODE_ENV === 'development') {
    const key = `${type}:${identifier}`;
    rateLimitStore.delete(key);
  }
}
