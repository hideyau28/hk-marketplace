import PricingPage from "@/components/marketing/PricingPage";
import type { Locale } from "@/lib/i18n";

export const metadata = {
  title: "WoWlix 定價 — 免費開始，隨時升級",
  description:
    "0% 平台費，$0 開始。Free / Lite $78 / Pro $198 計劃，專為 IG 小店而設。",
  openGraph: {
    title: "WoWlix 定價 — 免費開始，隨時升級",
    description: "0% 平台費，$0 開始。Free / Lite $78 / Pro $198 計劃，專為 IG 小店而設。",
    url: "https://wowlix.com/en/pricing",
    siteName: "WoWlix",
    type: "website",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "WoWlix 定價 — 免費開始，隨時升級",
    description: "0% 平台費，$0 開始。Free / Lite $78 / Pro $198 計劃。",
  },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PricingPage locale={locale as Locale} />;
}
