import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const categories = [
  { id: "shoes", image: "/categories/shoes.svg", labelEn: "Shoes", labelZh: "球鞋" },
  { id: "tops", image: "/categories/tops.svg", labelEn: "Tops", labelZh: "上衣" },
  { id: "pants", image: "/categories/pants.svg", labelEn: "Pants", labelZh: "褲" },
  { id: "socks", image: "/categories/socks.svg", labelEn: "Socks", labelZh: "襪" },
  { id: "accessories", image: "/categories/accessories.svg", labelEn: "Accessories", labelZh: "配件" },
  { id: "protection", image: "/categories/protection.svg", labelEn: "Protection", labelZh: "護具" },
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
            className="flex flex-col items-center gap-2"
          >
            <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:bg-zinc-50 hover:border-[var(--primary)]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={cat.image}
                  alt={locale === "zh-HK" ? cat.labelZh : cat.labelEn}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 33vw, 120px"
                />
              </div>
            </div>
            <span className="text-sm text-zinc-800 text-center">
              {locale === "zh-HK" ? cat.labelZh : cat.labelEn}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
