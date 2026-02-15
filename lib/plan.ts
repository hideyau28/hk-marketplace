import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Plan definitions
// ---------------------------------------------------------------------------

export type PlanName = "free" | "lite" | "pro";

export type FeatureName =
  | "whatsapp"
  | "coupon"
  | "csv_export"
  | "analytics"
  | "cart_recovery"
  | "crm"
  | "top_sellers"
  | "custom_domain"
  | "remove_branding"
  | "multi_staff";

export type PlanLimits = {
  maxSku: number;
  maxOrdersPerMonth: number;
  features: FeatureName[];
};

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: {
    maxSku: 10,
    maxOrdersPerMonth: 50,
    features: [],
  },
  lite: {
    maxSku: 50,
    maxOrdersPerMonth: Infinity,
    features: ["whatsapp", "coupon", "csv_export", "analytics"],
  },
  pro: {
    maxSku: Infinity,
    maxOrdersPerMonth: Infinity,
    features: [
      "whatsapp",
      "coupon",
      "csv_export",
      "analytics",
      "cart_recovery",
      "crm",
      "top_sellers",
      "custom_domain",
      "remove_branding",
      "multi_staff",
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolvePlan(raw: string | null | undefined): PlanName {
  if (raw === "lite" || raw === "pro") return raw;
  return "free";
}

// ---------------------------------------------------------------------------
// getPlan — return plan status for a tenant
// ---------------------------------------------------------------------------

export async function getPlan(tenantId: string) {
  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: { plan: true, planExpiresAt: true, trialEndsAt: true },
  });

  const plan = resolvePlan(tenant.plan);
  const limits = PLAN_LIMITS[plan];
  const now = new Date();

  const isExpired = tenant.planExpiresAt ? tenant.planExpiresAt < now : false;
  const isTrialing = tenant.trialEndsAt ? tenant.trialEndsAt > now : false;

  // If plan expired, fall back to free limits
  const effectivePlan: PlanName = isExpired ? "free" : plan;
  const effectiveLimits = PLAN_LIMITS[effectivePlan];

  return {
    plan: effectivePlan,
    rawPlan: plan,
    limits: effectiveLimits,
    isExpired,
    isTrialing,
    planExpiresAt: tenant.planExpiresAt,
    trialEndsAt: tenant.trialEndsAt,
  };
}

// ---------------------------------------------------------------------------
// checkPlanLimit — check SKU or order usage against plan limits
// ---------------------------------------------------------------------------

export type LimitCheckResult = {
  allowed: boolean;
  current: number;
  limit: number;
};

export async function checkPlanLimit(
  tenantId: string,
  resource: "sku" | "orders"
): Promise<LimitCheckResult> {
  const { limits } = await getPlan(tenantId);

  if (resource === "sku") {
    const current = await prisma.product.count({
      where: { tenantId, active: true },
    });
    const limit = limits.maxSku;
    return { allowed: current < limit, current, limit };
  }

  // orders — count this calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const current = await prisma.order.count({
    where: {
      tenantId,
      createdAt: { gte: startOfMonth },
    },
  });
  const limit = limits.maxOrdersPerMonth;
  return { allowed: current < limit, current, limit };
}

// ---------------------------------------------------------------------------
// hasFeature — check if tenant's plan includes a feature
// ---------------------------------------------------------------------------

export async function hasFeature(
  tenantId: string,
  feature: FeatureName
): Promise<boolean> {
  const { limits } = await getPlan(tenantId);
  return limits.features.includes(feature);
}
