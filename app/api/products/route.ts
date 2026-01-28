export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/products (public)
// Query params:
//   - limit: max results (1-200, default 50)
//   - q: search query (case-insensitive, matches title OR brand)
export const GET = withApi(async (req) => {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 50;
  const q = searchParams.get("q")?.trim() || "";

  if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 200)) {
    throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 200");
  }

  const where: any = { active: true };

  // Add search filter if q is provided
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return ok(req, { products, query: q || null });
});
