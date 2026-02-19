-- Migration: Add OtpCode and RateLimitEntry tables
-- Run this in Neon SQL Editor manually
-- Both tables are standalone (no tenantId) — OTP and rate limiting are global, not tenant-scoped

-- ============================================
-- Table: OtpCode
-- ============================================
CREATE TABLE IF NOT EXISTS "OtpCode" (
    "id"        TEXT NOT NULL,
    "phone"     TEXT NOT NULL,
    "code"      TEXT NOT NULL,
    "attempts"  INTEGER NOT NULL DEFAULT 0,
    "verified"  BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OtpCode_phone_idx" ON "OtpCode"("phone");
CREATE INDEX IF NOT EXISTS "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- ============================================
-- Table: RateLimitEntry
-- ============================================
CREATE TABLE IF NOT EXISTS "RateLimitEntry" (
    "id"        TEXT NOT NULL,
    "key"       TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "RateLimitEntry_key_timestamp_idx" ON "RateLimitEntry"("key", "timestamp");
CREATE INDEX IF NOT EXISTS "RateLimitEntry_timestamp_idx" ON "RateLimitEntry"("timestamp");
