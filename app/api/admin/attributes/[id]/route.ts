export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["select", "text", "number"] as const;

type UpdatePayload = {
  name?: unknown;
  slug?: unknown;
  type?: unknown;
  options?: unknown;
  required?: unknown;
  sortOrder?: unknown;
};

type RouteCtx = { params: Promise<{ id: string }> };

/* ── PATCH  /api/admin/attributes/[id] ── */
export const PATCH = withApi(async (req: Request, { params }: RouteCtx) => {
  const { tenantId } = await authenticateAdmin(req);
  const { id } = await params;

  const existing = await prisma.attributeDefinition.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Attribute not found");
  }

  let body: UpdatePayload;
  try {
    body = (await req.json()) as UpdatePayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const updateData: Record<string, unknown> = {};

  // name
  if (body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim().length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "name must be a non-empty string");
    }
    updateData.name = (body.name as string).trim();
  }

  // slug — check uniqueness if changed
  if (body.slug !== undefined) {
    if (typeof body.slug !== "string" || body.slug.trim().length === 0) {
      throw new ApiError(400, "BAD_REQUEST", "slug must be a non-empty string");
    }
    const slug = (body.slug as string).trim();
    if (slug !== existing.slug) {
      const dup = await prisma.attributeDefinition.findFirst({
        where: { tenantId, slug },
      });
      if (dup) {
        throw new ApiError(409, "CONFLICT", `Attribute with slug "${slug}" already exists`);
      }
    }
    updateData.slug = slug;
  }

  // type
  if (body.type !== undefined) {
    if (!ALLOWED_TYPES.includes(body.type as (typeof ALLOWED_TYPES)[number])) {
      throw new ApiError(
        400,
        "BAD_REQUEST",
        `type must be one of: ${ALLOWED_TYPES.join(", ")}`,
      );
    }
    updateData.type = body.type;
  }

  // options — validate array if current or incoming type is "select"
  if (body.options !== undefined) {
    const effectiveType = (updateData.type as string) ?? existing.type;
    if (effectiveType === "select" && !Array.isArray(body.options)) {
      throw new ApiError(400, "BAD_REQUEST", "options must be an array when type is select");
    }
    updateData.options = body.options;
  }

  // required
  if (body.required !== undefined) {
    if (typeof body.required !== "boolean") {
      throw new ApiError(400, "BAD_REQUEST", "required must be a boolean");
    }
    updateData.required = body.required;
  }

  // sortOrder
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== "number") {
      throw new ApiError(400, "BAD_REQUEST", "sortOrder must be a number");
    }
    updateData.sortOrder = body.sortOrder;
  }

  const attribute = await prisma.attributeDefinition.update({
    where: { id },
    data: updateData,
  });

  return ok(req, attribute);
});

/* ── DELETE  /api/admin/attributes/[id] ── */
export const DELETE = withApi(async (req: Request, { params }: RouteCtx) => {
  const { tenantId } = await authenticateAdmin(req);
  const { id } = await params;

  const existing = await prisma.attributeDefinition.findFirst({
    where: { id, tenantId },
  });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Attribute not found");
  }

  await prisma.attributeDefinition.deleteMany({ where: { id, tenantId } });

  return ok(req, { success: true });
});
