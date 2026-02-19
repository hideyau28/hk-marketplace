export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

type CouponPayload = {
  code?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
  minOrder?: unknown;
  maxUsage?: unknown;
  active?: unknown;
  expiresAt?: unknown;
};

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

function parseDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "expiresAt must be a string");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, "BAD_REQUEST", "expiresAt is invalid");
  }
  return date;
}

// GET /api/admin/coupons
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  if (!(await hasFeature(tenantId, "coupon"))) {
    throw new ApiError(403, "FORBIDDEN", "This feature requires Lite/Pro plan");
  }

  const coupons = await prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return ok(req, { coupons });
});

// POST /api/admin/coupons
export const POST = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  if (!(await hasFeature(tenantId, "coupon"))) {
    throw new ApiError(403, "FORBIDDEN", "This feature requires Lite/Pro plan");
  }

  let body: CouponPayload;
  try {
    body = (await req.json()) as CouponPayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  assertNonEmptyString(body.code, "code");
  const code = (body.code as string).trim().toUpperCase();

  if (body.discountType !== "PERCENTAGE" && body.discountType !== "FIXED") {
    throw new ApiError(400, "BAD_REQUEST", "discountType must be PERCENTAGE or FIXED");
  }

  assertNonNegativeNumber(body.discountValue, "discountValue");

  let minOrder: number | null = null;
  if (body.minOrder !== undefined && body.minOrder !== null && body.minOrder !== "") {
    assertNonNegativeNumber(body.minOrder, "minOrder");
    minOrder = Number(body.minOrder);
  }

  let maxUsage: number | null = null;
  if (body.maxUsage !== undefined && body.maxUsage !== null && body.maxUsage !== "") {
    const mu = Number(body.maxUsage);
    if (!Number.isInteger(mu) || mu < 1) {
      throw new ApiError(400, "BAD_REQUEST", "maxUsage must be a positive integer");
    }
    maxUsage = mu;
  }

  let active = true;
  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      throw new ApiError(400, "BAD_REQUEST", "active must be a boolean");
    }
    active = body.active;
  }

  const expiresAt = parseDate(body.expiresAt);

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountType: body.discountType,
      discountValue: Number(body.discountValue),
      minOrder,
      maxUsage,
      active,
      expiresAt,
      tenantId,
    },
  });

  return ok(req, coupon);
});
