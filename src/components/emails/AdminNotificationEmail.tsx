import { Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { AdminNotificationData } from '@/lib/email';

export const AdminNotificationEmail = (data: AdminNotificationData) => {
  const { type, userName, userEmail, userId, details, actionUrl } = data;

  const getContent = () => {
    switch (type) {
      case 'new_signup':
        return {
          heading: '🎉 New User Signup',
          message: `A new user has signed up for Trampolin.`,
          actionText: 'View User Profile',
          color: '#10b981',
        };

      case 'subscription_change':
        return {
          heading: '📊 Subscription Change',
          message: `${userName} has made changes to their subscription.`,
          actionText: 'View Subscription Details',
          color: '#3b82f6',
        };

      case 'payment_failed':
        return {
          heading: '⚠️ Payment Failed',
          message: `Payment failed for ${userName}. They may need assistance.`,
          actionText: 'View Payment Details',
          color: '#f59e0b',
        };

      case 'refund_request':
        return {
          heading: '💰 Refund Request',
          message: `${userName} has requested a refund. Review required.`,
          actionText: 'Process Refund',
          color: '#ef4444',
        };

      default:
        return {
          heading: '📋 Admin Notification',
          message: `There's been an update requiring admin attention.`,
          actionText: 'View Details',
          color: '#6b7280',
        };
    }
  };

  const content = getContent();

  return (
    <EmailLayout preview={`${content.heading} - ${userName}`} showFooter={false}>
      <Heading style={{ ...h1, color: content.color }}>{content.heading}</Heading>

      <Text style={text}>{content.message}</Text>

      <div style={userCard}>
        <Text style={cardTitle}>User Information</Text>
        <div style={cardContent}>
          <Text style={cardRow}>
            <strong>Name:</strong> {userName}
          </Text>
          <Text style={cardRow}>
            <strong>Email:</strong> {userEmail}
          </Text>
          <Text style={cardRow}>
            <strong>User ID:</strong> {userId}
          </Text>
          <Text style={cardRow}>
            <strong>Time:</strong> {new Date().toLocaleString()}
          </Text>
        </div>
      </div>

      {details && Object.keys(details).length > 0 && (
        <div style={detailsCard}>
          <Text style={cardTitle}>Additional Details</Text>
          <div style={cardContent}>
            {Object.entries(details).map(([key, value]) => (
              <Text key={key} style={cardRow}>
                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:</strong>{' '}
                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Text>
            ))}
          </div>
        </div>
      )}

      {actionUrl && (
        <div style={buttonContainer}>
          <Button href={actionUrl} style={{ ...button, backgroundColor: content.color }}>
            {content.actionText}
          </Button>
        </div>
      )}

      <Text style={footerNote}>
        This is an automated admin notification from the Trampolin system.
      </Text>
    </EmailLayout>
  );
};

// Styles
const h1 = {
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

const userCard = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const detailsCard = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const cardTitle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const cardContent = {
  margin: '0',
};

const cardRow = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  fontFamily: 'monospace',
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

const footerNote = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
  fontStyle: 'italic',
};
