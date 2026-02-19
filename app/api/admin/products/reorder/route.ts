export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// POST /api/admin/products/reorder (admin)
export const POST = withApi(
  async (req) => {
    const { tenantId } = await authenticateAdmin(req);

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    if (!Array.isArray(body.productIds)) {
      throw new ApiError(400, "BAD_REQUEST", "productIds must be an array");
    }

    const productIds = body.productIds as string[];

    if (productIds.length === 0) {
      return ok(req, { success: true });
    }

    // Verify all products belong to this tenant
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId,
      },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new ApiError(400, "BAD_REQUEST", "Some products not found or do not belong to this tenant");
    }

    // Update sortOrder for each product
    await Promise.all(
      productIds.map((id: string, index: number) =>
        prisma.product.updateMany({
          where: { id, tenantId },
          data: { sortOrder: index },
        })
      )
    );

    return ok(req, { success: true });
  }
);
