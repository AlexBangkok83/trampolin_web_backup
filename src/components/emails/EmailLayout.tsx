import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  showFooter?: boolean;
}

export const EmailLayout = ({ preview, children, showFooter = true }: EmailLayoutProps) => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img src={`${baseUrl}/logo.png`} width="120" height="40" alt="Trampolin" style={logo} />
          </Section>

          {/* Main Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          {showFooter && (
            <>
              <Hr style={hr} />
              <Section style={footer}>
                <Text style={footerText}>
                  This email was sent by Trampolin, your CSV analytics platform.
                </Text>
                <Text style={footerText}>
                  <Link href={`${baseUrl}/dashboard`} style={footerLink}>
                    Dashboard
                  </Link>
                  {' • '}
                  <Link href={`${baseUrl}/account`} style={footerLink}>
                    Account Settings
                  </Link>
                  {' • '}
                  <Link href="https://trampolin.ai/support" style={footerLink}>
                    Support
                  </Link>
                </Text>
                <Text style={footerText}>
                  © {new Date().getFullYear()} Trampolin. All rights reserved.
                </Text>
              </Section>
            </>
          )}
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
};

const header = {
  padding: '20px 0',
  textAlign: 'center' as const,
  backgroundColor: '#ffffff',
  borderRadius: '8px 8px 0 0',
  border: '1px solid #e6ebf1',
  borderBottom: 'none',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
  border: '1px solid #e6ebf1',
  borderTop: 'none',
  borderBottom: 'none',
};

const footer = {
  backgroundColor: '#f8fafc',
  padding: '24px 32px',
  borderRadius: '0 0 8px 8px',
  border: '1px solid #e6ebf1',
  borderTop: 'none',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '0',
};

const footerText = {
  color: '#6b7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
};

const footerLink = {
  color: '#3b82f6',
  textDecoration: 'none',
};
