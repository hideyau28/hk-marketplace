export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { getAllProviders } from "@/lib/payments/registry";

// GET /api/admin/payment-config
// 返回所有 provider definition + 商戶嘅 enabled 狀態同 config
export const GET = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  const allProviders = getAllProviders();

  const tenantConfigs = await prisma.tenantPaymentConfig.findMany({
    where: { tenantId },
  });

  // 用 providerId 做 key 方便 lookup
  const configMap = new Map(
    tenantConfigs.map((c: any) => [c.providerId, c])
  );

  const merged = allProviders.map((provider) => {
    const tenantConfig = configMap.get(provider.id);
    return {
      providerId: provider.id,
      name: provider.name,
      nameZh: provider.nameZh,
      icon: provider.icon,
      type: provider.type,
      configFields: provider.configFields,
      // 商戶設定
      enabled: tenantConfig?.enabled ?? false,
      config: tenantConfig?.config ?? {},
      displayName: tenantConfig?.displayName ?? null,
      sortOrder: tenantConfig?.sortOrder ?? 0,
    };
  });

  return ok(req, merged);
});
