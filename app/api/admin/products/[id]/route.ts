export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { parseBadges } from "@/lib/parse-badges";

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

// GET /api/admin/products/:id (admin)
export const GET = withApi(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }
    return ok(_req, product);
  },
  { admin: true }
);

// PATCH /api/admin/products/:id (admin update)
export const PATCH = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
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

    // Validate and collect fields to update
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
      updateData.badges = badges.length > 0 ? badges : undefined;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
    }

    const product = await prisma.product
      .update({
        where: { id },
        data: updateData,
      })
      .catch(() => null);

    if (!product) {
      throw new ApiError(404, "NOT_FOUND", "Product not found");
    }

    return ok(req, product);
  },
  { admin: true }
);
