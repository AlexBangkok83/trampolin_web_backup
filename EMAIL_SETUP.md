# Trampolin Email System Setup Guide

## Overview

The Trampolin application now includes a comprehensive email notification system powered by Resend. This system handles all transactional emails including welcome messages, subscription notifications, admin alerts, and password reset emails.

## Features

### Email Types Supported

- ✅ **Welcome emails** - Sent to new users upon registration
- ✅ **Subscription notifications** - New, renewed, cancelled, payment failed
- ✅ **Admin notifications** - New signups, subscription changes, payment issues
- ✅ **Password reset emails** - Secure password reset with token validation
- ✅ **General transactional emails** - Custom emails for various purposes

### Key Features

- 🔒 **Rate limiting** - Prevents email abuse
- 🎨 **Professional templates** - Responsive HTML email templates
- 📧 **Multiple recipients** - Admin notifications sent to multiple emails
- 🔍 **Comprehensive logging** - All email events are logged
- ⚡ **Async processing** - Non-blocking email sending
- 🛡️ **Error handling** - Graceful failure handling
- 📱 **Mobile responsive** - Templates work on all devices

## Setup Instructions

### 1. Resend Configuration

1. Create a Resend account at [resend.com](https://resend.com)
2. Generate an API key from the Resend dashboard
3. Add the following environment variables to your `.env.local`:

```bash
# Resend Email Configuration
RESEND_API_KEY="re_your_resend_api_key_here"

# Email Configuration
EMAIL_FROM="Trampolin <noreply@trampolin.ai>"
EMAIL_REPLY_TO="support@trampolin.ai"
ADMIN_EMAILS="admin@trampolin.ai,support@trampolin.ai"

# System API Key for internal email notifications
SYSTEM_API_KEY="your-system-api-key-for-internal-calls"
```

### 2. Domain Configuration

For production, you'll need to:

1. Add your domain to Resend
2. Configure DNS records (SPF, DKIM, DMARC)
3. Update the `EMAIL_FROM` address to use your domain

### 3. Logo Setup

Place your logo file at `/public/logo.png` (120x40px recommended) for email headers.

## API Endpoints

All email endpoints require admin authentication (except password reset).

### Welcome Email

```http
POST /api/emails/welcome
Content-Type: application/json

{
  "userName": "John Doe",
  "userEmail": "john@example.com"
}
```

### Subscription Notification

```http
POST /api/emails/subscription
Content-Type: application/json

{
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "subscriptionType": "new", // new|cancelled|payment_failed|renewed
  "planName": "Gold Plan",
  "amount": 2999, // in cents
  "currency": "usd",
  "nextBillingDate": "2024-02-01T00:00:00Z" // ISO string
}
```

### Password Reset

```http
POST /api/emails/password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### General Transactional Email

```http
POST /api/emails/general
Content-Type: application/json

{
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "subject": "Important Update",
  "heading": "📢 Important Update",
  "message": "We have an important update for you...",
  "actionText": "Learn More", // optional
  "actionUrl": "https://example.com", // optional
  "footerText": "Additional info..." // optional
}
```

### Admin Notification

```http
POST /api/emails/admin-notification
Content-Type: application/json
Authorization: Bearer your-system-api-key

{
  "type": "new_signup", // new_signup|subscription_change|payment_failed|refund_request
  "userName": "John Doe",
  "userEmail": "john@example.com",
  "userId": "user123",
  "details": {
    "registrationTime": "2024-01-01T00:00:00Z"
  }
}
```

### Test Email Configuration

```http
POST /api/emails/test
GET /api/emails/test
```

## Using the Email Service

### Automatic Triggers

The system automatically sends emails for:

1. **User Registration** - Welcome email sent via `src/app/api/auth/register/route.ts`
2. **Stripe Webhooks** - Subscription emails sent via webhook handlers
3. **Admin Notifications** - Triggered by various user actions

### Manual Email Sending

You can use the programmatic API:

```typescript
import { sendWelcomeEmail, sendSubscriptionNotificationEmail } from '@/lib/email';

// Send welcome email
await sendWelcomeEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  dashboardUrl: 'https://app.trampolin.ai/dashboard',
});

// Send subscription email
await sendSubscriptionNotificationEmail({
  userName: 'John Doe',
  userEmail: 'john@example.com',
  subscriptionType: 'new',
  planName: 'Gold Plan',
  dashboardUrl: 'https://app.trampolin.ai/dashboard',
});
```

### Using Email Triggers

For common application events:

```typescript
import {
  triggerWelcomeEmail,
  triggerSubscriptionEmail,
  triggerPaymentFailedEmail,
} from '@/lib/email-triggers';

// Trigger welcome email for new user
await triggerWelcomeEmail(userId);

// Trigger subscription email
await triggerSubscriptionEmail(userId, 'new');

// Trigger payment failed email
await triggerPaymentFailedEmail(userId, { reason: 'Card declined' });
```

### Frontend Hook

Use the React hook for admin interfaces:

```typescript
import { useEmailApi } from '@/hooks/useEmailApi';

function EmailComponent() {
  const emailApi = useEmailApi();

  const handleSendWelcome = async () => {
    await emailApi.sendWelcomeEmail({
      userName: 'John Doe',
      userEmail: 'john@example.com'
    });
  };

  return (
    <div>
      <button
        onClick={handleSendWelcome}
        disabled={emailApi.loading}
      >
        {emailApi.loading ? 'Sending...' : 'Send Welcome Email'}
      </button>

      {emailApi.error && (
        <div className="error">{emailApi.error}</div>
      )}

      {emailApi.success && (
        <div className="success">Email sent successfully!</div>
      )}
    </div>
  );
}
```

## Admin Interface

Access the email management interface at `/dashboard/admin/emails` (admin role required).

Features:

- Test email configuration
- Send individual emails
- View configuration status
- Test all email types

## Rate Limiting

The system includes built-in rate limiting:

- Welcome emails: 1 per minute per email
- Subscription emails: 5 per minute per email
- Admin notifications: 10 per minute globally
- Password reset: 3 per hour per email
- General emails: 20 per minute per email

## Error Handling

- Email failures are logged but don't block critical operations (registration, payments)
- Rate limit exceeded returns HTTP 429
- Invalid requests return HTTP 400 with validation details
- Authentication errors return HTTP 401
- Server errors return HTTP 500

## Email Templates

Templates are React components located in `src/components/emails/`:

- `EmailLayout.tsx` - Base layout with header/footer
- `WelcomeEmail.tsx` - Welcome email template
- `SubscriptionNotificationEmail.tsx` - Subscription notifications
- `AdminNotificationEmail.tsx` - Admin notifications
- `PasswordResetEmail.tsx` - Password reset emails
- `GeneralTransactionalEmail.tsx` - Generic template

## Customization

### Adding New Email Types

1. Create a new template component in `src/components/emails/`
2. Add the email function to `src/lib/email.ts`
3. Create API route in `src/app/api/emails/`
4. Add trigger function to `src/lib/email-triggers.ts` if needed

### Styling Changes

Email templates use inline styles for maximum compatibility. Modify the style objects in each template component.

### Adding New Variables

Update the TypeScript interfaces in `src/lib/email.ts` and the corresponding template components.

## Testing

### Development Testing

Use the admin interface at `/dashboard/admin/emails` to test all email types.

### Production Testing

1. Use the `/api/emails/test` endpoint to verify configuration
2. Monitor Resend dashboard for delivery statistics
3. Check application logs for email-related errors

## Monitoring

Monitor email delivery through:

1. **Resend Dashboard** - Delivery status, bounces, complaints
2. **Application Logs** - Email sending attempts and errors
3. **Admin Interface** - Configuration status and test results

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check RESEND_API_KEY is set correctly
   - Verify domain is configured in Resend dashboard
   - Check application logs for error messages

2. **Rate limiting errors**
   - Wait for rate limit window to reset
   - Use `clearRateLimit()` function in development

3. **Template rendering issues**
   - Ensure all required props are passed to templates
   - Check for TypeScript errors in template components

4. **Authentication errors**
   - Verify user has admin role for admin endpoints
   - Check SYSTEM_API_KEY for internal API calls

### Debug Mode

Set `NODE_ENV=development` for additional logging and rate limit bypass options.

## Security Considerations

- API keys are stored as environment variables
- Admin endpoints require authentication
- Rate limiting prevents abuse
- Password reset tokens expire after 1 hour
- Email addresses are validated before sending
- HTML content is properly escaped in templates

## Performance

- Email sending is asynchronous (non-blocking)
- Templates are rendered on-demand
- Rate limiting prevents server overload
- Failed emails are logged but don't retry automatically

For additional support or questions, refer to the Resend documentation or contact the development team.
