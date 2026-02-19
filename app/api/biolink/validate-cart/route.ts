export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";
import { prisma } from "@/lib/prisma";

// POST /api/biolink/validate-cart — public, no auth required
// Body: { items: Array<{ productId: string; name?: string }> }
// Returns: { valid: boolean; invalidItems: Array<{ productId: string; name: string }> }
export const POST = withApi(async (req) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  if (!body || typeof body !== "object") {
    throw new ApiError(400, "BAD_REQUEST", "Invalid request body");
  }

  const b = body as Record<string, unknown>;

  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "Missing or empty items array");
  }

  const items = b.items as Array<{ productId: string; name?: string }>;

  for (const item of items) {
    if (!item || typeof item.productId !== "string" || !item.productId) {
      throw new ApiError(400, "BAD_REQUEST", "Each item must have a productId string");
    }
  }

  const tenantId = await getTenantId(req);
  const productIds = [...new Set(items.map((i) => i.productId))];

  // Fetch only valid products (active + not soft-deleted + belong to tenant)
  const validProducts = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      tenantId,
      active: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  const validIds = new Set(validProducts.map((p) => p.id));

  // Items in cart that are no longer valid
  const invalidItems = items
    .filter((item) => !validIds.has(item.productId))
    .map((item) => ({
      productId: item.productId,
      name: item.name ?? item.productId,
    }));

  return ok(req, {
    valid: invalidItems.length === 0,
    invalidItems,
  });
});
