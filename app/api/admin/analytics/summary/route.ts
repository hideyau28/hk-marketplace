export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * 已付款嘅 order statuses（新 flow + legacy）
 */
const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

// GET /api/admin/analytics/summary — today / this week / this month stats
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const now = new Date();

  // Today: start of day (UTC)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // This week: start of Monday (ISO week)
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

  // This month: start of month
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Fetch all orders from start of month (covers today + week + month)
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: { gte: monthStart },
    },
    select: {
      status: true,
      amounts: true,
      createdAt: true,
    },
  });

  function aggregate(since: Date) {
    let orderCount = 0;
    let revenue = 0;
    for (const o of orders) {
      if (o.createdAt < since) continue;
      orderCount++;
      if (PAID_STATUSES.includes(o.status as (typeof PAID_STATUSES)[number])) {
        const amounts = o.amounts as Record<string, unknown> | null;
        revenue += Number(amounts?.total) || 0;
      }
    }
    return { orderCount, revenue: Math.round(revenue * 100) / 100 };
  }

  const today = aggregate(todayStart);
  const week = aggregate(weekStart);
  const month = aggregate(monthStart);

  return ok(req, { today, week, month });
});
