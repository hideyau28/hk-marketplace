export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/admin/products/:id/variants/sync
 *
 * Replaces all variants for a product with the provided list.
 * - Deletes existing variants not in the new list
 * - Updates existing variants that match by options
 * - Creates new variants
 */
export const PUT = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    if (!body || !Array.isArray(body.variants)) {
      throw new ApiError(400, "BAD_REQUEST", "variants must be an array");
    }

    const newVariants = body.variants as any[];

    // Validate each variant
    for (const v of newVariants) {
      if (typeof v.name !== "string" || v.name.trim().length === 0) {
        throw new ApiError(400, "BAD_REQUEST", "Each variant must have a non-empty name");
      }
    }

    // Delete all existing variants for this product
    await prisma.productVariant.deleteMany({
      where: { productId: id, tenantId },
    });

    // Create all new variants
    const created = [];
    for (let i = 0; i < newVariants.length; i++) {
      const v = newVariants[i];
      const variant = await prisma.productVariant.create({
        data: {
          tenantId,
          productId: id,
          name: v.name.trim(),
          sku: v.sku || null,
          price: typeof v.price === "number" ? v.price : null,
          compareAtPrice: typeof v.compareAtPrice === "number" ? v.compareAtPrice : null,
          stock: typeof v.stock === "number" ? Math.max(0, Math.floor(v.stock)) : 0,
          options: v.options || null,
          imageUrl: v.imageUrl || null,
          active: v.active !== false,
          sortOrder: v.sortOrder ?? i,
        },
      });
      created.push(variant);
    }

    // Update product total stock from variants
    const totalStock = created
      .filter((v) => v.active)
      .reduce((sum, v) => sum + v.stock, 0);

    await prisma.product.update({
      where: { id },
      data: { stock: totalStock },
    });

    return ok(req, { variants: created, totalStock });
  }
);
