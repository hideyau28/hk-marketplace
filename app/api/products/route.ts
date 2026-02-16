export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

type ResolvedBadge = {
  nameZh: string;
  nameEn: string;
  color: string;
};

function isCuid(value: string) {
  return value.startsWith("c") && value.length >= 25;
}

// GET /api/products (public)
// Query params:
//   - limit: max results (1-200, default 50)
//   - q: search query (case-insensitive, matches title OR brand)
//   - category: optional category filter (1-50 chars)
//   - sort: 'new' | 'price_asc' | 'price_desc'
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const { searchParams } = new URL(req.url);

  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 50;

  const qRaw = searchParams.get("q");
  const q = qRaw?.trim() || "";

  const categoryRaw = searchParams.get("category");
  const category = categoryRaw?.trim() || "";

  const sortRaw = searchParams.get("sort")?.trim() || "";
  const sort = sortRaw as "" | "new" | "price_asc" | "price_desc";

  if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 500)) {
    throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 500");
  }

  if (q.length > 50) {
    throw new ApiError(400, "BAD_REQUEST", "q must be 50 characters or less");
  }

  if (category.length > 50) {
    throw new ApiError(400, "BAD_REQUEST", "category must be 50 characters or less");
  }

  if (sort && sort !== "new" && sort !== "price_asc" && sort !== "price_desc") {
    throw new ApiError(400, "BAD_REQUEST", "sort must be one of: new, price_asc, price_desc");
  }

  const where: Prisma.ProductWhereInput = { active: true, tenantId };

  // Add search filter if q is provided
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.category = category;
  }

  const orderBy =
    sort === "price_asc"
      ? ({ price: "asc" } as const)
      : sort === "price_desc"
        ? ({ price: "desc" } as const)
        : ({ createdAt: "desc" } as const);

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: limit,
    include: { variants: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
  });

  const badges = await prisma.badge.findMany({ where: { tenantId } });
  const badgeMap = new Map(badges.map((badge) => [badge.id, badge]));

  const productsWithBadges = products.map((product) => {
    const resolvedBadges: ResolvedBadge[] = [];
    if (Array.isArray(product.badges)) {
      for (const entry of product.badges) {
        if (typeof entry !== "string") continue;
        if (isCuid(entry)) {
          const badge = badgeMap.get(entry);
          if (badge) {
            resolvedBadges.push({
              nameZh: badge.nameZh,
              nameEn: badge.nameEn,
              color: badge.color,
            });
          }
        } else {
          resolvedBadges.push({ nameZh: entry, nameEn: entry, color: "" });
        }
      }
    }
    return { ...product, resolvedBadges };
  });

  return ok(req, { products: productsWithBadges, query: q || null }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
  });
});
