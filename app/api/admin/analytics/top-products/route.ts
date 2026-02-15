export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

// GET /api/admin/analytics/top-products — top 5 best-selling products (last 30 days)
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const now = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: { gte: start30 },
      status: { in: [...PAID_STATUSES] },
    },
    select: {
      items: true,
    },
  });

  const productCounts = new Map<string, number>();

  for (const order of orders) {
    const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
    for (const item of items) {
      const name = String(item?.name || item?.title || "Item");
      const qty = Number(item?.quantity ?? item?.qty ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      productCounts.set(name, (productCounts.get(name) || 0) + qty);
    }
  }

  const topProducts = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, quantity]) => ({ name, quantity }));

  return ok(req, { topProducts });
});
