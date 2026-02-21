-- Migration: Add missing Order columns for manual payment flow
-- Uses IF NOT EXISTS for safety (some columns may already exist from prisma db push)

-- Payment fields (core fix for checkout 500 error)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentProof" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentConfirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentConfirmedBy" TEXT;

-- Order number
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber");

-- Status timestamps
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "processingAt" TIMESTAMP(3);

-- Admin management fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "cancelReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "refundReason" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "statusHistory" TEXT;

-- Cart recovery
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "recoveryStatus" TEXT;

-- Member system (userId FK)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Multi-tenant
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;

-- Indexes for new columns
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_tenantId_idx" ON "Order"("tenantId");
CREATE INDEX IF NOT EXISTS "Order_orderNumber_idx" ON "Order"("orderNumber");
CREATE INDEX IF NOT EXISTS "Order_phone_idx" ON "Order"("phone");
