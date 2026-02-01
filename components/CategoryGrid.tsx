import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { Shirt, Activity, Footprints, CircleDot, Layers, Watch } from "lucide-react";

const categories = [
  { name: "Tops", slug: "Tops", icon: Shirt },
  { name: "Pants", slug: "Pants", icon: Activity },
  { name: "Shoes", slug: "Shoes", icon: Footprints },
  { name: "Socks", slug: "Socks", icon: CircleDot },
  { name: "Jackets", slug: "Jackets", icon: Layers },
  { name: "Accessories", slug: "Accessories", icon: Watch },
];

export default function CategoryGrid({ locale, title }: { locale: Locale; title: string }) {
  return (
    <section className="py-8 px-4">
      <h2 className="text-zinc-900 text-lg font-semibold mb-4 dark:text-zinc-100">{title}</h2>
      {/* Mobile: horizontal rail with margins. Desktop: grid. */}
      <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory sm:grid sm:grid-cols-6 sm:gap-3 sm:overflow-visible">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
          <Link
            key={cat.slug}
            href={`/${locale}/collections?category=${cat.slug}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-zinc-200 hover:border-olive-600 hover:shadow-sm transition-all shrink-0 w-[120px] sm:w-auto dark:bg-zinc-900 dark:border-zinc-800"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
              <Icon size={24} className="text-zinc-600 dark:text-zinc-300" />
            </div>
            <span className="text-sm text-zinc-900 font-medium dark:text-zinc-100">{cat.name}</span>
          </Link>
        );})}
      </div>
    </section>
  );
}
