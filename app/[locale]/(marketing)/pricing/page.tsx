import PricingPage from "@/components/marketing/PricingPage";
import type { Locale } from "@/lib/i18n";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | WoWlix — IG Shop Builder",
  description:
    "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
  openGraph: {
    title: "Pricing | WoWlix — IG Shop Builder",
    description:
      "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
    url: "https://wowlix.com/en/pricing",
    siteName: "WoWlix",
    images: ["https://wowlix.com/og-default.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | WoWlix — IG Shop Builder",
    description:
      "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
    images: ["https://wowlix.com/og-default.png"],
  },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PricingPage locale={locale as Locale} />;
}
