export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseBadges } from "@/lib/parse-badges";

const VALID_VARIANT_STATUSES = ["available", "restocking", "preorder", "hidden"] as const;

function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-empty string`);
  }
}

function assertNonNegativeNumber(value: unknown, field: string) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-negative number`);
  }
}

function assertNonNegativeInt(value: unknown, field: string) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-negative integer`);
  }
}

function parseSizes(value: unknown): Record<string, number> | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    const result: Record<string, number> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (typeof val === "number" && val >= 0) {
        result[key] = val;
      }
    }
    return Object.keys(result).length > 0 ? result : null;
  }
  if (Array.isArray(value)) {
    const result: Record<string, number> = {};
    value.forEach((v) => {
      if (typeof v === "string" && v.trim()) {
        result[v.trim()] = 0;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  if (typeof value === "string") {
    const result: Record<string, number> = {};
    value.split(",").forEach((v) => {
      if (v.trim()) {
        result[v.trim()] = 0;
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
  throw new ApiError(400, "BAD_REQUEST", "sizes must be an object, array, or comma-separated string");
}

// GET /api/admin/products/:id (admin)
export const GET = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, tenantId },
      include: { productVariants: { orderBy: { sortOrder: "asc" } } },
    });
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }
    return ok(req, product);
  }
);

// PATCH /api/admin/products/:id (admin update)
export const PATCH = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);

    const { id } = await params;

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

    if (body.brand !== undefined) {
      if (body.brand === null || body.brand === "") {
        updateData.brand = null;
      } else if (typeof body.brand === "string") {
        updateData.brand = body.brand.trim();
      } else {
        throw new ApiError(400, "BAD_REQUEST", "brand must be a string or null");
      }
    }

    if (body.title !== undefined) {
      assertNonEmptyString(body.title, "title");
      updateData.title = body.title.trim();
    }

    if (body.price !== undefined) {
      assertNonNegativeNumber(body.price, "price");
      updateData.price = body.price;
    }

    if (body.originalPrice !== undefined) {
      if (body.originalPrice === null) {
        updateData.originalPrice = null;
      } else {
        assertNonNegativeNumber(body.originalPrice, "originalPrice");
        updateData.originalPrice = body.originalPrice;
      }
    }

    if (body.imageUrl !== undefined) {
      if (body.imageUrl === null || body.imageUrl === "") {
        updateData.imageUrl = null;
      } else if (typeof body.imageUrl === "string") {
        updateData.imageUrl = body.imageUrl.trim();
      } else {
        throw new ApiError(400, "BAD_REQUEST", "imageUrl must be a string or null");
      }
    }

    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") {
        throw new ApiError(400, "BAD_REQUEST", "active must be a boolean");
      }
      updateData.active = body.active;
    }

    if (body.category !== undefined) {
      if (body.category === null || body.category === "") {
        updateData.category = null;
      } else if (typeof body.category === "string") {
        const trimmed = body.category.trim();
        if (trimmed.length > 50) {
          throw new ApiError(400, "BAD_REQUEST", "category must be 50 characters or less");
        }
        updateData.category = trimmed;
      } else {
        throw new ApiError(400, "BAD_REQUEST", "category must be a string or null");
      }
    }

    if (body.badges !== undefined) {
      const badges = parseBadges(body.badges);
      updateData.badges = badges;
    }

    if (body.sizeSystem !== undefined || body.sizes !== undefined) {
      const sizeSystem =
        typeof body.sizeSystem === "string" && body.sizeSystem.trim().length > 0
          ? body.sizeSystem.trim()
          : null;
      const sizes = parseSizes(body.sizes);
      if ((sizeSystem && !sizes) || (!sizeSystem && sizes)) {
        throw new ApiError(400, "BAD_REQUEST", "sizeSystem and sizes must both be provided");
      }
      updateData.sizeSystem = sizeSystem;
      updateData.sizes = sizes ?? undefined;
    }

    if (body.stock !== undefined) {
      assertNonNegativeInt(body.stock, "stock");
      updateData.stock = body.stock;
    }

    if (body.featured !== undefined) {
      if (typeof body.featured !== "boolean") {
        throw new ApiError(400, "BAD_REQUEST", "featured must be a boolean");
      }
      updateData.featured = body.featured;
    }

    if (body.promotionBadges !== undefined) {
      if (!Array.isArray(body.promotionBadges)) {
        throw new ApiError(400, "BAD_REQUEST", "promotionBadges must be an array");
      }
      const validBadges = body.promotionBadges.every((b: unknown) => typeof b === "string");
      if (!validBadges) {
        throw new ApiError(400, "BAD_REQUEST", "promotionBadges must contain only strings");
      }
      updateData.promotionBadges = body.promotionBadges;
    }

    // Variant system fields
    if (body.variantLabel !== undefined) {
      if (body.variantLabel === null || body.variantLabel === "") {
        updateData.variantLabel = null;
      } else if (typeof body.variantLabel === "string") {
        updateData.variantLabel = body.variantLabel.trim();
      } else {
        throw new ApiError(400, "BAD_REQUEST", "variantLabel must be a string or null");
      }
    }

    if (body.variants !== undefined) {
      if (body.variants === null) {
        updateData.variants = null;
      } else if (typeof body.variants === "object" && !Array.isArray(body.variants)) {
        for (const [name, v] of Object.entries(body.variants as Record<string, any>)) {
          if (!v || typeof v !== "object") {
            throw new ApiError(400, "BAD_REQUEST", `variants["${name}"] must be an object with qty and status`);
          }
          if (typeof v.qty !== "number" || v.qty < 0) {
            throw new ApiError(400, "BAD_REQUEST", `variants["${name}"].qty must be a non-negative number`);
          }
          if (typeof v.status !== "string" || !VALID_VARIANT_STATUSES.includes(v.status as any)) {
            throw new ApiError(400, "BAD_REQUEST", `variants["${name}"].status must be one of: ${VALID_VARIANT_STATUSES.join(", ")}`);
          }
        }
        updateData.variants = body.variants;
      } else {
        throw new ApiError(400, "BAD_REQUEST", "variants must be an object or null");
      }
    }

    if (body.promoEndDate !== undefined) {
      if (body.promoEndDate === null) {
        updateData.promoEndDate = null;
      } else if (typeof body.promoEndDate === "string") {
        const d = new Date(body.promoEndDate);
        if (isNaN(d.getTime())) {
          throw new ApiError(400, "BAD_REQUEST", "promoEndDate must be a valid date");
        }
        updateData.promoEndDate = d;
      } else {
        throw new ApiError(400, "BAD_REQUEST", "promoEndDate must be an ISO date string or null");
      }
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
    }

    const existing = await prisma.product.findFirst({ where: { id, tenantId } });
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return ok(req, product);
  }
);
