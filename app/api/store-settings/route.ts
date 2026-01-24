export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { ApiError, ok, withApi } from "@/lib/api/route-helpers";

// GET /api/store-settings
export const GET = withApi(async (req) => {
  // TODO: 保留你原本查詢邏輯（以下只係示例）
  const row = await prisma.storeSettings.findFirst().catch(() => null);

  return ok(req, row ?? null);
});

// PUT /api/store-settings
export const PUT = withApi(async (req) => {
  let body: any = null;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  // TODO: 保留你原本 update/upsert 邏輯（以下只係示例）
  const updated = await prisma.storeSettings.upsert({
    where: { id: body?.id ?? "default" },
    update: body ?? {},
    create: { id: body?.id ?? "default", ...(body ?? {}) },
  });

  return ok(req, updated);
}, { admin: false }); // 之後要鎖 admin：改 true + 設 ADMIN_SECRET
