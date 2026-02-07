export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/products/:id/variants
export const GET = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId: id, tenantId },
      orderBy: { sortOrder: "asc" },
    });

    return ok(req, { variants });
  }
);

// POST /api/admin/products/:id/variants
export const POST = withApi(
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

    if (!body || typeof body !== "object") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    // Validate required field: name
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "name must be a non-empty string");
    }

    // Validate optional sku uniqueness per tenant
    const sku = body.sku != null ? String(body.sku).trim() || null : null;
    if (sku) {
      const existing = await prisma.productVariant.findFirst({
        where: { tenantId, sku },
      });
      if (existing) {
        throw new ApiError(409, "CONFLICT", "SKU already exists for this tenant");
      }
    }

    // Validate optional numeric fields
    if (body.price !== undefined && body.price !== null) {
      if (typeof body.price !== "number" || Number.isNaN(body.price) || body.price < 0) {
        throw new ApiError(400, "BAD_REQUEST", "price must be a non-negative number");
      }
    }
    if (body.compareAtPrice !== undefined && body.compareAtPrice !== null) {
      if (typeof body.compareAtPrice !== "number" || Number.isNaN(body.compareAtPrice) || body.compareAtPrice < 0) {
        throw new ApiError(400, "BAD_REQUEST", "compareAtPrice must be a non-negative number");
      }
    }
    if (body.stock !== undefined && body.stock !== null) {
      if (typeof body.stock !== "number" || !Number.isInteger(body.stock) || body.stock < 0) {
        throw new ApiError(400, "BAD_REQUEST", "stock must be a non-negative integer");
      }
    }
    if (body.active !== undefined && typeof body.active !== "boolean") {
      throw new ApiError(400, "BAD_REQUEST", "active must be a boolean");
    }

    const variant = await prisma.productVariant.create({
      data: {
        tenantId,
        productId: id,
        name: body.name.trim(),
        sku,
        price: body.price ?? null,
        compareAtPrice: body.compareAtPrice ?? null,
        stock: body.stock ?? 0,
        options: body.options ?? null,
        imageUrl: body.imageUrl ?? null,
        active: body.active ?? true,
      },
    });

    return ok(req, variant);
  }
);
