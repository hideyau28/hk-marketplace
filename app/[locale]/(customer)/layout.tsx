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
    <CurrencyProvider>
      <TopNav locale={l} t={t} />
      <main className="pb-16">{children}</main>
      <Footer locale={l} />
      <FloatingSearchPill />
      <BottomTab />
      <WhatsAppButton />
    </CurrencyProvider>
  );
}
