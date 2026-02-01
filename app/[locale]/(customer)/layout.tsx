import { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import TopNav from "@/components/TopNav";
import BottomTab from "@/components/BottomTab";
import FloatingSearchPill from "@/components/FloatingSearchPill";
import Footer from "@/components/Footer";
import { CurrencyProvider } from "@/lib/currency";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ThemeProvider } from "@/lib/theme-context";
import Analytics from "@/components/Analytics";
import PushNotificationBanner from "@/components/PushNotificationBanner";

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

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
          <Analytics />
          <TopNav locale={l} t={t} />
          <main className="pb-24">{children}</main>
          <Footer locale={l} t={t} />
          <FloatingSearchPill t={t} />
          <BottomTab t={t} />
          <PushNotificationBanner t={t} />
          <WhatsAppButton t={t} />
        </div>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
