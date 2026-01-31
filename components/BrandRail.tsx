import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const brands = [
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Puma", slug: "puma" },
  { name: "Under Armour", slug: "under-armour" },
  { name: "New Balance", slug: "new-balance" },
  { name: "The North Face", slug: "the-north-face" },
  { name: "Columbia", slug: "columbia" },
  { name: "ASICS", slug: "asics" },
];

export default function BrandRail({
  locale,
  title,
  seeAllText,
}: {
  locale: Locale;
  title: string;
  seeAllText: string;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between px-4">
        <h2 className="text-zinc-900 text-lg font-semibold">{title}</h2>
        <Link
          href={`/${locale}?brands=all`}
          className="text-sm text-[#4a5d23] hover:text-[#3a4a1c] font-medium"
        >
          {seeAllText}
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={`/${locale}/search?brand=${brand.slug}`}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-16 h-16 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-xl font-bold text-zinc-900 hover:border-olive-600 hover:text-olive-600 transition-colors">
              {brand.name.charAt(0)}
            </div>
            <span className="text-xs text-zinc-600 text-center">{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
