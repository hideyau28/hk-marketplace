import { ReactNode } from "react";
import { redirect } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";
import TopNav from "@/components/TopNav";
import BottomTab from "@/components/BottomTab";
import FloatingSearchPill from "@/components/FloatingSearchPill";

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
    <>
      <TopNav locale={l} t={t} />
      <main className="pb-16">{children}</main>
      <FloatingSearchPill />
      <BottomTab />
    </>
  );
}
