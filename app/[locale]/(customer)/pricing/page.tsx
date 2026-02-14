import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";
import PricingPage from "@/components/marketing/PricingPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh-HK";
  return {
    title: isZh
      ? "定價方案 — WoWlix | 0% 平台抽成"
      : "Pricing — WoWlix | 0% Platform Commission",
    description: isZh
      ? "WoWlix 定價簡單透明。$0 起步、0% 平台抽成。Free / Lite $78 / Pro $198。"
      : "WoWlix pricing is simple and transparent. From $0, 0% platform commission. Free / Lite $78 / Pro $198.",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PricingPage locale={locale as Locale} />;
}
