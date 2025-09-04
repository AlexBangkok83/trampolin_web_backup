import { Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({ userName, dashboardUrl }: WelcomeEmailProps) => {
  return (
    <EmailLayout preview="Welcome to Trampolin - Your analytics journey starts here!">
      <Heading style={h1}>Welcome to Trampolin, {userName}! 🎉</Heading>

      <Text style={text}>
        Thank you for joining Trampolin, the powerful CSV analytics platform that helps you unlock
        insights from your data.
      </Text>

      <Text style={text}>Here&apos;s what you can do with your new account:</Text>

      <ul style={list}>
        <li style={listItem}>
          <strong>Upload CSV files:</strong> Drag and drop your data files for instant analysis
        </li>
        <li style={listItem}>
          <strong>Interactive charts:</strong> Visualize your data with beautiful, customizable
          charts
        </li>
        <li style={listItem}>
          <strong>Smart insights:</strong> Get automated insights and recommendations
        </li>
        <li style={listItem}>
          <strong>Export & share:</strong> Export your visualizations and share insights with your
          team
        </li>
      </ul>

      <div style={buttonContainer}>
        <Button href={dashboardUrl} style={button}>
          Go to Dashboard
        </Button>
      </div>

      <Text style={text}>
        Need help getting started? Check out our{' '}
        <a href="https://trampolin.ai/docs" style={link}>
          documentation
        </a>{' '}
        or reach out to our support team - we&apos;re here to help!
      </Text>

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

const list = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  paddingLeft: '20px',
};

const listItem = {
  margin: '0 0 8px',
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

const link = {
  color: '#3b82f6',
  textDecoration: 'none',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 0',
  fontStyle: 'italic',
};
