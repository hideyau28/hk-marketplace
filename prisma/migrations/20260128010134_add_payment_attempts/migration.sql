-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE');

-- CreateEnum
CREATE TYPE "PaymentAttemptStatus" AS ENUM ('CREATED', 'REQUIRES_ACTION', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'REFUNDED', 'DISPUTED');

-- CreateTable
CREATE TABLE "PaymentAttempt" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'CREATED',
    "orderId" TEXT NOT NULL,
    "amount" INTEGER,
    "currency" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "lastEventId" TEXT,
    "lastEventType" TEXT,
    "lastEvent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PaymentAttempt_orderId_idx" ON "PaymentAttempt"("orderId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_provider_status_idx" ON "PaymentAttempt"("provider", "status");

-- CreateIndex
CREATE INDEX "PaymentAttempt_stripeCheckoutSessionId_idx" ON "PaymentAttempt"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_stripePaymentIntentId_idx" ON "PaymentAttempt"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "PaymentAttempt_stripeChargeId_idx" ON "PaymentAttempt"("stripeChargeId");

-- AddForeignKey
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
