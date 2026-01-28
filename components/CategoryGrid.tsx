import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const categories = [
  { id: "electronics", icon: "📱", labelEn: "Electronics", labelZh: "電子產品" },
  { id: "fashion", icon: "👕", labelEn: "Fashion", labelZh: "時裝" },
  { id: "home", icon: "🏠", labelEn: "Home", labelZh: "家居" },
  { id: "beauty", icon: "💄", labelEn: "Beauty", labelZh: "美妝" },
  { id: "sports", icon: "⚽", labelEn: "Sports", labelZh: "運動" },
  { id: "food", icon: "🍜", labelEn: "Food", labelZh: "食品" },
];

export default function CategoryGrid({ locale, title }: { locale: Locale; title: string }) {
  return (
    <section className="mt-12 px-4">
      <h2 className="text-zinc-900 text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/${locale}?category=${cat.id}`}
            className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-4 hover:border-[#4a5d23] hover:bg-zinc-50 transition"
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-sm text-zinc-700 text-center">
              {locale === "zh-HK" ? cat.labelZh : cat.labelEn}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
