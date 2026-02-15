export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { getTenantId } from "@/lib/tenant";

/**
 * POST /api/checkout-draft
 * 儲存 checkout 草稿（onUnload / timer 自動儲存）
 */
export const POST = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const body = await req.json();

  const { sessionId, customerName, phone, email, items, amounts, formData } = body;

  if (!sessionId || !items) {
    throw new ApiError(400, "BAD_REQUEST", "sessionId and items are required");
  }

  const draft = await prisma.checkoutDraft.upsert({
    where: {
      tenantId_sessionId: { tenantId, sessionId },
    },
    create: {
      tenantId,
      sessionId,
      customerName: customerName || null,
      phone: phone || null,
      email: email || null,
      items,
      amounts: amounts || null,
      formData: formData || null,
    },
    update: {
      customerName: customerName || null,
      phone: phone || null,
      email: email || null,
      items,
      amounts: amounts || null,
      formData: formData || null,
    },
  });

  return ok(req, { id: draft.id });
});

/**
 * DELETE /api/checkout-draft
 * 訂單成功後刪除草稿
 */
export const DELETE = withApi(async (req) => {
  const tenantId = await getTenantId(req);
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("sessionId");

  if (!sessionId) {
    throw new ApiError(400, "BAD_REQUEST", "sessionId is required");
  }

  await prisma.checkoutDraft.deleteMany({
    where: { tenantId, sessionId },
  });

  return ok(req, { deleted: true });
});
