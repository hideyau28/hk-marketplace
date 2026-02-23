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

  // Merge TenantPaymentConfig + PaymentMethod — 兩個 source 合併，唔好只取一個
  // TenantPaymentConfig 優先，PaymentMethod 補上未覆蓋嘅 provider
  const [configs, methods, tenant] = await Promise.all([
    prisma.tenantPaymentConfig.findMany({
      where: { tenantId, enabled: true },
      orderBy: { sortOrder: "asc" },
    }).catch(() => [] as Array<{ providerId: string; displayName: string | null; config: unknown; sortOrder: number }>),
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
    nameZh: string;
    type: string;
    icon: string;
    config: Record<string, unknown>;
    instructions?: string;
  }> = [];
  const seenIds = new Set<string>();

  // Build PaymentMethod lookup map — 用嚟補充 TenantPaymentConfig 缺少嘅欄位
  const pmByProviderId = new Map<string, (typeof methods)[number]>();
  for (const pm of methods) {
    const pid = LEGACY_TYPE_MAP[pm.type] || pm.type;
    pmByProviderId.set(pid, pm);
  }

  // 1. TenantPaymentConfig records (highest priority)
  // 當 config 空白時，從 PaymentMethod 補上實際收款資料
  for (const cfg of configs) {
    const provider = getProvider(cfg.providerId);
    if (!provider) continue;

    const safeConfig: Record<string, unknown> = cfg.config && typeof cfg.config === "object" ? { ...(cfg.config as Record<string, unknown>) } : {};

    // 從 PaymentMethod 補上 TenantPaymentConfig 缺少嘅欄位
    const legacyPm = pmByProviderId.get(cfg.providerId);
    if (legacyPm) {
      if (!safeConfig.qrCodeUrl && (legacyPm.qrCodeUrl || legacyPm.qrImage)) {
        safeConfig.qrCodeUrl = legacyPm.qrCodeUrl || legacyPm.qrImage;
      }
      if (!safeConfig.accountName && legacyPm.accountName) {
        safeConfig.accountName = legacyPm.accountName;
      }
      if (!safeConfig.accountNumber && legacyPm.accountNumber) {
        safeConfig.accountNumber = legacyPm.accountNumber;
      }
      if (!safeConfig.accountId && !safeConfig.accountNumber && legacyPm.accountInfo) {
        safeConfig.accountId = legacyPm.accountInfo;
      }
      if (!safeConfig.bankName && legacyPm.bankName) {
        safeConfig.bankName = legacyPm.bankName;
      }
      if (!safeConfig.paymeLink && legacyPm.paymentLink) {
        safeConfig.paymeLink = legacyPm.paymentLink;
      }
    }

    // 優先用商戶自訂指引
    let instructions: string | undefined = legacyPm?.instructions ?? undefined;
    if (!instructions && provider.type === "manual") {
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
    seenIds.add(cfg.providerId);
  }

  // 2. PaymentMethod records — 補上 TenantPaymentConfig 未覆蓋嘅 provider
  for (const pm of methods) {
    const providerId = LEGACY_TYPE_MAP[pm.type] || pm.type;
    if (seenIds.has(providerId)) continue; // TenantPaymentConfig 已有，跳過

    const provider = getProvider(providerId);
    if (!provider) continue;

    const safeConfig: Record<string, unknown> = {};
    // 新版結構化欄位優先，舊版 legacy 欄位作後備
    if (pm.qrCodeUrl) safeConfig.qrCodeUrl = pm.qrCodeUrl;
    else if (pm.qrImage) safeConfig.qrCodeUrl = pm.qrImage;
    if (pm.accountName) safeConfig.accountName = pm.accountName;
    if (pm.accountNumber) safeConfig.accountNumber = pm.accountNumber;
    if (pm.bankName) safeConfig.bankName = pm.bankName;
    if (pm.paymentLink) safeConfig.paymeLink = pm.paymentLink;
    // legacy accountInfo fallback for accountId
    if (pm.accountInfo && !safeConfig.accountNumber) safeConfig.accountId = pm.accountInfo;

    // 優先用商戶自訂指引，否則嘗試 provider 自動生成
    let instructions: string | undefined = pm.instructions ?? undefined;
    if (!instructions && provider.type === "manual") {
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
    seenIds.add(providerId);
  }

  // 3. Tenant flags as final fallback — 只補上仲未出現嘅 provider
  if (tenant) {
    if (tenant.fpsEnabled && !seenIds.has("fps")) {
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
        seenIds.add("fps");
      }
    }
    if (tenant.paymeEnabled && !seenIds.has("payme")) {
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
        seenIds.add("payme");
      }
    }
    if (tenant.stripeOnboarded && tenant.stripeAccountId && !seenIds.has("stripe")) {
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
        seenIds.add("stripe");
      }
    }
  }

  return ok(req, { providers });
});
