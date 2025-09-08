# TRAMPOLIN DATABASE STRUCTURE OVERVIEW

## Database Setup

- **Database Type**: PostgreSQL
- **ORM**: Prisma
- **Environment Variable**: `DATABASE_URL`

## Core Tables Structure

### 1. User Management

#### `User` Table

```sql
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "stripeCustomerId" TEXT UNIQUE,
    "roleId" TEXT REFERENCES "Role"("id"),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);
```

#### `Role` Table

```sql
CREATE TABLE "Role" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

-- Default roles needed:
INSERT INTO "Role" ("id", "name") VALUES
    ('role_admin', 'admin'),
    ('role_user', 'user');
```

### 2. Authentication (NextAuth.js)

#### `Account` Table

```sql
CREATE TABLE "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE("provider", "providerAccountId")
);
```

#### `Session` Table

```sql
CREATE TABLE "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expires" TIMESTAMP(3) NOT NULL
);
```

#### `VerificationToken` Table

```sql
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    UNIQUE("identifier", "token")
);
```

### 3. Subscription Management

#### `Subscription` Table

```sql
CREATE TYPE "SubscriptionStatus" AS ENUM (
    'incomplete',
    'incomplete_expired',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'paused'
);

CREATE TABLE "Subscription" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "stripeCustomerId" TEXT UNIQUE NOT NULL,
    "stripeSubscriptionId" TEXT UNIQUE,
    "status" "SubscriptionStatus" NOT NULL,
    "priceId" TEXT NOT NULL,
    "quantity" INTEGER DEFAULT 1,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "monthlyLimit" INTEGER DEFAULT 500,
    "usedThisMonth" INTEGER DEFAULT 0,
    "lastUsageReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "trialLimit" INTEGER DEFAULT 10,
    "trialUsed" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);
```

**Important Stripe Price IDs:**

```javascript
const PLAN_LIMITS = {
  price_1S2Sa1BDgh9JKNMfPQca2Ozk: 500, // Bronze Monthly
  price_1S2Sa1BDgh9JKNMffygQV6Qu: 500, // Bronze Annual
  price_1S2Sa2BDgh9JKNMfXr6YEVMx: 1000, // Silver Monthly
  price_1S2Sa2BDgh9JKNMfYrkEyI8J: 1000, // Silver Annual
  price_1S2Sa3BDgh9JKNMfqNoy03Sg: 2500, // Gold Monthly
  price_1S2Sa3BDgh9JKNMfT37vxnVD: 2500, // Gold Annual
};
```

### 4. URL Analysis System (Core Feature)

#### `UrlAnalysis` Table

```sql
CREATE TABLE "UrlAnalysis" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    "results" JSONB, -- Stores analysis results as JSON
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

-- Indexes for performance
CREATE INDEX "idx_urlanalysis_userid" ON "UrlAnalysis"("userId");
CREATE INDEX "idx_urlanalysis_url" ON "UrlAnalysis"("url");
CREATE INDEX "idx_urlanalysis_status" ON "UrlAnalysis"("status");
CREATE INDEX "idx_urlanalysis_createdat" ON "UrlAnalysis"("createdAt");
```

**Results JSON Structure:**

```json
{
  "url": "example.com/product",
  "totalReach": 150000,
  "adCount": 45,
  "avgReachPerDay": 7500,
  "totalDays": 20,
  "firstDay": "2025-08-16",
  "lastDay": "2025-09-04",
  "reachCategory": "high",
  "reachColor": "text-green-600",
  "chartData": [
    { "date": "2025-08-16", "reach": 5000, "adCount": 2 },
    { "date": "2025-08-17", "reach": 7500, "adCount": 3 }
  ],
  "analyzed_at": "2025-09-08T10:30:00.000Z"
}
```

### 5. Facebook Ads Data (Read-Only)

#### `ads` Table

```sql
CREATE TABLE "ads" (
    "_id" UUID PRIMARY KEY,
    "ad_id" VARCHAR(255),
    "ad_creation_time" DATE,
    "ad_delivery_start_time" TIMESTAMP(6),
    "ad_delivery_stop_time" TIMESTAMP(6),
    "page_id" VARCHAR(255),
    "page_name" TEXT,
    "target_gender" VARCHAR(50),
    "eu_total_reach" INTEGER,
    "snapshot_ad_creative_id" VARCHAR(255),
    "snapshot_display_format" VARCHAR(50),
    "snapshot_link_url" TEXT,
    "snapshot_creation_time" BIGINT,
    "snapshot_instagram_actor_name" TEXT,
    "snapshot_page_like_count" INTEGER,
    "snapshot_page_profile_uri" TEXT,
    "snapshot_cta_type" VARCHAR(50),
    "snapshot_additional_info" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT NOW(),
    "scraper_name" VARCHAR(255) DEFAULT 'new_ads_scraper',
    "active" BOOLEAN DEFAULT true
);

-- Critical Indexes for Performance
CREATE INDEX "idx_ad_delivery_stop_time" ON "ads"("ad_delivery_stop_time");
CREATE INDEX "idx_ads_created_at" ON "ads"("created_at");
CREATE INDEX "idx_ads_id_created_date" ON "ads"("_id", "created_at");
CREATE INDEX "idx_ads_page_id" ON "ads"("page_id");
CREATE INDEX "idx_ads_page_id_created_at" ON "ads"("page_id", "created_at");
CREATE INDEX "idx_ads_snapshot_ad_created_at" ON "ads"("snapshot_ad_creative_id", "created_at");
CREATE INDEX "idx_scraper_name" ON "ads"("scraper_name");

-- GIN Index for URL matching (requires pg_trgm extension)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "idx_ads_snapshot_link_url_trgm" ON "ads" USING GIN ("snapshot_link_url" gin_trgm_ops);
```

### 6. Refunds System

#### `Refund` Table

```sql
CREATE TABLE "Refund" (
    "id" TEXT PRIMARY KEY,
    "stripeRefundId" TEXT UNIQUE NOT NULL,
    "stripeChargeId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL REFERENCES "User"("id"),
    "customerEmail" TEXT NOT NULL,
    "adminNote" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);
```

### 7. CSV Upload System (Optional/Legacy)

#### `CsvUpload` Table

```sql
CREATE TYPE "CsvUploadStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE "CsvUpload" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "CsvUploadStatus" DEFAULT 'pending',
    "totalRows" INTEGER DEFAULT 0,
    "validRows" INTEGER DEFAULT 0,
    "errorMessage" TEXT,
    "headers" TEXT[],
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);
```

#### `CsvRow` Table

```sql
CREATE TABLE "CsvRow" (
    "id" TEXT PRIMARY KEY,
    "uploadId" TEXT NOT NULL REFERENCES "CsvUpload"("id") ON DELETE CASCADE,
    "rowIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_csvrow_uploadid_rowindex" ON "CsvRow"("uploadId", "rowIndex");
```

## Required Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"

# Stripe (for subscriptions)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Database Migration Commands

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations in production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

## Critical Notes for Senior Dev

1. **Facebook Ads Data**: The `ads` table is the core data source - ensure it's properly populated and indexed
2. **URL Matching**: Uses trigram similarity matching - requires `pg_trgm` extension
3. **Credit System**: Tracks usage in `Subscription` table with monthly limits
4. **JSON Storage**: `UrlAnalysis.results` stores computed analysis results to avoid re-querying
5. **Admin Access**: Ensure at least one admin user exists in production

## Sample Admin User Creation

```sql
-- Create admin role if not exists
INSERT INTO "Role" ("id", "name") VALUES ('admin_role_id', 'admin')
ON CONFLICT ("name") DO NOTHING;

-- Create admin user
INSERT INTO "User" ("id", "email", "name", "roleId") VALUES
('admin_user_id', 'admin@yourcompany.com', 'Admin User', 'admin_role_id');
```

This structure supports the full Trampolin application with user management, subscription billing, URL analysis, and admin functionality.
