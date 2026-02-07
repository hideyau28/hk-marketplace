export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { ok, ApiError } from "@/lib/api/route-helpers";
import { withApi } from "@/lib/api/route-helpers";

// PATCH /api/admin/categories/[id] — update a category
export const PATCH = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Category not found");
    }

    let body: {
      name?: unknown;
      slug?: unknown;
      parentId?: unknown;
      sortOrder?: unknown;
      imageUrl?: unknown;
      active?: unknown;
    };
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const updateData: {
      name?: string;
      slug?: string;
      parentId?: string | null;
      sortOrder?: number;
      imageUrl?: string | null;
      active?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        throw new ApiError(400, "BAD_REQUEST", "name must be a non-empty string");
      }
      updateData.name = body.name.trim();
    }

    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || !body.slug.trim()) {
        throw new ApiError(400, "BAD_REQUEST", "slug must be a non-empty string");
      }
      const slug = body.slug.trim().toLowerCase();
      if (slug !== existing.slug) {
        const duplicate = await prisma.category.findFirst({
          where: { tenantId, slug, NOT: { id } },
        });
        if (duplicate) {
          throw new ApiError(409, "CONFLICT", `Slug "${slug}" already exists`);
        }
      }
      updateData.slug = slug;
    }

    if (body.parentId !== undefined) {
      if (body.parentId === null) {
        updateData.parentId = null;
      } else if (typeof body.parentId === "string") {
        if (body.parentId === id) {
          throw new ApiError(400, "BAD_REQUEST", "Category cannot be its own parent");
        }
        const parent = await prisma.category.findFirst({
          where: { id: body.parentId, tenantId },
        });
        if (!parent) {
          throw new ApiError(404, "NOT_FOUND", "Parent category not found");
        }
        updateData.parentId = body.parentId;
      } else {
        throw new ApiError(400, "BAD_REQUEST", "parentId must be a string or null");
      }
    }

    if (body.sortOrder !== undefined) {
      if (typeof body.sortOrder !== "number") {
        throw new ApiError(400, "BAD_REQUEST", "sortOrder must be a number");
      }
      updateData.sortOrder = body.sortOrder;
    }

    if (body.imageUrl !== undefined) {
      if (body.imageUrl === null) {
        updateData.imageUrl = null;
      } else if (typeof body.imageUrl === "string") {
        updateData.imageUrl = body.imageUrl;
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

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return ok(req, category);
  }
);

// DELETE /api/admin/categories/[id] — delete a category
export const DELETE = withApi(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { tenantId } = await authenticateAdmin(req);
    const { id } = await params;

    const existing = await prisma.category.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new ApiError(404, "NOT_FOUND", "Category not found");
    }

    // Unlink products that reference this category
    await prisma.product.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    // Delete the category
    await prisma.category.delete({ where: { id } });

    return ok(req, { success: true });
  }
);
