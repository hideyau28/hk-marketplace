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

  // If new TenantPaymentConfig has records, use them
  if (configs.length > 0) {
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
  }

  // Fallback: query legacy PaymentMethod table + Tenant flags
  const [legacyMethods, tenant] = await Promise.all([
    prisma.paymentMethod.findMany({
      where: { tenantId, active: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.tenant.findUnique({
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
      },
    }),
  ]);

  const providers = [];

  // Legacy PaymentMethod records (type field maps to registry provider ID)
  for (const pm of legacyMethods) {
    const provider = getProvider(pm.type);
    if (!provider) continue;

    const safeConfig: Record<string, unknown> = {};
    if (pm.qrImage) safeConfig.qrCodeUrl = pm.qrImage;
    if (pm.accountInfo) safeConfig.accountId = pm.accountInfo;

    let instructions: string | undefined;
    if (provider.type === "manual") {
      try {
        const session = await provider.createSession({}, safeConfig);
        instructions = session.instructions;
      } catch {
        // no instructions
      }
    }

    providers.push({
      providerId: pm.type,
      displayName: pm.name,
      name: provider.name,
      nameZh: provider.nameZh,
      type: provider.type,
      icon: provider.icon,
      config: safeConfig,
      instructions,
    });
  }

  // If no legacy PaymentMethod records either, use Tenant flags as last resort
  if (providers.length === 0 && tenant) {
    if (tenant.fpsEnabled) {
      const fp = getProvider("fps");
      if (fp) {
        const cfg: Record<string, unknown> = {};
        if (tenant.fpsAccountName) cfg.accountName = tenant.fpsAccountName;
        if (tenant.fpsAccountId) cfg.accountId = tenant.fpsAccountId;
        if (tenant.fpsQrCodeUrl) cfg.qrCodeUrl = tenant.fpsQrCodeUrl;
        let instructions: string | undefined;
        try {
          const session = await fp.createSession({}, cfg);
          instructions = session.instructions;
        } catch { /* no instructions */ }
        providers.push({
          providerId: "fps",
          displayName: null,
          name: fp.name,
          nameZh: fp.nameZh,
          type: fp.type,
          icon: fp.icon,
          config: cfg,
          instructions,
        });
      }
    }
    if (tenant.paymeEnabled) {
      const pm = getProvider("payme");
      if (pm) {
        const cfg: Record<string, unknown> = {};
        if (tenant.paymeLink) cfg.paymeLink = tenant.paymeLink;
        if (tenant.paymeQrCodeUrl) cfg.qrCodeUrl = tenant.paymeQrCodeUrl;
        let instructions: string | undefined;
        try {
          const session = await pm.createSession({}, cfg);
          instructions = session.instructions;
        } catch { /* no instructions */ }
        providers.push({
          providerId: "payme",
          displayName: null,
          name: pm.name,
          nameZh: pm.nameZh,
          type: pm.type,
          icon: pm.icon,
          config: cfg,
          instructions,
        });
      }
    }
    if (tenant.stripeOnboarded && tenant.stripeAccountId) {
      const sp = getProvider("stripe");
      if (sp) {
        providers.push({
          providerId: "stripe",
          displayName: null,
          name: sp.name,
          nameZh: sp.nameZh,
          type: sp.type,
          icon: sp.icon,
          config: {},
          instructions: undefined,
        });
      }
    }
  }

  return ok(req, { providers });
});
