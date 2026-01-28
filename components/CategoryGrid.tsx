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
      {/* Mobile: horizontal rail. Desktop: grid. */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/${locale}?category=${cat.id}`}
              className="group flex w-[132px] flex-col items-center gap-2 snap-start sm:w-auto"
            >
              <div className="w-full overflow-hidden rounded-2xl border-2 border-zinc-300 bg-zinc-50 shadow-sm transition-all duration-200 hover:border-[var(--primary)] hover:shadow-md hover:scale-[1.02] active:scale-[0.98]">
                <div className="relative aspect-square w-full">
                  <Image
                    src={cat.image}
                    alt={locale === "zh-HK" ? cat.labelZh : cat.labelEn}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 640px) 132px, 120px"
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-zinc-900 text-center transition-colors group-hover:text-[var(--primary)]">
                {locale === "zh-HK" ? cat.labelZh : cat.labelEn}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
