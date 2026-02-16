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

  // Query TenantPaymentConfig (new system), PaymentMethod (legacy), and Tenant flags
  const [tenantConfigs, legacyMethods, tenant] = await Promise.all([
    prisma.tenantPaymentConfig.findMany({
      where: { tenantId, enabled: true },
      orderBy: { sortOrder: "asc" },
    }),
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

  const providers: Array<{
    providerId: string;
    displayName: string | null;
    name: string;
    nameZh?: string;
    type: string;
    icon?: string;
    config: Record<string, unknown>;
    instructions?: string;
  }> = [];
  // Track which provider IDs have been added to avoid duplicates.
  // Tiers are additive: TenantPaymentConfig > PaymentMethod > Tenant flags.
  // Previously tiers were exclusive, so an incomplete TenantPaymentConfig
  // (e.g. only FPS) would suppress legacy PayMe / AlipayHK records.
  const seen = new Set<string>();

  // 1. TenantPaymentConfig records (new system — full config JSON)
  for (const tc of tenantConfigs) {
    const provider = getProvider(tc.providerId);
    if (!provider) continue;

    const config = (tc.config as Record<string, unknown>) || {};

    let instructions: string | undefined;
    if (provider.type === "manual") {
      try {
        const session = await provider.createSession({}, config);
        instructions = session.instructions;
      } catch {
        // no instructions
      }
    }

    providers.push({
      providerId: tc.providerId,
      displayName: tc.displayName,
      name: provider.name,
      nameZh: provider.nameZh,
      type: provider.type,
      icon: provider.icon,
      config,
      instructions,
    });
    seen.add(tc.providerId);
  }

  // 2. Legacy PaymentMethod records — fill in any providers not already in tier 1
  for (const pm of legacyMethods) {
    const providerId = LEGACY_TYPE_MAP[pm.type] || pm.type;
    if (seen.has(providerId)) continue;

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
    seen.add(providerId);
  }

  // 3. Tenant flags — fill in any providers not already covered above
  if (tenant) {
    if (tenant.fpsEnabled && !seen.has("fps")) {
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
        seen.add("fps");
      }
    }
    if (tenant.paymeEnabled && !seen.has("payme")) {
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
        seen.add("payme");
      }
    }
    if (tenant.stripeOnboarded && tenant.stripeAccountId && !seen.has("stripe")) {
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
        seen.add("stripe");
      }
    }
  }

  return ok(req, { providers });
});
