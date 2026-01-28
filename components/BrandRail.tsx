import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const brands = [
  { id: "apple", name: "Apple", logo: "🍎" },
  { id: "samsung", name: "Samsung", logo: "📱" },
  { id: "sony", name: "Sony", logo: "🎮" },
  { id: "nike", name: "Nike", logo: "👟" },
  { id: "adidas", name: "Adidas", logo: "⚽" },
  { id: "muji", name: "MUJI", logo: "🏠" },
  { id: "uniqlo", name: "Uniqlo", logo: "👕" },
  { id: "dyson", name: "Dyson", logo: "🌀" },
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
            key={brand.id}
            href={`/${locale}?brand=${brand.id}`}
            className="flex flex-col items-center gap-2 min-w-[80px]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-zinc-200 bg-white text-2xl hover:border-[#4a5d23] transition">
              {brand.logo}
            </div>
            <span className="text-xs text-zinc-600 text-center">{brand.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
