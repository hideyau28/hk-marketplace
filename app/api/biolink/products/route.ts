export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

// GET /api/biolink/products?ids=xxx,yyy — public, no auth required
// Returns current price + active status for the given product IDs (scoped to tenant)
export const GET = withApi(async (req) => {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam?.trim()) {
    throw new ApiError(400, "BAD_REQUEST", "Missing ids parameter");
  }

  const ids = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (ids.length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "No valid product IDs provided");
  }

  if (ids.length > 100) {
    throw new ApiError(400, "BAD_REQUEST", "Too many product IDs (max 100)");
  }

  const tenantId = await getTenantId(req);

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, tenantId, hidden: false, deletedAt: null },
    select: { id: true, price: true, active: true },
  });

  return ok(req, { products });
});
