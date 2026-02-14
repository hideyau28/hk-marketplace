import PricingPage from "@/components/marketing/PricingPage";
import type { Locale } from "@/lib/i18n";

export const metadata = {
  title: "Pricing | WoWlix — IG Shop Builder",
  description:
    "0% platform fee, $0 to start. Free / Lite $78 / Pro $198 plans for IG shops.",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <PricingPage locale={locale as Locale} />;
}
