import { ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { getProvider } from "@/lib/payments/registry";

// PaymentMethod.type → registry provider ID mapping
const LEGACY_TYPE_MAP: Record<string, string> = {
  alipay: "alipay_hk",
};

// GET /api/payment-config — public endpoint for enabled payment providers
export const GET = withApi(async (req) => {
  let tenantId: string | null = null;

  // Query param override — biolink checkout passes ?tenant=<slug>
  const url = new URL(req.url);
  const tenantParam = url.searchParams.get("tenant");
  if (tenantParam) {
    const t = await prisma.tenant.findUnique({
      where: { slug: tenantParam },
      select: { id: true },
    });
    if (t) tenantId = t.id;
  }

  if (!tenantId) {
    tenantId = await getTenantId(req);
  }

  // Query TenantPaymentConfig (primary), then PaymentMethod + Tenant flags (fallback)
  const configs = await prisma.tenantPaymentConfig.findMany({
    where: { tenantId, enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  if (configs.length > 0) {
    const providers = [];
    for (const cfg of configs) {
      const provider = getProvider(cfg.providerId);
      if (!provider) continue;

      const safeConfig: Record<string, unknown> = cfg.config && typeof cfg.config === "object" ? { ...(cfg.config as Record<string, unknown>) } : {};

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
        providerId: cfg.providerId,
        displayName: cfg.displayName,
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

  // Fallback: Query PaymentMethod (primary) and Tenant flags (fallback)
  const [methods, tenant] = await Promise.all([
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

  // 1. PaymentMethod records (primary source)
  if (methods.length > 0) {
    for (const pm of methods) {
      const providerId = LEGACY_TYPE_MAP[pm.type] || pm.type;
      const provider = getProvider(providerId);
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
        providerId,
        displayName: pm.name,
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

  // 2. Tenant flags as fallback
  if (tenant) {
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
