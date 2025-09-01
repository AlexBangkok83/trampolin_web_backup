# API Reference

This document provides a detailed reference for all API endpoints available in the Trampolin web application.

## Authentication

Endpoints that require authentication are protected using NextAuth.js. Authenticated requests must include a valid session cookie. Unauthenticated requests to protected endpoints will receive a `401 Unauthorized` response.

### Authentication Flow

The application uses NextAuth.js to handle user authentication. The flow is as follows:

1.  **Login Request**: The user submits their credentials via the `/api/auth/signin` endpoint.
2.  **Session Creation**: Upon successful authentication, a session is created, and a secure, HTTP-only cookie is sent to the client.
3.  **Authenticated Requests**: For all subsequent requests to protected API routes, the client must include this session cookie. The backend validates the cookie to authorize the request.
4.  **OAuth**: For social logins, the user is redirected to the OAuth provider. After authorization, the provider redirects back to `/api/auth/callback/[provider]`, where a session is established.

---

## API Versioning

Currently, the API is not versioned. All endpoints are considered to be on version 1. Future versions will be introduced with a path prefix, such as `/api/v2/`.

---

## Rate Limiting

Rate limiting is not yet implemented. When added, details about the rate limits will be included here. Requests that exceed the rate limit will receive a `429 Too Many Requests` response.

---

## Auth

### POST /api/auth/register

Creates a new user account with an email and password.

- **Method**: `POST`
- **Authentication**: None

**Request Body**

```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

**Success Response (`201 Created`)**

```json
{
  "ok": true
}
```

**Error Responses**

- `400 Bad Request`: If the email is invalid or the password is too short (minimum 8 characters).
- `409 Conflict`: If the email is already registered.
- `500 Internal Server Error`: For any unexpected errors.

### GET /api/auth/\*

### POST /api/auth/\*

These endpoints are handled by NextAuth.js to manage authentication flows, including:

- **Sign In**: `/api/auth/signin`
- **Sign Out**: `/api/auth/signout`
- **Session Management**: `/api/auth/session`
- **OAuth Callbacks**: `/api/auth/callback/[provider]`

These routes are configured in `src/lib/auth.ts` and do not have custom route handlers. Refer to the [NextAuth.js documentation](https://next-auth.js.org/getting-started/rest-api) for detailed information on their usage.

---

## Health Check

### GET /api/health

Performs a health check of the application and its database connection. This endpoint is used by monitoring services to ensure the application is running correctly.

- **Method**: `GET`
- **Authentication**: None

**Success Response (`200 OK`)**

```json
{
  "status": "healthy",
  "timestamp": "2025-09-01T12:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

**Error Response (`503 Service Unavailable`)**

Indicates that the database connection has failed.

```json
{
  "status": "unhealthy",
  "error": "...",
  "timestamp": "2025-09-01T12:00:00.000Z"
}
```

---

## Stripe

### POST /api/stripe/create-subscription

Creates a new Stripe subscription for the authenticated user. If the user is not already a Stripe customer, a new customer record is created.

- **Method**: `POST`
- **Authentication**: Required

**Request Body**

```json
{
  "priceId": "price_1...",
  "metadata": { "custom_key": "custom_value" } // Optional
}
```

**Success Response (`200 OK`)**

```json
{
  "success": true,
  "subscription": {
    "id": "sub_1...",
    "status": "active",
    "current_period_start": 1672531200,
    "current_period_end": 1675209600
  }
}
```

**Error Responses**

- `400 Bad Request`: If `priceId` is missing or invalid.
- `401 Unauthorized`: If the user is not authenticated.
- `404 Not Found`: If the authenticated user does not exist in the database.
- `500 Internal Server Error`: For any unexpected errors during the process.

### POST /api/stripe/update-subscription

Updates an existing Stripe subscription for the authenticated user (e.g., changing plans).

- **Method**: `POST`
- **Authentication**: Required

**Request Body**

```json
{
  "subscriptionId": "sub_1...",
  "newPriceId": "price_2..."
}
```

**Success Response (`200 OK`)**

Returns the updated subscription object.

```json
{
  "success": true,
  "subscription": {
    "id": "sub_1...",
    "status": "active",
    "current_period_start": 1672531200,
    "current_period_end": 1675209600
  }
}
```

**Error Responses**

- `400 Bad Request`: If `subscriptionId` or `newPriceId` are missing.
- `401 Unauthorized`: If the user is not authenticated.
- `404 Not Found`: If the user or the specified subscription is not found.
- `500 Internal Server Error`: For any unexpected errors.

### POST /api/stripe/cancel-subscription

Cancels an active Stripe subscription for the authenticated user at the end of the current billing period.

- **Method**: `POST`
- **Authentication**: Required

**Request Body**

```json
{
  "subscriptionId": "sub_1..."
}
```

**Success Response (`200 OK`)**

Returns the canceled subscription object.

```json
{
  "success": true,
  "subscription": {
    "id": "sub_1...",
    "status": "canceled",
    "currentPeriodEnd": "2025-09-30T12:00:00.000Z",
    "canceled_at": 1672531200
  }
}
```

**Error Responses**

- `400 Bad Request`: If `subscriptionId` is missing.
- `401 Unauthorized`: If the user is not authenticated.
- `404 Not Found`: If the user or the specified subscription is not found.
- `500 Internal Server Error`: For any unexpected errors.

---

## Webhooks

### POST /api/webhooks/stripe

Handles incoming webhooks from Stripe to keep subscription data in sync. This endpoint should not be called directly by clients.

- **Method**: `POST`
- **Authentication**: Verifies the `stripe-signature` header.

**Request Body**

The request body should be the raw event payload from Stripe.

**Handled Events**

- `customer.subscription.created`: Creates a new subscription record in the database.
- `customer.subscription.updated`: Updates an existing subscription record.
- `customer.subscription.deleted`: Marks a subscription as canceled.
- `invoice.payment_succeeded`: Updates subscription status to `active`.
- `invoice.payment_failed`: Updates subscription status to `past_due`.

**Success Response (`200 OK`)**

```json
{
  "received": true
}
```

**Error Responses**

- `400 Bad Request`: If the `stripe-signature` is missing or invalid.
- `500 Internal Server Error`: For any unexpected processing errors.

---

## Subscription

### GET /api/subscription/status

Retrieves the current subscription status for the authenticated user.

- **Method**: `GET`
- **Authentication**: Required

**Success Response (`200 OK`)**

```json
{
  "success": true,
  "subscription": {
    "id": "sub_1...",
    "status": "active",
    "priceId": "price_1...",
    "currentPeriodStart": "2025-09-01T12:00:00.000Z",
    "currentPeriodEnd": "2025-10-01T12:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "stripeCustomerId": "cus_...",
    "createdAt": "2025-09-01T12:00:00.000Z",
    "updatedAt": "2025-09-01T12:00:00.000Z"
  }
}
```

**Error Responses**

- `401 Unauthorized`: If the user is not authenticated.
- `404 Not Found`: If the user or their subscription is not found.
- `500 Internal Server Error`: For any unexpected errors.

---

## CSV Upload

### POST /api/upload/csv

Uploads a CSV file for processing and storage. The file is parsed, validated, and its contents are stored in the database.

- **Method**: `POST`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`

**Request Body**

A `FormData` object containing the CSV file under the key `file`.

**Success Response (`200 OK`)**

```json
{
  "success": true,
  "message": "CSV file processed successfully",
  "recordsProcessed": 150,
  "uploadId": "clx..."
}
```

**Error Responses**

- `400 Bad Request`: If no file is provided, the file is not a CSV, the file size exceeds 10MB, or the CSV contains no valid data.
- `401 Unauthorized`: If the user is not authenticated.
- `500 Internal Server Error`: For any unexpected processing errors.

---

## Analytics

### GET /api/analytics

Retrieves aggregated analytics data for the authenticated user's CSV uploads, formatted for Chart.js.

- **Method**: `GET`
- **Authentication**: Required

**Success Response (`200 OK`)**

Returns a JSON object containing chart-ready data for the last six months.

```json
{
  "uploadsOverTime": {
    "labels": ["Apr '25", "May '25", ...],
    "datasets": [{
      "label": "Uploads",
      "data": [10, 15, ...]
    }]
  },
  "rowsOverTime": {
    "labels": ["Apr '25", "May '25", ...],
    "datasets": [{
      "label": "Rows Processed",
      "data": [1000, 1500, ...]
    }]
  },
  "fileSizeDistribution": {
    "labels": ["Small (<1MB)", "Medium (1-5MB)", "Large (>5MB)"],
    "datasets": [{
      "label": "Number of Files",
      "data": [50, 20, 5]
    }]
  },
  "statusDistribution": {
    "labels": ["completed", "failed"],
    "datasets": [{
      "label": "Status",
      "data": [70, 5]
    }]
  }
}
```

**Error Responses**

- `401 Unauthorized`: If the user is not authenticated.
- `500 Internal Server Error`: If an error occurs while fetching data.

---

## Database Models

The application's data is structured using the following Prisma models.

### Core Models

- **`User`**: Represents a user account. It stores essential user information, their role, and relationships to other models like subscriptions and CSV uploads.
  - `id`: Unique identifier for the user.
  - `email`: User's email address (unique).
  - `stripeCustomerId`: The user's corresponding customer ID in Stripe.
  - `role`: The user's assigned role (e.g., 'admin', 'user').

- **`Role`**: Defines user roles within the application, allowing for different permission levels.

### Authentication Models

These models are used by the NextAuth.js adapter to manage sessions and OAuth accounts.

- **`Account`**: Stores information for OAuth accounts linked to a user.
- **`Session`**: Manages user session data.
- **`VerificationToken`**: Used for email verification tokens.

### Subscription & Billing Models

- **`Subscription`**: Tracks a user's subscription status with Stripe.
  - `status`: The current state of the subscription (e.g., `active`, `canceled`), managed by the `SubscriptionStatus` enum.
  - `stripeSubscriptionId`: The unique ID for the subscription in Stripe.
  - `priceId`: The ID of the Stripe price plan the user is subscribed to.
  - `currentPeriodEnd`: The end date of the current billing cycle.

### CSV Data Models

- **`CsvUpload`**: Stores metadata for each uploaded CSV file.
  - `status`: The processing status of the upload (`pending`, `processing`, `completed`, `failed`), managed by the `CsvUploadStatus` enum.
  - `filename`: The name of the file stored on the server.
  - `totalRows`, `validRows`: Counts of total and successfully processed rows.
  - `headers`: The column headers extracted from the CSV file.

- **`CsvRow`**: Stores the data for each individual row from a `CsvUpload`.
  - `data`: The row's content, stored as a JSON object.
  - `uploadId`: A foreign key linking the row back to its parent `CsvUpload`.

---
