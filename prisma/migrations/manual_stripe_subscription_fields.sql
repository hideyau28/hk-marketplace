-- Manual SQL migration: Add Stripe subscription fields to Tenant
-- Run this manually against your database before deploying

-- Add planStartedAt column
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "planStartedAt" TIMESTAMP(3);

-- Add planGracePeriodEndsAt column
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "planGracePeriodEndsAt" TIMESTAMP(3);

-- Verify existing columns exist (these should already be present)
-- stripeCustomerId, stripeSubscriptionId are already in schema
-- If they don't exist for some reason, uncomment below:
-- ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT;
-- ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT;
