export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/products/:id/variants/:variantId
export const PATCH = withApi(
  async (
    req: Request,
    { params }: { params: Promise<{ id: string; variantId: string }> }
  ) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id, variantId } = await params;

    // Verify variant exists and belongs to the same tenant
    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id, tenantId },
    });
    if (!variant) {
      throw new ApiError(404, "NOT_FOUND", "Variant not found");
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    if (!body || typeof body !== "object") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.trim().length === 0) {
        throw new ApiError(400, "BAD_REQUEST", "name must be a non-empty string");
      }
      updateData.name = body.name.trim();
    }

    if (body.sku !== undefined) {
      const newSku = body.sku != null ? String(body.sku).trim() || null : null;
      if (newSku && newSku !== variant.sku) {
        const existing = await prisma.productVariant.findFirst({
          where: { tenantId, sku: newSku },
        });
        if (existing) {
          throw new ApiError(409, "CONFLICT", "SKU already exists for this tenant");
        }
      }
      updateData.sku = newSku;
    }

    if (body.price !== undefined) {
      if (body.price === null) {
        updateData.price = null;
      } else {
        if (typeof body.price !== "number" || Number.isNaN(body.price) || body.price < 0) {
          throw new ApiError(400, "BAD_REQUEST", "price must be a non-negative number");
        }
        updateData.price = body.price;
      }
    }

    if (body.compareAtPrice !== undefined) {
      if (body.compareAtPrice === null) {
        updateData.compareAtPrice = null;
      } else {
        if (typeof body.compareAtPrice !== "number" || Number.isNaN(body.compareAtPrice) || body.compareAtPrice < 0) {
          throw new ApiError(400, "BAD_REQUEST", "compareAtPrice must be a non-negative number");
        }
        updateData.compareAtPrice = body.compareAtPrice;
      }
    }

    if (body.stock !== undefined) {
      if (typeof body.stock !== "number" || !Number.isInteger(body.stock) || body.stock < 0) {
        throw new ApiError(400, "BAD_REQUEST", "stock must be a non-negative integer");
      }
      updateData.stock = body.stock;
    }

    if (body.options !== undefined) {
      updateData.options = body.options;
    }

    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        throw new ApiError(400, "BAD_REQUEST", "active must be a boolean");
      }
      updateData.active = body.active;
    }

    if (body.sortOrder !== undefined) {
      if (typeof body.sortOrder !== "number" || !Number.isInteger(body.sortOrder) || body.sortOrder < 0) {
        throw new ApiError(400, "BAD_REQUEST", "sortOrder must be a non-negative integer");
      }
      updateData.sortOrder = body.sortOrder;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return ok(req, updated);
  }
);

// DELETE /api/admin/products/:id/variants/:variantId
export const DELETE = withApi(
  async (
    req: Request,
    { params }: { params: Promise<{ id: string; variantId: string }> }
  ) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id, variantId } = await params;

    const variant = await prisma.productVariant.findFirst({
      where: { id: variantId, productId: id, tenantId },
    });
    if (!variant) {
      throw new ApiError(404, "NOT_FOUND", "Variant not found");
    }

    await prisma.productVariant.delete({ where: { id: variantId } });

    return ok(req, { deleted: true });
  }
);
