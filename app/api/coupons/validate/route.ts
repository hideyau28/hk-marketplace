export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { hasFeature } from "@/lib/plan";

type Body = {
  code?: string;
  subtotal?: number;
  deliveryFee?: number;
};

function assertPositiveNumber(value: unknown, field: string) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new ApiError(400, "BAD_REQUEST", `${field} must be a non-negative number`);
  }
}

export const POST = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  // Plan gating: coupon feature requires lite+ plan
  const allowed = await hasFeature(tenantId, "coupon");
  if (!allowed) {
    throw new ApiError(403, "FORBIDDEN", "Coupon feature is not available on your current plan");
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const rawCode = (body.code || "").trim().toUpperCase();
  if (!rawCode) {
    throw new ApiError(400, "BAD_REQUEST", "code is required");
  }

  assertPositiveNumber(body.subtotal, "subtotal");
  if (body.deliveryFee !== undefined) {
    assertPositiveNumber(body.deliveryFee, "deliveryFee");
  }

  const subtotal = body.subtotal ?? 0;
  const deliveryFee = body.deliveryFee ?? 0;

  const coupon = await prisma.coupon.findFirst({
    where: { code: rawCode, tenantId },
  });

  if (!coupon || !coupon.active) {
    throw new ApiError(404, "NOT_FOUND", "Coupon not found");
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "BAD_REQUEST", "Coupon expired");
  }

  // Check usage limit
  if (coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage) {
    throw new ApiError(400, "BAD_REQUEST", "Coupon usage limit reached");
  }

  if (coupon.minOrder !== null && coupon.minOrder !== undefined) {
    if (subtotal < coupon.minOrder) {
      throw new ApiError(400, "BAD_REQUEST", `Minimum order HK$${coupon.minOrder} required`);
    }
  }

  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = subtotal * (coupon.discountValue / 100);
  } else {
    if (coupon.code.toUpperCase() === "FREESHIP") {
      discount = Math.min(deliveryFee, coupon.discountValue);
    } else {
      discount = coupon.discountValue;
    }
  }

  const maxDiscount = subtotal + deliveryFee;
  if (discount > maxDiscount) discount = maxDiscount;

  return ok(req, {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrder: coupon.minOrder,
    discount,
  });
});
