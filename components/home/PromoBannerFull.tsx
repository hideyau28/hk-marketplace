import type { Locale } from "@/lib/i18n";
import Link from "next/link";

export default function PromoBannerFull({
  locale,
  headline,
  subtext,
  imageUrl,
  linkUrl,
}: {
  locale: Locale;
  headline: string;
  subtext: string;
  ctaText?: string;
  imageUrl?: string;
  linkUrl?: string | null;
}) {
  const href = linkUrl
    ? linkUrl.startsWith("/")
      ? `/${locale}${linkUrl}`
      : linkUrl
    : null;

  const content = (
    <div
      className="h-48 md:h-64 overflow-hidden rounded-2xl relative"
      style={
        imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      )}

      {!imageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-olive-600 to-olive-700" />
      )}

      <div className="relative h-full flex flex-col items-center justify-center p-6 text-center z-10">
        {headline && (
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
            {headline}
          </h2>
        )}
        {subtext && (
          <p className="text-lg text-white/90 drop-shadow-md">{subtext}</p>
        )}
      </div>
    </div>
  );

  return (
    <section className="py-6">
      <div className="mx-4">
        {href ? (
          <Link href={href} className="block">
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
    </section>
  );
}
