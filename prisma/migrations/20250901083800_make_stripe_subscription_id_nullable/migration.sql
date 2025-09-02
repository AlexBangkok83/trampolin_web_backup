-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "status" TEXT NOT NULL,
    "priceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "currentPeriodStart" DATETIME NOT NULL,
    "currentPeriodEnd" DATETIME NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" DATETIME,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 500,
    "usedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "lastUsageReset" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialLimit" INTEGER NOT NULL DEFAULT 10,
    "trialUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("cancelAtPeriodEnd", "canceledAt", "createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "lastUsageReset", "monthlyLimit", "priceId", "quantity", "status", "stripeCustomerId", "stripeSubscriptionId", "trialLimit", "trialUsed", "updatedAt", "usedThisMonth", "userId") SELECT "cancelAtPeriodEnd", "canceledAt", "createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "lastUsageReset", "monthlyLimit", "priceId", "quantity", "status", "stripeCustomerId", "stripeSubscriptionId", "trialLimit", "trialUsed", "updatedAt", "usedThisMonth", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
