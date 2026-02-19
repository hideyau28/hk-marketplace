export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

// GET /api/admin/analytics/daily — last 30 days daily order count + revenue
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  if (!(await hasFeature(tenantId, "analytics"))) {
    throw new ApiError(403, "FORBIDDEN", "This feature requires Lite/Pro plan");
  }

  const now = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: { gte: start30 },
    },
    orderBy: { createdAt: "asc" },
    select: {
      status: true,
      amounts: true,
      createdAt: true,
    },
  });

  // Bucket by date
  const ordersMap = new Map<string, number>();
  const revenueMap = new Map<string, number>();

  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    ordersMap.set(key, (ordersMap.get(key) || 0) + 1);

    if (PAID_STATUSES.includes(o.status as (typeof PAID_STATUSES)[number])) {
      const amounts = o.amounts as Record<string, unknown> | null;
      const total = Number(amounts?.total) || 0;
      revenueMap.set(key, (revenueMap.get(key) || 0) + total);
    }
  }

  // Build 30-day array
  const daily = Array.from({ length: 30 }).map((_, idx) => {
    const d = new Date(start30);
    d.setDate(start30.getDate() + idx);
    const key = d.toISOString().slice(0, 10);
    return {
      date: key,
      orders: ordersMap.get(key) || 0,
      revenue: Math.round((revenueMap.get(key) || 0) * 100) / 100,
    };
  });

  return ok(req, { daily });
});
