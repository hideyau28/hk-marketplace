export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { getPlan, checkPlanLimit, PLAN_LIMITS } from "@/lib/plan";
import { getSubscriptionDetails, PLAN_PRICES } from "@/lib/stripe-subscription";

/**
 * GET /api/admin/billing
 * Returns comprehensive billing info for the admin billing page
 */
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const [tenant, planInfo, skuUsage, orderUsage] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        plan: true,
        planExpiresAt: true,
        planStartedAt: true,
        planGracePeriodEndsAt: true,
        trialEndsAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        subscriptionEndsAt: true,
      },
    }),
    getPlan(tenantId),
    checkPlanLimit(tenantId, "sku"),
    checkPlanLimit(tenantId, "orders"),
  ]);

  // 查 Stripe subscription 狀態（如果有）
  let subscriptionStatus: string | null = null;
  let currentPeriodEnd: string | null = null;
  let cancelAtPeriodEnd = false;

  if (tenant.stripeSubscriptionId) {
    const sub = await getSubscriptionDetails(tenant.stripeSubscriptionId);
    if (sub) {
      subscriptionStatus = sub.status;
      // current_period_end 喺 Stripe SDK v20 係 SubscriptionItem 上
      const firstItem = sub.items?.data?.[0];
      currentPeriodEnd = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : null;
      cancelAtPeriodEnd = sub.cancel_at_period_end;
    }
  }

  // Grace period 狀態
  const now = new Date();
  const isInGracePeriod =
    tenant.planGracePeriodEndsAt !== null &&
    tenant.planGracePeriodEndsAt > now;
  const gracePeriodExpired =
    tenant.planGracePeriodEndsAt !== null &&
    tenant.planGracePeriodEndsAt <= now;

  return ok(req, {
    plan: planInfo.plan,
    rawPlan: planInfo.rawPlan,
    isExpired: planInfo.isExpired,
    isTrialing: planInfo.isTrialing,
    planExpiresAt: tenant.planExpiresAt?.toISOString() || null,
    planStartedAt: tenant.planStartedAt?.toISOString() || null,
    trialEndsAt: tenant.trialEndsAt?.toISOString() || null,

    // Stripe
    hasStripeCustomer: !!tenant.stripeCustomerId,
    hasSubscription: !!tenant.stripeSubscriptionId,
    subscriptionStatus,
    currentPeriodEnd,
    cancelAtPeriodEnd,

    // Grace period
    isInGracePeriod,
    gracePeriodExpired,
    gracePeriodEndsAt: tenant.planGracePeriodEndsAt?.toISOString() || null,

    // Usage
    usage: {
      sku: { current: skuUsage.current, limit: skuUsage.limit },
      orders: { current: orderUsage.current, limit: orderUsage.limit },
    },

    // Plan details
    limits: planInfo.limits,
    allPlans: PLAN_LIMITS,
    planPrices: PLAN_PRICES,
  });
});
