export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { ok, ApiError } from "@/lib/api/route-helpers";
import { withApi } from "@/lib/api/route-helpers";

// GET /api/admin/categories — list all categories for tenant
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const categories = await prisma.category.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      children: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return ok(req, { categories });
});

// POST /api/admin/categories — create a new category
export const POST = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

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

  // Validate required fields
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    throw new ApiError(400, "BAD_REQUEST", "name is required");
  }
  if (!body.slug || typeof body.slug !== "string" || !body.slug.trim()) {
    throw new ApiError(400, "BAD_REQUEST", "slug is required");
  }

  const name = body.name.trim();
  const slug = body.slug.trim().toLowerCase();

  // Validate slug uniqueness per tenant
  const existing = await prisma.category.findFirst({
    where: { tenantId, slug },
  });
  if (existing) {
    throw new ApiError(409, "CONFLICT", `Slug "${slug}" already exists`);
  }

  // If parentId provided, verify parent exists and belongs to same tenant
  if (body.parentId) {
    if (typeof body.parentId !== "string") {
      throw new ApiError(400, "BAD_REQUEST", "parentId must be a string");
    }
    const parent = await prisma.category.findFirst({
      where: { id: body.parentId, tenantId },
    });
    if (!parent) {
      throw new ApiError(404, "NOT_FOUND", "Parent category not found");
    }
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      tenantId,
      parentId: typeof body.parentId === "string" ? body.parentId : undefined,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : undefined,
      active: typeof body.active === "boolean" ? body.active : true,
    },
  });

  return ok(req, category);
});
