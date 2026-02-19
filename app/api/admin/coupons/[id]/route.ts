export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

type CouponUpdatePayload = {
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

export const GET = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { tenantId } = await authenticateAdmin(req);

  const { id } = await params;
  const coupon = await prisma.coupon.findFirst({ where: { id, tenantId } });
  if (!coupon) throw new ApiError(404, "NOT_FOUND", "Coupon not found");
  return ok(req, coupon);
});

export const PATCH = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { tenantId } = await authenticateAdmin(req);

  const { id } = await params;
  let body: CouponUpdatePayload;
  try {
    body = (await req.json()) as CouponUpdatePayload;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const updateData: any = {};

  if (body.code !== undefined) {
    assertNonEmptyString(body.code, "code");
    updateData.code = (body.code as string).trim().toUpperCase();
  }

  if (body.discountType !== undefined) {
    if (body.discountType !== "PERCENTAGE" && body.discountType !== "FIXED") {
      throw new ApiError(400, "BAD_REQUEST", "discountType must be PERCENTAGE or FIXED");
    }
    updateData.discountType = body.discountType;
  }

  if (body.discountValue !== undefined) {
    assertNonNegativeNumber(body.discountValue, "discountValue");
    updateData.discountValue = Number(body.discountValue);
  }

  if (body.minOrder !== undefined) {
    if (body.minOrder === null || body.minOrder === "") {
      updateData.minOrder = null;
    } else {
      assertNonNegativeNumber(body.minOrder, "minOrder");
      updateData.minOrder = Number(body.minOrder);
    }
  }

  if (body.maxUsage !== undefined) {
    if (body.maxUsage === null || body.maxUsage === "") {
      updateData.maxUsage = null;
    } else {
      const mu = Number(body.maxUsage);
      if (!Number.isInteger(mu) || mu < 1) {
        throw new ApiError(400, "BAD_REQUEST", "maxUsage must be a positive integer");
      }
      updateData.maxUsage = mu;
    }
  }

  if (body.active !== undefined) {
    if (typeof body.active !== "boolean") {
      throw new ApiError(400, "BAD_REQUEST", "active must be a boolean");
    }
    updateData.active = body.active;
  }

  if (body.expiresAt !== undefined) {
    updateData.expiresAt = parseDate(body.expiresAt);
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "No valid fields to update");
  }

  const existingCoupon = await prisma.coupon.findFirst({ where: { id, tenantId } });
  if (!existingCoupon) throw new ApiError(404, "NOT_FOUND", "Coupon not found");

  const coupon = await prisma.coupon.update({
    where: { id },
    data: updateData,
  });

  return ok(req, coupon);
});

export const DELETE = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { tenantId } = await authenticateAdmin(req);

  const { id } = await params;
  const existingCoupon = await prisma.coupon.findFirst({ where: { id, tenantId } });
  if (!existingCoupon) throw new ApiError(404, "NOT_FOUND", "Coupon not found");

  await prisma.coupon.deleteMany({ where: { id, tenantId } });

  return ok(req, { success: true });
});
