export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

// GET /api/products (public)
export const GET = withApi(async (req) => {
  const { searchParams } = new URL(req.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : 50;

  if (limitParam && (Number.isNaN(limit) || limit <= 0 || limit > 200)) {
    throw new ApiError(400, "BAD_REQUEST", "limit must be between 1 and 200");
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return ok(req, { products });
});
