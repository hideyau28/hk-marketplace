-- Migration: add productType and inventoryMode to Product
-- Run this in Neon SQL Editor manually
-- Backward compatible: both columns are nullable/have defaults

-- Add productType column (nullable, no existing data affected)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "productType" TEXT;

-- Add inventoryMode column (default "limited" for existing products)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "inventoryMode" TEXT NOT NULL DEFAULT 'limited';
