import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const categories = [
  { id: "shoes", icon: "👟", labelEn: "Shoes", labelZh: "球鞋" },
  { id: "tops", icon: "👕", labelEn: "Tops", labelZh: "上衣" },
  { id: "pants", icon: "👖", labelEn: "Pants", labelZh: "褲" },
  { id: "socks", icon: "🧦", labelEn: "Socks", labelZh: "襪" },
  { id: "accessories", icon: "🎒", labelEn: "Accessories", labelZh: "配件" },
  { id: "protection", icon: "🦵", labelEn: "Protection", labelZh: "護具" },
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
