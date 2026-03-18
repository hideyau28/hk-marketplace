import { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import TopNav from "@/components/TopNav";
import CategoryNavWrapper from "@/components/CategoryNavWrapper";
import BottomTab from "@/components/BottomTab";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/lib/currency";
import { ThemeProvider } from "@/lib/theme-context";
import { FilterProvider } from "@/lib/filter-context";
import { AuthProvider } from "@/lib/auth-context";
import Analytics from "@/components/Analytics";
import WelcomePopup from "@/components/WelcomePopup";
import CartFlyAnimation from "@/components/CartFlyAnimation";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import StorefrontTemplate from "@/components/StorefrontTemplate";
import { getServerTenantId, isPlatformMode } from "@/lib/tenant";

// Force dynamic rendering because we need headers() for tenant resolution
export const dynamic = "force-dynamic";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locale || locale === "undefined") {
    redirect("/zh-HK");
  }

  const l = locale as Locale;
  const t = getDict(l);

  // Platform bare domain (wowlix.com) → minimal layout, 冇 store chrome
  if (await isPlatformMode()) {
    return (
      <ThemeProvider>
        <main>{children}</main>
      </ThemeProvider>
    );
  }

  // Fetch tenant template + welcome popup settings (tenant-aware)
  const tenantId = await getServerTenantId();
  const [tenantRow, storeSettings] = await Promise.all([
    prisma.tenant
      .findUnique({
        where: { id: tenantId },
        select: {
          slug: true,
          region: true,
          templateId: true,
          hideBranding: true,
          plan: true,
          planExpiresAt: true,
          languages: true,
        },
      })
      .catch(() => null),
    prisma.storeSettings
      .findFirst({
        where: { tenantId },
      })
      .catch(() => null),
  ]);

  // Get store name with fallback
  const storeName = storeSettings?.storeName || "May's Shop";

  // Only Pro plan (not expired) with hideBranding enabled can hide branding
  const isPro =
    tenantRow?.plan === "pro" &&
    (!tenantRow?.planExpiresAt || tenantRow.planExpiresAt > new Date());
  const effectiveHideBranding = isPro && (tenantRow?.hideBranding ?? false);

  const isZh = l === "zh-HK";
  const welcomePopupConfig = {
    enabled: storeSettings?.welcomePopupEnabled ?? true,
    title:
      storeSettings?.welcomePopupTitle ||
      (isZh ? `歡迎來到 ${storeName}` : `Welcome to ${storeName}`),
    subtitle:
      storeSettings?.welcomePopupSubtitle ||
      (isZh
        ? "探索最新波鞋及運動裝備，正品保證！"
        : "Shop the latest sneakers and sports gear. 100% authentic!"),
    promoText:
      storeSettings?.welcomePopupPromoText ||
      (isZh
        ? "🎉 訂單滿 $600 免運費！"
        : "🎉 Free shipping on orders over $600!"),
    buttonText:
      storeSettings?.welcomePopupButtonText ||
      (isZh ? "開始購物" : "Start Shopping"),
  };

  return (
    <ThemeProvider>
      <StorefrontTemplate templateId={tenantRow?.templateId || "mochi"}>
        <CurrencyProvider>
          <FilterProvider>
            <AuthProvider>
              <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
                <Analytics />
                <AdminPreviewBanner locale={l} />
                <TopNav
                  locale={l}
                  t={t}
                  storeName={storeName}
                  languages={tenantRow?.languages}
                />
                <CategoryNavWrapper
                  locale={l}
                  tenantSlug={tenantRow?.slug ?? "maysshop"}
                />
                <main>{children}</main>
                <Footer
                  locale={l}
                  t={t}
                  storeName={storeName}
                  hideBranding={effectiveHideBranding}
                  whatsappNumber={storeSettings?.whatsappNumber}
                  instagramUrl={storeSettings?.instagramUrl}
                  region={tenantRow?.region}
                />
                <BottomTab t={t} />
                <WelcomePopup config={welcomePopupConfig} />
                <CartFlyAnimation />
              </div>
            </AuthProvider>
          </FilterProvider>
        </CurrencyProvider>
      </StorefrontTemplate>
    </ThemeProvider>
  );
}
