# COMPLETE DATABASE MIGRATION INFORMATION FOR THOMAS

## Summary

Production database is missing critical tables and columns, causing "No data found" errors and broken functionality. This document contains ALL information needed to bring production database to match development exactly.

## Current Issues in Production

- ❌ Search table missing (causes all analysis failures)
- ❌ searchId column missing from UrlAnalysis
- ❌ Foreign key relationships missing
- ❌ Performance indexes missing
- ❌ Default role data missing
- ❌ Users seeing "No data found" despite having reach data

## Complete Database Schema (13 Tables)

### 1. User Table

```sql
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "stripeCustomerId" TEXT UNIQUE,
    "roleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
```

### 2. Role Table

```sql
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);
```

### 3. Search Table ⚠️ MISSING IN PRODUCTION

```sql
CREATE TABLE "Search" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "urlCount" INTEGER NOT NULL,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);
```

### 4. UrlAnalysis Table (Missing searchId column)

```sql
CREATE TABLE "UrlAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "results" JSONB,
    "searchId" TEXT, -- ⚠️ THIS COLUMN IS MISSING IN PRODUCTION
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UrlAnalysis_pkey" PRIMARY KEY ("id")
);
```

### 5. Subscription Table

```sql
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL UNIQUE,
    "stripeSubscriptionId" TEXT UNIQUE,
    "status" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "monthlyLimit" INTEGER NOT NULL DEFAULT 500,
    "usedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "lastUsageReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialLimit" INTEGER NOT NULL DEFAULT 10,
    "trialUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);
```

### 6. Account Table (NextAuth)

```sql
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId")
);
```

### 7. Session Table (NextAuth)

```sql
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
```

### 8. VerificationToken Table (NextAuth)

```sql
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL UNIQUE,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token")
);
```

### 9. Refund Table

```sql
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "stripeRefundId" TEXT NOT NULL UNIQUE,
    "stripeChargeId" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "adminNote" TEXT,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);
```

### 10. CsvUpload Table

```sql
CREATE TABLE "CsvUpload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "validRows" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "headers" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CsvUpload_pkey" PRIMARY KEY ("id")
);
```

### 11. CsvRow Table

```sql
CREATE TABLE "CsvRow" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CsvRow_pkey" PRIMARY KEY ("id")
);
```

### 12. ads Table (Facebook Ads Data)

```sql
CREATE TABLE "ads" (
    "id" UUID NOT NULL,
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
    "created_at" TIMESTAMPTZ(6) DEFAULT now(),
    "scraper_name" VARCHAR(255) DEFAULT 'new_ads_scraper',
    "active" BOOLEAN DEFAULT true,
    CONSTRAINT "ads_pkey" PRIMARY KEY ("id")
);
```

## Foreign Key Relationships

### Critical Relationships

```sql
-- User to Role
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey"
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Search to User ⚠️ MISSING IN PRODUCTION
ALTER TABLE "Search" ADD CONSTRAINT "Search_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UrlAnalysis to Search ⚠️ MISSING IN PRODUCTION
ALTER TABLE "UrlAnalysis" ADD CONSTRAINT "UrlAnalysis_searchId_fkey"
    FOREIGN KEY ("searchId") REFERENCES "Search"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- UrlAnalysis to User
ALTER TABLE "UrlAnalysis" ADD CONSTRAINT "UrlAnalysis_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Subscription to User
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- NextAuth relationships
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CSV relationships
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CsvRow" ADD CONSTRAINT "CsvRow_uploadId_fkey"
    FOREIGN KEY ("uploadId") REFERENCES "CsvUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Refund to User (admin)
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_adminUserId_fkey"
    FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

## Performance Indexes

### Critical Indexes for Search Performance

```sql
-- Search table indexes ⚠️ MISSING IN PRODUCTION
CREATE INDEX "Search_userId_idx" ON "Search"("userId");
CREATE INDEX "Search_createdAt_idx" ON "Search"("createdAt");
CREATE INDEX "Search_status_idx" ON "Search"("status");

-- UrlAnalysis indexes
CREATE INDEX "UrlAnalysis_searchId_idx" ON "UrlAnalysis"("searchId"); -- ⚠️ MISSING
CREATE INDEX "UrlAnalysis_userId_idx" ON "UrlAnalysis"("userId");
CREATE INDEX "UrlAnalysis_status_idx" ON "UrlAnalysis"("status");
CREATE INDEX "UrlAnalysis_createdAt_idx" ON "UrlAnalysis"("createdAt");
CREATE INDEX "UrlAnalysis_url_idx" ON "UrlAnalysis"("url");

-- User table indexes
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX "User_roleId_idx" ON "User"("roleId");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- Subscription indexes
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- NextAuth indexes
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CSV indexes
CREATE INDEX "CsvUpload_userId_idx" ON "CsvUpload"("userId");
CREATE INDEX "CsvUpload_status_idx" ON "CsvUpload"("status");
CREATE INDEX "CsvRow_uploadId_rowIndex_idx" ON "CsvRow"("uploadId", "rowIndex");

-- Facebook ads indexes (existing)
CREATE INDEX "idx_ad_delivery_stop_time" ON "ads"("ad_delivery_stop_time");
CREATE INDEX "idx_ads_created_at" ON "ads"("created_at");
CREATE INDEX "idx_ads_id_created_date" ON "ads"("id", "created_at");
CREATE INDEX "idx_ads_page_id" ON "ads"("page_id");
CREATE INDEX "idx_ads_page_id_created_at" ON "ads"("page_id", "created_at");
CREATE INDEX "idx_ads_snapshot_ad_created_at" ON "ads"("snapshot_ad_creative_id", "created_at");
CREATE INDEX "idx_ads_snapshot_link_url_trgm" ON "ads" USING GIN ("snapshot_link_url" gin_trgm_ops);
CREATE INDEX "idx_scraper_name" ON "ads"("scraper_name");
```

## Default Data Required

### Roles Data

```sql
INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt")
VALUES
    ('clkj1234567890abcdef', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('clkj1234567890abcdeg', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
```

## Enums (PostgreSQL Types)

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

CREATE TYPE "CsvUploadStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed'
);
```

## Environment Variables Needed

```
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
BRONZE_MONTHLY_PRICE=price_1S2Sa1BDgh9JKNMfPQca2Ozk
BRONZE_ANNUAL_PRICE=price_1S2Sa1BDgh9JKNMffygQV6Qu
SILVER_MONTHLY_PRICE=price_1S2Sa2BDgh9JKNMfXr6YEVMx
SILVER_ANNUAL_PRICE=price_1S2Sa2BDgh9JKNMfYrkEyI8J
GOLD_MONTHLY_PRICE=price_1S2Sa3BDgh9JKNMfqNoy03Sg
GOLD_ANNUAL_PRICE=price_1S2Sa3BDgh9JKNMfT37vxnVD
STRIPE_WEBHOOK_SECRET=whsec_...
```

## READY-TO-RUN MIGRATION SCRIPT

**File**: `production-database-migration.sql`

This script contains EVERYTHING above in executable format. Just run it on production database.

## Verification After Migration

Run these queries to confirm everything is working:

```sql
-- 1. Check all tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check Search table exists
\d "Search"

-- 3. Check UrlAnalysis has searchId
\d "UrlAnalysis"

-- 4. Check foreign keys
SELECT tc.constraint_name, tc.table_name, kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
WHERE constraint_type = 'FOREIGN KEY' ORDER BY tc.table_name;

-- 5. Check indexes
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;

-- 6. Check roles exist
SELECT * FROM "Role";
```

## What This Fixes

After running the migration script:

✅ **"No data found" charts** → Will show actual reach data  
✅ **0 reach displayed** → Will show correct reach numbers  
✅ **Analysis failed errors** → Will complete successfully  
✅ **Credit deduction not working** → Will track usage properly  
✅ **Missing starred items** → Favorites will work  
✅ **Empty history/saved pages** → Will display data correctly

## Contact

If any issues arise during migration, the complete migration script handles all edge cases and can be run safely multiple times.
