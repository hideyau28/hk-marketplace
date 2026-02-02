import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import TopNav from "@/components/TopNav";
import BottomTab from "@/components/BottomTab";
import FloatingSearchPill from "@/components/FloatingSearchPill";
import WhatsAppButton from "@/components/WhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import WelcomePopup from "@/components/WelcomePopup";
import PromoBanner from "@/components/PromoBanner";

export default async function LocaleLayout({
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
    <>
      <PromoBanner />
      <TopNav locale={l} t={t} />
      {children}
      <FloatingSearchPill />
      <ScrollToTop />
      <WhatsAppButton />
      <BottomTab />
      <WelcomePopup />
    </>
  );
}
