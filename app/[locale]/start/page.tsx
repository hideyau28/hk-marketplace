"use client";

import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

export default function StartPage() {
  const params = useParams();
  const locale = ((params?.locale as string) || "en") as Locale;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <OnboardingWizard locale={locale} />
    </div>
  );
}
