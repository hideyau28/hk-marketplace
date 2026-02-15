export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

// GET /api/top-sellers — public endpoint returning top 3 best-selling product IDs
// Used by storefront to display 🔥 badge on top-selling products
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  // Aggregate paid orders from last 30 days
  const now = new Date();
  const start30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);

  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: { gte: start30 },
      status: { in: [...PAID_STATUSES] },
    },
    select: { items: true },
  });

  // Aggregate sales by productId
  const productCounts = new Map<string, number>();

  for (const order of orders) {
    const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
    for (const item of items) {
      const productId = typeof item?.productId === "string" ? item.productId : null;
      if (!productId) continue;
      const qty = Number(item?.quantity ?? item?.qty ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;
      productCounts.set(productId, (productCounts.get(productId) || 0) + qty);
    }
  }

  // Return top 3 product IDs
  const topSellerIds = Array.from(productCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id);

  return ok(req, { topSellerIds });
});
