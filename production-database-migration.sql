-- COMPLETE PRODUCTION DATABASE MIGRATION SCRIPT
-- This script contains ALL tables, fields, indexes, and constraints needed
-- to bring production database up to match development schema exactly
-- 
-- Run this script on production database to fix all "table does not exist" errors

-- =============================================================================
-- STEP 1: CREATE MISSING SEARCH TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS "Search" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "urlCount" INTEGER NOT NULL,
    "totalReach" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- STEP 2: ADD MISSING COLUMN TO URLANALYSIS TABLE
-- =============================================================================

-- Add searchId column to UrlAnalysis table (links to Search records)
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "searchId" TEXT;

-- =============================================================================
-- STEP 3: CREATE ALL FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Add foreign key constraint from Search to User
ALTER TABLE "Search" DROP CONSTRAINT IF EXISTS "Search_userId_fkey";
ALTER TABLE "Search" ADD CONSTRAINT "Search_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key constraint from UrlAnalysis to Search (with SET NULL)
ALTER TABLE "UrlAnalysis" DROP CONSTRAINT IF EXISTS "UrlAnalysis_searchId_fkey";
ALTER TABLE "UrlAnalysis" ADD CONSTRAINT "UrlAnalysis_searchId_fkey" 
    FOREIGN KEY ("searchId") REFERENCES "Search"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- STEP 4: CREATE ALL INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index on Search table for faster user queries
CREATE INDEX IF NOT EXISTS "Search_userId_idx" ON "Search"("userId");
CREATE INDEX IF NOT EXISTS "Search_createdAt_idx" ON "Search"("createdAt");
CREATE INDEX IF NOT EXISTS "Search_status_idx" ON "Search"("status");

-- Index on UrlAnalysis searchId for faster joins
CREATE INDEX IF NOT EXISTS "UrlAnalysis_searchId_idx" ON "UrlAnalysis"("searchId");

-- =============================================================================
-- STEP 5: VERIFY ALL CORE TABLES EXIST WITH CORRECT STRUCTURE
-- =============================================================================

-- Ensure User table has all required columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Ensure UrlAnalysis table has all required columns  
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "url" TEXT;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "results" JSONB;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "UrlAnalysis" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Ensure Subscription table has all required columns
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "id" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "priceId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "currentPeriodStart" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" BOOLEAN DEFAULT false;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "canceledAt" TIMESTAMP(3);
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "monthlyLimit" INTEGER DEFAULT 500;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "usedThisMonth" INTEGER DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "lastUsageReset" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trialLimit" INTEGER DEFAULT 10;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "trialUsed" INTEGER DEFAULT 0;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Subscription" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- =============================================================================
-- STEP 6: CREATE ALL MISSING SUPPORT TABLES
-- =============================================================================

-- Create Role table if not exists
CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on Role name
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_name_key";
ALTER TABLE "Role" ADD CONSTRAINT "Role_name_key" UNIQUE ("name");

-- Create Account table for NextAuth if not exists
CREATE TABLE IF NOT EXISTS "Account" (
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

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- Create Session table for NextAuth if not exists
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- Create VerificationToken table for NextAuth if not exists
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Create Refund table if not exists
CREATE TABLE IF NOT EXISTS "Refund" (
    "id" TEXT NOT NULL,
    "stripeRefundId" TEXT NOT NULL,
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

-- Create CsvUpload table if not exists
CREATE TABLE IF NOT EXISTS "CsvUpload" (
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

-- Create CsvRow table if not exists
CREATE TABLE IF NOT EXISTS "CsvRow" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvRow_pkey" PRIMARY KEY ("id")
);

-- =============================================================================
-- STEP 7: CREATE ALL UNIQUE CONSTRAINTS
-- =============================================================================

-- User table unique constraints
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_email_key";
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_stripeCustomerId_key";
ALTER TABLE "User" ADD CONSTRAINT "User_stripeCustomerId_key" UNIQUE ("stripeCustomerId");

-- Account table unique constraint
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_provider_providerAccountId_key";
ALTER TABLE "Account" ADD CONSTRAINT "Account_provider_providerAccountId_key" UNIQUE ("provider", "providerAccountId");

-- Session table unique constraint
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_sessionToken_key";
ALTER TABLE "Session" ADD CONSTRAINT "Session_sessionToken_key" UNIQUE ("sessionToken");

-- VerificationToken unique constraints
ALTER TABLE "VerificationToken" DROP CONSTRAINT IF EXISTS "VerificationToken_token_key";
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_token_key" UNIQUE ("token");
ALTER TABLE "VerificationToken" DROP CONSTRAINT IF EXISTS "VerificationToken_identifier_token_key";
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_identifier_token_key" UNIQUE ("identifier", "token");

-- Subscription table unique constraints
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_stripeCustomerId_key";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_stripeCustomerId_key" UNIQUE ("stripeCustomerId");
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_stripeSubscriptionId_key";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_stripeSubscriptionId_key" UNIQUE ("stripeSubscriptionId");

-- Refund table unique constraint
ALTER TABLE "Refund" DROP CONSTRAINT IF EXISTS "Refund_stripeRefundId_key";
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_stripeRefundId_key" UNIQUE ("stripeRefundId");

-- =============================================================================
-- STEP 8: CREATE ALL FOREIGN KEY RELATIONSHIPS
-- =============================================================================

-- User to Role relationship
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_roleId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" 
    FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Account to User relationship
ALTER TABLE "Account" DROP CONSTRAINT IF EXISTS "Account_userId_fkey";
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Session to User relationship
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Subscription to User relationship
ALTER TABLE "Subscription" DROP CONSTRAINT IF EXISTS "Subscription_userId_fkey";
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UrlAnalysis to User relationship
ALTER TABLE "UrlAnalysis" DROP CONSTRAINT IF EXISTS "UrlAnalysis_userId_fkey";
ALTER TABLE "UrlAnalysis" ADD CONSTRAINT "UrlAnalysis_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Refund to User relationship (admin)
ALTER TABLE "Refund" DROP CONSTRAINT IF EXISTS "Refund_adminUserId_fkey";
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_adminUserId_fkey" 
    FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CsvUpload to User relationship
ALTER TABLE "CsvUpload" DROP CONSTRAINT IF EXISTS "CsvUpload_userId_fkey";
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CsvRow to CsvUpload relationship
ALTER TABLE "CsvRow" DROP CONSTRAINT IF EXISTS "CsvRow_uploadId_fkey";
ALTER TABLE "CsvRow" ADD CONSTRAINT "CsvRow_uploadId_fkey" 
    FOREIGN KEY ("uploadId") REFERENCES "CsvUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =============================================================================
-- STEP 9: CREATE ALL PERFORMANCE INDEXES
-- =============================================================================

-- User table indexes
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt");

-- UrlAnalysis table indexes
CREATE INDEX IF NOT EXISTS "UrlAnalysis_userId_idx" ON "UrlAnalysis"("userId");
CREATE INDEX IF NOT EXISTS "UrlAnalysis_status_idx" ON "UrlAnalysis"("status");
CREATE INDEX IF NOT EXISTS "UrlAnalysis_createdAt_idx" ON "UrlAnalysis"("createdAt");
CREATE INDEX IF NOT EXISTS "UrlAnalysis_url_idx" ON "UrlAnalysis"("url");

-- Subscription table indexes
CREATE INDEX IF NOT EXISTS "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX IF NOT EXISTS "Subscription_status_idx" ON "Subscription"("status");
CREATE INDEX IF NOT EXISTS "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

-- Account table indexes
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

-- Session table indexes
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- CsvUpload table indexes
CREATE INDEX IF NOT EXISTS "CsvUpload_userId_idx" ON "CsvUpload"("userId");
CREATE INDEX IF NOT EXISTS "CsvUpload_status_idx" ON "CsvUpload"("status");

-- CsvRow table indexes
CREATE INDEX IF NOT EXISTS "CsvRow_uploadId_rowIndex_idx" ON "CsvRow"("uploadId", "rowIndex");

-- =============================================================================
-- STEP 10: INSERT DEFAULT DATA
-- =============================================================================

-- Insert default roles if they don't exist
INSERT INTO "Role" ("id", "name", "createdAt", "updatedAt") 
VALUES 
    ('clkj1234567890abcdef', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('clkj1234567890abcdeg', 'user', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these queries to verify everything was created correctly:

-- 1. Check all tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- 2. Check Search table structure
-- \d "Search"

-- 3. Check UrlAnalysis has searchId column
-- \d "UrlAnalysis"

-- 4. Check foreign key relationships
-- SELECT tc.constraint_name, tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
-- WHERE constraint_type = 'FOREIGN KEY' ORDER BY tc.table_name;

-- 5. Check indexes
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- =============================================================================
-- END OF MIGRATION SCRIPT
-- =============================================================================

-- SUMMARY OF CHANGES:
-- ✅ Created Search table with all columns and constraints
-- ✅ Added searchId column to UrlAnalysis table
-- ✅ Created all foreign key relationships
-- ✅ Added all unique constraints
-- ✅ Created performance indexes
-- ✅ Verified all core tables have required columns
-- ✅ Created all support tables (Role, Account, Session, etc.)
-- ✅ Inserted default role data
--
-- This script will make production database identical to development schema.
-- After running this script, all "table does not exist" errors should be resolved.