import { Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { SubscriptionEmailData } from '@/lib/email';

export const SubscriptionNotificationEmail = (data: SubscriptionEmailData) => {
  const {
    userName,
    subscriptionType,
    planName,
    amount,
    currency,
    nextBillingDate,
    cancelDate,
    dashboardUrl,
  } = data;

  const getContent = () => {
    switch (subscriptionType) {
      case 'new':
        return {
          subject: `Welcome to ${planName}!`,
          heading: `🎉 Welcome to ${planName}, ${userName}!`,
          message: `Your subscription is now active and ready to use. You now have access to all ${planName} features.`,
          details:
            amount && currency
              ? [
                  `Plan: ${planName}`,
                  `Price: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`,
                  nextBillingDate ? `Next billing: ${nextBillingDate.toLocaleDateString()}` : null,
                ].filter(Boolean)
              : [],
          actionText: 'Start Using Your Plan',
          buttonColor: '#10b981',
        };

      case 'renewed':
        return {
          subject: `${planName} Subscription Renewed`,
          heading: `✅ Subscription Renewed Successfully`,
          message: `Your ${planName} subscription has been renewed successfully. Thank you for continuing to use Trampolin!`,
          details:
            amount && currency
              ? [
                  `Plan: ${planName}`,
                  `Amount charged: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`,
                  nextBillingDate ? `Next billing: ${nextBillingDate.toLocaleDateString()}` : null,
                ].filter(Boolean)
              : [],
          actionText: 'View Dashboard',
          buttonColor: '#3b82f6',
        };

      case 'cancelled':
        return {
          subject: 'Subscription Cancelled',
          heading: `😔 Sorry to See You Go, ${userName}`,
          message: `Your subscription has been cancelled successfully. You'll continue to have access to your current plan until ${cancelDate?.toLocaleDateString() || 'the end of your billing period'}.`,
          details: [
            cancelDate ? `Access until: ${cancelDate.toLocaleDateString()}` : null,
            'Your data will remain safe and accessible',
            'You can reactivate anytime',
          ].filter(Boolean),
          actionText: 'Reactivate Subscription',
          buttonColor: '#3b82f6',
        };

      case 'payment_failed':
        return {
          subject: 'Payment Failed - Action Required',
          heading: `⚠️ Payment Issue for Your ${planName || 'Subscription'}`,
          message: `We couldn't process your recent payment. Please update your payment method to continue using Trampolin without interruption.`,
          details: [
            'Your account remains active for now',
            'Please update your payment method within 7 days',
            'Contact support if you need assistance',
          ],
          actionText: 'Update Payment Method',
          buttonColor: '#ef4444',
        };

      default:
        return {
          subject: 'Subscription Update',
          heading: `Subscription Update`,
          message: `There's been an update to your subscription.`,
          details: [],
          actionText: 'View Dashboard',
          buttonColor: '#3b82f6',
        };
    }
  };

  const content = getContent();

  return (
    <EmailLayout preview={content.subject}>
      <Heading style={h1}>{content.heading}</Heading>

      <Text style={text}>Hi {userName},</Text>

      <Text style={text}>{content.message}</Text>

      {content.details.length > 0 && (
        <div style={detailsContainer}>
          <Text style={detailsTitle}>Details:</Text>
          <ul style={list}>
            {content.details.map((detail, index) => (
              <li key={index} style={listItem}>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={buttonContainer}>
        <Button href={dashboardUrl} style={{ ...button, backgroundColor: content.buttonColor }}>
          {content.actionText}
        </Button>
      </div>

      {subscriptionType === 'cancelled' && (
        <Text style={feedbackText}>
          We&apos;d love to know why you&apos;re leaving. Your feedback helps us improve Trampolin
          for everyone.{' '}
          <a href="https://trampolin.ai/feedback" style={link}>
            Share your feedback
          </a>
        </Text>
      )}

      {subscriptionType === 'payment_failed' && (
        <Text style={urgentText}>
          <strong>Need help?</strong> If you&apos;re experiencing issues with your payment method,
          our support team is ready to assist you. Just reply to this email or contact us at
          support@trampolin.ai.
        </Text>
      )}

      <Text style={signature}>
        Best regards,
        <br />
        The Trampolin Team
      </Text>
    </EmailLayout>
  );
};

// Styles
const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  lineHeight: '32px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const detailsContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '0 0 4px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
  lineHeight: '24px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
};

const feedbackText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 16px',
  fontStyle: 'italic',
};

const urgentText = {
  color: '#dc2626',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 16px',
  backgroundColor: '#fef2f2',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #fecaca',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 0',
  fontStyle: 'italic',
};
