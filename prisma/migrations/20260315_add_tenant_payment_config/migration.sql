-- CreateTable
CREATE TABLE "TenantPaymentConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" JSONB,
    "displayName" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantPaymentConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TenantPaymentConfig_tenantId_idx" ON "TenantPaymentConfig"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantPaymentConfig_tenantId_providerId_key" ON "TenantPaymentConfig"("tenantId", "providerId");

-- AddForeignKey
ALTER TABLE "TenantPaymentConfig" ADD CONSTRAINT "TenantPaymentConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
