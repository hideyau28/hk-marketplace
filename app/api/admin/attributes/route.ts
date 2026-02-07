export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["select", "text", "number"] as const;

type CreatePayload = {
  name?: unknown;
  slug?: unknown;
  type?: unknown;
  options?: unknown;
  required?: unknown;
  sortOrder?: unknown;
};

function assertNonEmptyString(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-empty string`);
  }
}

/* ── GET  /api/admin/attributes ── */
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  const attributes = await prisma.attributeDefinition.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return ok(req, { attributes });
});

/* ── POST  /api/admin/attributes ── */
export const POST = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  let body: CreatePayload;
  try {
    body = (await req.json()) as CreatePayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  // Required fields
  assertNonEmptyString(body.name, "name");
  assertNonEmptyString(body.slug, "slug");

  const name = (body.name as string).trim();
  const slug = (body.slug as string).trim();

  // Validate type
  const type = (body.type as string) ?? "select";
  if (!ALLOWED_TYPES.includes(type as (typeof ALLOWED_TYPES)[number])) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `type must be one of: ${ALLOWED_TYPES.join(", ")}`,
    );
  }

  // If type=select, options must be an array
  if (type === "select") {
    if (body.options !== undefined && !Array.isArray(body.options)) {
      throw new ApiError(400, "BAD_REQUEST", "options must be an array when type is select");
    }
  }

  // Slug unique per tenant
  const existing = await prisma.attributeDefinition.findFirst({
    where: { tenantId, slug },
  });
  if (existing) {
    throw new ApiError(409, "CONFLICT", `Attribute with slug "${slug}" already exists`);
  }

  const attribute = await prisma.attributeDefinition.create({
    data: {
      tenantId,
      name,
      slug,
      type,
      options: body.options !== undefined ? body.options : undefined,
      required: typeof body.required === "boolean" ? body.required : false,
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
    },
  });

  return ok(req, attribute);
});
