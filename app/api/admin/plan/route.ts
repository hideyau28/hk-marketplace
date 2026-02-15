export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { getPlan, checkPlanLimit, PLAN_LIMITS } from "@/lib/plan";

// GET /api/admin/plan — plan status + usage + limits
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const [planInfo, skuUsage, orderUsage] = await Promise.all([
    getPlan(tenantId),
    checkPlanLimit(tenantId, "sku"),
    checkPlanLimit(tenantId, "orders"),
  ]);

  return ok(req, {
    plan: planInfo.plan,
    isExpired: planInfo.isExpired,
    isTrialing: planInfo.isTrialing,
    planExpiresAt: planInfo.planExpiresAt,
    trialEndsAt: planInfo.trialEndsAt,
    limits: planInfo.limits,
    usage: {
      sku: { current: skuUsage.current, limit: skuUsage.limit },
      orders: { current: orderUsage.current, limit: orderUsage.limit },
    },
    allPlans: PLAN_LIMITS,
  });
});
