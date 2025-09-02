# Stripe Integration Setup Guide

This guide explains how to set up and configure the Stripe payment integration for the trampolin-web application.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm/yarn installed
3. PostgreSQL database running
4. NextAuth.js configured

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# NextAuth.js Configuration
NEXTAUTH_SECRET="your-nextauth-secret-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_..."              # Your Stripe secret key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..." # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET="whsec_..."            # Webhook endpoint secret
```

## Stripe Dashboard Setup

### 1. Get API Keys

1. Log into your Stripe Dashboard
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
4. Use test keys for development (they start with `pk_test_` and `sk_test_`)

### 2. Create Products and Prices

1. Go to **Products** in your Stripe Dashboard
2. Create products for your subscription plans
3. Add prices for each product (monthly/yearly)
4. Note the Price IDs (they start with `price_`) - you'll need these in your frontend

### 3. Set Up Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/stripe`
4. Select the following events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)

## Database Schema

The integration uses the following Prisma models:

```prisma
model User {
  id               String  @id @default(cuid())
  email            String  @unique
  name             String?
  passwordHash     String?
  stripeCustomerId String? @unique
  subscriptions    Subscription[]
  // ... other fields
}

model Subscription {
  id                   String             @id @default(cuid())
  userId               String
  stripeCustomerId     String
  stripeSubscriptionId String             @unique
  status               SubscriptionStatus
  priceId              String
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean            @default(false)
  canceledAt           DateTime?
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum SubscriptionStatus {
  incomplete
  incomplete_expired
  trialing
  active
  past_due
  canceled
  unpaid
  paused
}
```

## API Endpoints

The integration provides the following API endpoints:

### Subscription Management

- `POST /api/stripe/create-subscription` - Create a new subscription
- `POST /api/stripe/update-subscription` - Update existing subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `GET /api/subscription/status` - Get current user's subscription status

### Webhooks

- `POST /api/webhooks/stripe` - Handle Stripe webhook events

## Frontend Components

### Available Components

1. **SubscriptionStatus** - Displays current subscription information
2. **SubscriptionCard** - Shows subscription details with management options
3. **SubscriptionPlans** - Pricing table for plan selection
4. **Subscription Page** - Complete subscription management dashboard

### Usage Example

```tsx
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import SubscriptionPlans from '@/components/subscription/SubscriptionPlans';

const plans = [
  {
    id: 'price_basic_monthly',
    name: 'Basic',
    price: 9,
    interval: 'month',
    features: ['Feature 1', 'Feature 2'],
  },
  // ... more plans
];

export default function SubscriptionPage() {
  return (
    <div>
      <SubscriptionStatus />
      <SubscriptionPlans plans={plans} />
    </div>
  );
}
```

## Testing

### Test with Stripe CLI

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login: `stripe login`
3. Forward webhooks to local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Use test card numbers from: https://stripe.com/docs/testing

### Test Cards

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Requires authentication**: `4000002500003155`

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Verify webhook signatures** to ensure requests come from Stripe
3. **Use HTTPS** in production
4. **Validate all inputs** in API endpoints
5. **Implement proper error handling**

## Deployment

1. Set environment variables in your production environment
2. Update webhook endpoint URL to your production domain
3. Switch to live API keys for production
4. Test the complete flow in production

## Troubleshooting

### Common Issues

1. **Webhook signature verification fails**
   - Check that `STRIPE_WEBHOOK_SECRET` is correct
   - Ensure raw body is used for signature verification

2. **Subscription not created**
   - Check Stripe logs in dashboard
   - Verify customer exists before creating subscription
   - Check database constraints

3. **TypeScript errors**
   - Ensure Stripe types are properly imported
   - Use type assertions for missing properties

### Useful Stripe CLI Commands

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger customer.subscription.created

# View webhook logs
stripe logs tail
```

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Community: https://github.com/stripe/stripe-node/discussions
