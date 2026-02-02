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
import Analytics from "@/components/Analytics";
import WelcomePopup from "@/components/WelcomePopup";
import SocialProofPopup from "@/components/SocialProofPopup";

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

  // Fetch welcome popup settings
  const storeSettings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  }).catch(() => null);

  // Fetch products for social proof popup
  const socialProofProducts = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    select: { id: true, title: true },
    take: 50,
  }).catch(() => []);

  const welcomePopupConfig = {
    enabled: storeSettings?.welcomePopupEnabled ?? true,
    title: storeSettings?.welcomePopupTitle || "歡迎來到 HK•Market",
    subtitle: storeSettings?.welcomePopupSubtitle || "探索最新波鞋及運動裝備，正品保證！",
    promoText: storeSettings?.welcomePopupPromoText || "🎉 訂單滿 $600 免運費！",
    buttonText: storeSettings?.welcomePopupButtonText || "開始購物",
  };

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <Analytics />
          <TopNav locale={l} t={t} />
          <CategoryNavWrapper locale={l} />
          <main>{children}</main>
          <Footer locale={l} t={t} />
          <BottomTab t={t} />
          <WelcomePopup config={welcomePopupConfig} />
          <SocialProofPopup products={socialProofProducts} />
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
