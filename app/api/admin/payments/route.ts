export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { getAllProviders, getProvider } from "@/lib/payments/registry";

// GET /api/admin/payments
// 返回所有 provider definition + 商戶嘅 PaymentMethod records
export const GET = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  const allProviders = getAllProviders();

  const existingMethods = await prisma.paymentMethod.findMany({
    where: { tenantId },
  });

  // type → PaymentMethod record
  const methodMap = new Map(
    existingMethods.map((m: any) => [m.type, m])
  );

  const merged = allProviders.map((provider) => {
    const existing = methodMap.get(provider.id);
    let config: Record<string, string> = {};

    if (existing) {
      // accountInfo 存 JSON，parse 返做 config object
      try {
        config = existing.accountInfo ? JSON.parse(existing.accountInfo) : {};
      } catch {
        config = {};
      }
      // qrImage 獨立存，sync 返入 config
      if (existing.qrImage && !config.qrCodeUrl) {
        config.qrCodeUrl = existing.qrImage;
      }
    }

    return {
      providerId: provider.id,
      name: provider.name,
      nameZh: provider.nameZh,
      icon: provider.icon,
      type: provider.type,
      configFields: provider.configFields,
      enabled: existing?.active ?? false,
      config,
    };
  });

  return ok(req, merged);
});

// PUT /api/admin/payments — 批量更新
export const PUT = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);
  const body = await req.json();

  const { methods } = body;

  if (!Array.isArray(methods)) {
    throw new ApiError(400, "BAD_REQUEST", "methods must be an array");
  }

  const results = [];

  for (const method of methods) {
    const { providerId, enabled, config } = method;
    const provider = getProvider(providerId);
    if (!provider) continue;

    if (enabled) {
      // Validate required fields
      for (const field of provider.configFields) {
        if (field.required && !config?.[field.key]) {
          throw new ApiError(
            400,
            "BAD_REQUEST",
            `${provider.nameZh}: 必填欄位「${field.labelZh}」未填寫`
          );
        }
      }

      const qrImage = config?.qrCodeUrl || null;
      const accountInfo = JSON.stringify(config || {});

      const result = await prisma.paymentMethod.upsert({
        where: { tenantId_type: { tenantId, type: providerId } },
        update: {
          name: provider.nameZh,
          qrImage,
          accountInfo,
          active: true,
          tenantId,
        },
        create: {
          name: provider.nameZh,
          type: providerId,
          qrImage,
          accountInfo,
          active: true,
          sortOrder: 0,
          tenantId,
        },
      });
      results.push(result);
    } else {
      // 停用：如果 record 存在就 set active = false
      const existing = await prisma.paymentMethod.findUnique({
        where: { tenantId_type: { tenantId, type: providerId } },
      });
      if (existing) {
        const result = await prisma.paymentMethod.update({
          where: { tenantId_type: { tenantId, type: providerId } },
          data: { active: false },
        });
        results.push(result);
      }
    }
  }

  return ok(req, results);
});
