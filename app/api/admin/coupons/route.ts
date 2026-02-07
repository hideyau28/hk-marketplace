export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getSessionFromCookie } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

type CouponPayload = {
  code?: unknown;
  discountType?: unknown;
  discountValue?: unknown;
  minOrder?: unknown;
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
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();
  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await getTenantId(req);

  const coupons = await prisma.coupon.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return ok(req, { coupons });
});

// POST /api/admin/coupons
export const POST = withApi(async (req) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();
  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const tenantId = await getTenantId(req);

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
      active,
      expiresAt,
      tenantId,
    },
  });

  return ok(req, coupon);
});
