export const runtime = "nodejs";

import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";

const ROUTE = "/api/store-settings";
const SETTINGS_SELECT = {
  id: true,
  storeName: true,
  storeNameEn: true,
  storeLogo: true,
  tagline: true,
  returnsPolicy: true,
  shippingPolicy: true,
  welcomePopupEnabled: true,
  welcomePopupTitle: true,
  welcomePopupSubtitle: true,
  welcomePopupPromoText: true,
  welcomePopupButtonText: true,
  whatsappNumber: true,
  instagramUrl: true,
  facebookUrl: true,
  openingHours: true,
  pickupHours: true,
  pickupAddress: true,
  pickupAddressZh: true,
  pickupAddressEn: true,
  shippingFee: true,
  freeShippingThreshold: true,
  homeDeliveryFee: true,
  homeDeliveryFreeAbove: true,
  homeDeliveryIslandExtra: true,
  sfLockerFee: true,
  sfLockerFreeAbove: true,
  createdAt: true,
  updatedAt: true,
} as const;

function stableStringify(input: unknown): string {
  const seen = new WeakSet<object>();

  const norm = (v: any): any => {
    if (v === null || v === undefined) return v;
    if (typeof v !== "object") return v;

    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(norm);

    const out: Record<string, any> = {};
    for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
    return out;
  };

  return JSON.stringify(norm(input));
}

function sha256(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

// GET /api/store-settings
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const row = await prisma.storeSettings.findFirst({
    where: { tenantId },
    select: SETTINGS_SELECT,
  }).catch(() => null);
  return ok(req, row ?? null, {
    headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
  });
}, { admin: true });

// PUT /api/store-settings (admin + idempotency)
export const PUT = withApi(
  async (req) => {
    // 1) parse body
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const tenantId = await getTenantId(req);

    // 2) require idempotency key
    const idemKey = (req.headers.get("x-idempotency-key") ?? "").trim();
    if (!idemKey) {
      throw new ApiError(400, "BAD_REQUEST", "Missing x-idempotency-key");
    }

    // 3) compute hash (route + method + canonical body)
    const requestHash = sha256(
      stableStringify({ route: ROUTE, method: "PUT", body })
    );

    // 4) check prior
    const existing = await prisma.idempotencyKey.findFirst({
      where: { key: idemKey, route: ROUTE, method: "PUT", tenantId },
    });

    if (existing) {
      if (existing.requestHash !== requestHash) {
        // same key but different payload => conflict
        throw new ApiError(409, "CONFLICT", "Idempotency key already used with different payload");
      }
      // replay => return stored response
      return ok(req, existing.responseJson);
    }

    // 5) first-time => do write
    const data = {
      storeName: body?.storeName,
      storeNameEn: body?.storeNameEn,
      storeLogo: body?.storeLogo,
      tagline: body?.tagline,
      returnsPolicy: body?.returnsPolicy,
      shippingPolicy: body?.shippingPolicy,
      welcomePopupEnabled: body?.welcomePopupEnabled,
      welcomePopupTitle: body?.welcomePopupTitle,
      welcomePopupSubtitle: body?.welcomePopupSubtitle,
      welcomePopupPromoText: body?.welcomePopupPromoText,
      welcomePopupButtonText: body?.welcomePopupButtonText,
      whatsappNumber: body?.whatsappNumber,
      instagramUrl: body?.instagramUrl,
      facebookUrl: body?.facebookUrl,
      openingHours: body?.openingHours,
      pickupHours: body?.pickupHours,
      pickupAddress: body?.pickupAddress,
      pickupAddressZh: body?.pickupAddressZh,
      pickupAddressEn: body?.pickupAddressEn,
      shippingFee: body?.shippingFee,
      freeShippingThreshold: body?.freeShippingThreshold,
      homeDeliveryFee: body?.homeDeliveryFee,
      homeDeliveryFreeAbove: body?.homeDeliveryFreeAbove,
      homeDeliveryIslandExtra: body?.homeDeliveryIslandExtra,
      sfLockerFee: body?.sfLockerFee,
      sfLockerFreeAbove: body?.sfLockerFreeAbove,
    };

    const existingSettings = await prisma.storeSettings.findFirst({
      where: { tenantId },
      select: { id: true },
    });

    const updated = existingSettings
      ? await prisma.storeSettings.update({
          where: { id: existingSettings.id },
          data,
          select: SETTINGS_SELECT,
        })
      : await prisma.storeSettings.create({
          data: { tenantId, ...data },
          select: SETTINGS_SELECT,
        });

    // 6) persist idempotency record
    await prisma.idempotencyKey.create({
      data: {
        key: idemKey,
        route: ROUTE,
        method: "PUT",
        tenantId,
        requestHash,
        status: 200,
        responseJson: updated as any,
      },
    });

    return ok(req, updated);
  },
  { admin: true } // 必須 header x-admin-secret
);
