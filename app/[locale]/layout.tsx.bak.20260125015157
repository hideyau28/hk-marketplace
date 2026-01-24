import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const l = locale as Locale;
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
