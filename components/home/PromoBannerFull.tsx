import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function PromoBannerFull({
  locale,
  headline,
  subtext,
  ctaText,
}: {
  locale: Locale;
  headline: string;
  subtext: string;
  ctaText: string;
}) {
  return (
    <section className="py-6">
      <div className="mx-4">
        <Link
          href={`/${locale}`}
          className="block h-48 md:h-64 overflow-hidden rounded-2xl bg-gradient-to-br from-olive-600 to-olive-700 hover:from-olive-700 hover:to-olive-800 transition-all"
        >
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{headline}</h2>
            <p className="text-lg text-white/90">{subtext}</p>
          </div>
        </Link>
      </div>
    </section>
  );
}
