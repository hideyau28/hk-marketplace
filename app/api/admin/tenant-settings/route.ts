export const runtime = "nodejs";

import { ok, fail, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/tenant-settings
// 讀取 tenant 嘅 payment / delivery / social 設定
export async function GET(req: Request) {
  try {
    const { tenantId } = await authenticateAdmin(req);

    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: {
        fpsEnabled: true,
        fpsAccountName: true,
        fpsAccountId: true,
        fpsQrCodeUrl: true,
        paymeEnabled: true,
        paymeLink: true,
        paymeQrCodeUrl: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        socialLinks: true,
        deliveryOptions: true,
      },
    });

    return ok(req, {
      fpsEnabled: tenant.fpsEnabled,
      fpsAccountName: tenant.fpsAccountName,
      fpsAccountId: tenant.fpsAccountId,
      fpsQrCodeUrl: tenant.fpsQrCodeUrl,
      paymeEnabled: tenant.paymeEnabled,
      paymeLink: tenant.paymeLink,
      paymeQrCodeUrl: tenant.paymeQrCodeUrl,
      stripeAccountId: tenant.stripeAccountId,
      stripeOnboarded: tenant.stripeOnboarded,
      socialLinks: tenant.socialLinks ?? [],
      deliveryOptions: tenant.deliveryOptions ?? [
        { id: "sf-locker", label: "SF 智能櫃", price: 0, note: "免運費", enabled: true },
        { id: "sf-cod", label: "順豐到付", price: 0, note: "到付運費", enabled: true },
        { id: "meetup", label: "面交", price: 0, note: "地點待確認", enabled: true },
      ],
    });
  } catch (e) {
    return fail(req, e);
  }
}

// PUT /api/admin/tenant-settings
// 更新 tenant 嘅 payment / delivery / social 設定
export async function PUT(req: Request) {
  try {
    const { tenantId } = await authenticateAdmin(req);

    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    // Build update data — only include fields that are present
    const updateData: Record<string, unknown> = {};

    // Payment fields
    if (typeof body.fpsEnabled === "boolean") updateData.fpsEnabled = body.fpsEnabled;
    if (body.fpsAccountName !== undefined) updateData.fpsAccountName = body.fpsAccountName || null;
    if (body.fpsAccountId !== undefined) updateData.fpsAccountId = body.fpsAccountId || null;
    if (body.fpsQrCodeUrl !== undefined) updateData.fpsQrCodeUrl = body.fpsQrCodeUrl || null;
    if (typeof body.paymeEnabled === "boolean") updateData.paymeEnabled = body.paymeEnabled;
    if (body.paymeLink !== undefined) updateData.paymeLink = body.paymeLink || null;
    if (body.paymeQrCodeUrl !== undefined) updateData.paymeQrCodeUrl = body.paymeQrCodeUrl || null;

    // Social links — validate array of { url: string }
    if (body.socialLinks !== undefined) {
      if (!Array.isArray(body.socialLinks)) {
        throw new ApiError(400, "BAD_REQUEST", "socialLinks must be an array");
      }
      const validLinks = body.socialLinks
        .filter((l: any) => l && typeof l.url === "string" && l.url.trim())
        .map((l: any) => ({ url: l.url.trim() }));
      updateData.socialLinks = validLinks;
    }

    // Delivery options — validate array
    if (body.deliveryOptions !== undefined) {
      if (!Array.isArray(body.deliveryOptions)) {
        throw new ApiError(400, "BAD_REQUEST", "deliveryOptions must be an array");
      }
      const validOptions = body.deliveryOptions.map((d: any, i: number) => ({
        id: d.id || `custom-${i}`,
        label: String(d.label || ""),
        price: Number(d.price) || 0,
        note: String(d.note || ""),
        enabled: d.enabled !== false,
      }));
      updateData.deliveryOptions = validOptions;
    }

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      select: {
        fpsEnabled: true,
        fpsAccountName: true,
        fpsAccountId: true,
        fpsQrCodeUrl: true,
        paymeEnabled: true,
        paymeLink: true,
        paymeQrCodeUrl: true,
        socialLinks: true,
        deliveryOptions: true,
      },
    });

    return ok(req, {
      ...updated,
      socialLinks: updated.socialLinks ?? [],
      deliveryOptions: updated.deliveryOptions ?? [],
    });
  } catch (e) {
    return fail(req, e);
  }
}
