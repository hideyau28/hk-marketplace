import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

type Props = { params: Promise<{ locale: string }> };

export default async function StartPage({ params }: Props) {
  const { locale } = await params;

  // Read the one-time Google onboarding email set by the OAuth callback.
  // Using httpOnly cookie avoids exposing the email in the redirect URL.
  const cookieStore = await cookies();
  const googleEmail = cookieStore.get("google_onboard_email")?.value || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <OnboardingWizard locale={locale as Locale} initialGoogleEmail={googleEmail} />
    </div>
  );
}
