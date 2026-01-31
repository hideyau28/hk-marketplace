import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Shirt, PersonStanding, Footprints, Snowflake, Watch } from "lucide-react";

const categories = [
  { name: "Tops", slug: "tops", icon: Shirt },
  { name: "Pants", slug: "pants", icon: PersonStanding },
  { name: "Shoes", slug: "shoes", icon: Footprints },
  { name: "Socks", slug: "socks", icon: Footprints },
  { name: "Jackets", slug: "jackets", icon: Snowflake },
  { name: "Accessories", slug: "accessories", icon: Watch },
];

export default function CategoryGrid({ locale, title }: { locale: Locale; title: string }) {
  return (
    <section className="mt-12 px-4">
      <h2 className="text-zinc-900 text-lg font-semibold mb-4">{title}</h2>
      {/* Mobile: horizontal rail. Desktop: grid. */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
            <Link
              key={cat.slug}
              href={`/${locale}/collections?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-zinc-200 hover:border-olive-600 hover:shadow-sm transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                <Icon size={24} className="text-zinc-600" />
              </div>
              <span className="text-sm text-zinc-900 font-medium">{cat.name}</span>
            </Link>
          );})}
        </div>
      </div>
    </section>
  );
}
