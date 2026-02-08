import { ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { getProvider } from "@/lib/payments/registry";

// Config keys safe to expose to customers (no secrets)
const SAFE_CONFIG_KEYS = new Set([
  "qrCodeUrl",
  "accountName",
  "accountId",
  "accountNumber",
  "bankName",
  "paymeLink",
  "paypalEmail",
]);

// GET /api/payment-config — public endpoint for enabled payment providers
export const GET = withApi(async (req) => {
  const tenantId = await getTenantId(req);

  const configs = await prisma.tenantPaymentConfig.findMany({
    where: { tenantId, enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const providers = [];

  for (const cfg of configs) {
    const provider = getProvider(cfg.providerId);
    if (!provider) continue;

    // Extract only safe config fields for customer display
    const rawConfig = (cfg.config as Record<string, unknown>) || {};
    const safeConfig: Record<string, unknown> = {};
    for (const key of SAFE_CONFIG_KEYS) {
      if (rawConfig[key] !== undefined) {
        safeConfig[key] = rawConfig[key];
      }
    }

    // Get instructions from provider's createSession (manual providers)
    let instructions: string | undefined;
    if (provider.type === "manual") {
      try {
        const session = await provider.createSession({}, rawConfig);
        instructions = session.instructions;
      } catch {
        // Fallback — no instructions
      }
    }

    providers.push({
      providerId: cfg.providerId,
      displayName: cfg.displayName || null,
      name: provider.name,
      nameZh: provider.nameZh,
      type: provider.type,
      icon: provider.icon,
      config: safeConfig,
      instructions,
    });
  }

  return ok(req, { providers });
});
