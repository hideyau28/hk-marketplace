-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "customDomain" TEXT,
    "region" TEXT NOT NULL DEFAULT 'HK',
    "currency" TEXT NOT NULL DEFAULT 'HKD',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Hong_Kong',
    "languages" TEXT[] DEFAULT ARRAY['zh-HK', 'en']::TEXT[],
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "themeColor" TEXT NOT NULL DEFAULT '#6B7B3A',
    "logoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionEndsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantAdmin" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_customDomain_key" ON "Tenant"("customDomain");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAdmin_email_key" ON "TenantAdmin"("email");

-- CreateIndex
CREATE INDEX "TenantAdmin_tenantId_idx" ON "TenantAdmin"("tenantId");

-- AddForeignKey
ALTER TABLE "TenantAdmin" ADD CONSTRAINT "TenantAdmin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
