import PricingPage from "@/components/marketing/PricingPage";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | WoWlix — IG Shop Builder",
  description:
    "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
  alternates: {
    canonical: "https://wowlix.com/pricing",
  },
  openGraph: {
    title: "全港最平 IG 網店方案 | WoWlix",
    description:
      "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
    url: "https://wowlix.com/pricing",
    siteName: "WoWlix",
    type: "website",
    images: [
      { url: "https://wowlix.com/og-default.png", width: 1200, height: 630 },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://wowlix.com/og-default.png"],
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PricingPage locale={locale as Locale} />;
}
