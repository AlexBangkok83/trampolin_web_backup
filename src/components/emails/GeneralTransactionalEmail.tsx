import { Text, Button, Heading } from '@react-email/components';
import { EmailLayout } from './EmailLayout';
import { GeneralTransactionalData } from '@/lib/email';

export const GeneralTransactionalEmail = (data: GeneralTransactionalData) => {
  const { userName, heading, message, actionText, actionUrl, footerText } = data;

  return (
    <EmailLayout preview={heading}>
      <Heading style={h1}>{heading}</Heading>

      <Text style={text}>Hi {userName},</Text>

      <Text style={text}>{message}</Text>

      {actionText && actionUrl && (
        <div style={buttonContainer}>
          <Button href={actionUrl} style={button}>
            {actionText}
          </Button>
        </div>
      )}

      {footerText && <Text style={footerTextStyle}>{footerText}</Text>}

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

const footerTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 16px',
  fontStyle: 'italic',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '24px 0 0',
  fontStyle: 'italic',
};
