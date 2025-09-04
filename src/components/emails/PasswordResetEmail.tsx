import { Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { PasswordResetData } from '@/lib/email';

export const PasswordResetEmail = (data: PasswordResetData) => {
  const { userName, resetUrl, expiresAt } = data;

  return (
    <EmailLayout preview="Reset your Trampolin password">
      <Heading style={h1}>🔐 Reset Your Password</Heading>

      <Text style={text}>Hi {userName},</Text>

      <Text style={text}>
        We received a request to reset your password for your Trampolin account. If you didn&apos;t
        make this request, you can safely ignore this email.
      </Text>

      <div style={securityBox}>
        <Text style={securityTitle}>🛡️ Security Notice</Text>
        <Text style={securityText}>
          This password reset link is valid for a limited time and can only be used once. For your
          security, the link will expire on <strong>{expiresAt.toLocaleString()}</strong>.
        </Text>
      </div>

      <div style={buttonContainer}>
        <Button href={resetUrl} style={button}>
          Reset My Password
        </Button>
      </div>

      <Text style={alternativeText}>
        If the button above doesn&apos;t work, you can also copy and paste this link into your
        browser:
      </Text>

      <div style={linkBox}>
        <Text style={linkText}>{resetUrl}</Text>
      </div>

      <Text style={helpText}>
        <strong>Need help?</strong> If you&apos;re having trouble resetting your password or
        didn&apos;t request this change, please contact our support team at{' '}
        <a href="mailto:support@trampolin.ai" style={link}>
          support@trampolin.ai
        </a>{' '}
        or reply to this email.
      </Text>

      <div style={tipsBox}>
        <Text style={tipsTitle}>💡 Password Tips</Text>
        <ul style={tipsList}>
          <li style={tipsItem}>Use at least 12 characters</li>
          <li style={tipsItem}>Include uppercase and lowercase letters</li>
          <li style={tipsItem}>Add numbers and special characters</li>
          <li style={tipsItem}>Avoid common words or personal information</li>
          <li style={tipsItem}>Consider using a password manager</li>
        </ul>
      </div>

      <Text style={signature}>
        Best regards,
        <br />
        The Trampolin Security Team
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

const securityBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const securityTitle = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const securityText = {
  color: '#78350f',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
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

const alternativeText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 8px',
  textAlign: 'center' as const,
};

const linkBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '12px',
  margin: '8px 0 24px',
  textAlign: 'center' as const,
};

const linkText = {
  color: '#3b82f6',
  fontSize: '12px',
  fontFamily: 'monospace',
  wordBreak: 'break-all' as const,
  margin: '0',
};

const helpText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0',
  backgroundColor: '#f0f9ff',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #bfdbfe',
};

const tipsBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #bbf7d0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const tipsTitle = {
  color: '#166534',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const tipsList = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  paddingLeft: '20px',
};

const tipsItem = {
  margin: '0 0 6px',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '32px 0 0',
  fontStyle: 'italic',
};
