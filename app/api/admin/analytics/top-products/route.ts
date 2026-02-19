export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

const PAID_STATUSES = ["PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

type RangeParam = "7d" | "30d" | "all";

function getStartDate(range: RangeParam): Date | null {
  if (range === "all") return null;
  const now = new Date();
  const days = range === "7d" ? 6 : 29;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
}

// GET /api/admin/analytics/top-products
// Query: ?range=7d|30d|all (default 30d)
// Returns top 10 best-selling products with image and revenue
// Requires top_sellers feature (Pro); falls back to basic top 5 for analytics (Lite)
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const { searchParams } = new URL(req.url);
  const rangeRaw = searchParams.get("range") || "30d";
  if (rangeRaw !== "7d" && rangeRaw !== "30d" && rangeRaw !== "all") {
    throw new ApiError(400, "BAD_REQUEST", "range must be 7d, 30d, or all");
  }
  const range = rangeRaw as RangeParam;

  const hasTopSellers = await hasFeature(tenantId, "top_sellers");
  const hasAnalytics = await hasFeature(tenantId, "analytics");

  if (!hasAnalytics && !hasTopSellers) {
    throw new ApiError(403, "FORBIDDEN", "Analytics feature not available on your plan");
  }

  const startDate = getStartDate(range);

  const where: Record<string, unknown> = {
    tenantId,
    status: { in: [...PAID_STATUSES] },
  };
  if (startDate) {
    where.createdAt = { gte: startDate };
  }

  const orders = await prisma.order.findMany({
    where,
    select: { items: true },
  });

  // Aggregate by productId when available, fallback to name
  const productAgg = new Map<string, { name: string; quantity: number; revenue: number; productId: string | null }>();

  for (const order of orders) {
    const items = Array.isArray(order.items) ? (order.items as Record<string, unknown>[]) : [];
    for (const item of items) {
      const productId = typeof item?.productId === "string" ? item.productId : null;
      const name = String(item?.name || item?.title || "Item");
      const qty = Number(item?.quantity ?? item?.qty ?? 0);
      const unitPrice = Number(item?.unitPrice ?? item?.price ?? 0);
      if (!Number.isFinite(qty) || qty <= 0) continue;

      const key = productId || name;
      const existing = productAgg.get(key);
      if (existing) {
        existing.quantity += qty;
        existing.revenue += qty * unitPrice;
      } else {
        productAgg.set(key, { name, quantity: qty, revenue: qty * unitPrice, productId });
      }
    }
  }

  // Determine limit based on plan
  const limit = hasTopSellers ? 10 : 5;

  const sorted = Array.from(productAgg.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  // Fetch product images for items with productId
  const productIds = sorted.map((p) => p.productId).filter((id): id is string => id !== null);
  let imageMap = new Map<string, string | null>();
  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, tenantId },
      select: { id: true, imageUrl: true },
    });
    imageMap = new Map(products.map((p) => [p.id, p.imageUrl]));
  }

  const topProducts = sorted.map((p) => ({
    name: p.name,
    quantity: p.quantity,
    revenue: Math.round(p.revenue),
    imageUrl: p.productId ? (imageMap.get(p.productId) || null) : null,
  }));

  return ok(req, { topProducts, range, enhanced: hasTopSellers });
});
