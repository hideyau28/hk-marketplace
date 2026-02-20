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
import SocialProofPopup from "@/components/SocialProofPopup";
import CartFlyAnimation from "@/components/CartFlyAnimation";
import AdminPreviewBanner from "@/components/AdminPreviewBanner";
import StorefrontTemplate from "@/components/StorefrontTemplate";
import { getServerTenantId, isPlatformMode } from "@/lib/tenant";

// Force dynamic rendering because we need headers() for tenant resolution
export const dynamic = 'force-dynamic';

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
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { templateId: true, hideBranding: true, plan: true, planExpiresAt: true, socialLinks: true },
    }).catch(() => null),
    prisma.storeSettings.findFirst({
      where: { tenantId },
    }).catch(() => null),
  ]);

  // Fetch products for social proof popup
  const socialProofProducts = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 }, deletedAt: null },
    select: { id: true, title: true },
    take: 50,
  }).catch(() => []);

  // Get store name with fallback
  const storeName = storeSettings?.storeName || "May's Shop";

  // Only Pro plan (not expired) with hideBranding enabled can hide branding
  const isPro = tenantRow?.plan === "pro" && (!tenantRow?.planExpiresAt || tenantRow.planExpiresAt > new Date());
  const effectiveHideBranding = isPro && (tenantRow?.hideBranding ?? false);

  // Social links from tenant, with type safety
  const socialLinks = Array.isArray(tenantRow?.socialLinks)
    ? (tenantRow.socialLinks as { platform: string; url: string }[])
    : [];

  // Check if WhatsApp is configured (in socialLinks or legacy field)
  const whatsappFromSocial = socialLinks.find((l) => l.platform === "whatsapp");
  const floatingWhatsapp = whatsappFromSocial?.url || storeSettings?.whatsappNumber || null;

  const welcomePopupConfig = {
    enabled: storeSettings?.welcomePopupEnabled ?? true,
    title: storeSettings?.welcomePopupTitle || `歡迎來到 ${storeName}`,
    subtitle: storeSettings?.welcomePopupSubtitle || "探索最新波鞋及運動裝備，正品保證！",
    promoText: storeSettings?.welcomePopupPromoText || "🎉 訂單滿 $600 免運費！",
    buttonText: storeSettings?.welcomePopupButtonText || "開始購物",
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
                <TopNav locale={l} t={t} storeName={storeName} />
                <CategoryNavWrapper locale={l} />
                <main>{children}</main>
                <Footer locale={l} t={t} storeName={storeName} hideBranding={effectiveHideBranding} socialLinks={socialLinks} whatsappNumber={storeSettings?.whatsappNumber} instagramUrl={storeSettings?.instagramUrl} />
                {/* Floating WhatsApp button — only if WhatsApp is configured */}
                {floatingWhatsapp && (
                  <a
                    href={`https://wa.me/${floatingWhatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition-transform"
                  >
                    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                      <path d="M16 2.4c-7.5 0-13.6 6.1-13.6 13.6 0 2.4.6 4.8 1.8 6.9L2 30l7.3-2.1c2 1.1 4.3 1.7 6.7 1.7 7.5 0 13.6-6.1 13.6-13.6S23.5 2.4 16 2.4zm7.9 19.1c-.3.9-1.5 1.6-2.5 1.8-.7.1-1.6.2-4.7-.9-4.2-1.5-6.8-5.2-7-5.5-.2-.3-1.7-2.2-1.7-4.2s1-3 1.3-3.4c.3-.4.7-.5 1-.5h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.4-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 1.9 2.4 1.3 1.2 2.5 1.6 2.9 1.8.4.2.6.2.8 0 .2-.2 1-1.1 1.3-1.5.3-.4.5-.3.9-.2.4.1 2.5 1.2 2.9 1.4.4.2.7.3.8.5.1.2.1.9-.2 1.8z" />
                    </svg>
                  </a>
                )}
                <BottomTab t={t} />
                <WelcomePopup config={welcomePopupConfig} />
                <SocialProofPopup products={socialProofProducts} />
                <CartFlyAnimation />
              </div>
            </AuthProvider>
          </FilterProvider>
        </CurrencyProvider>
      </StorefrontTemplate>
    </ThemeProvider>
  );
}
