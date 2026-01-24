import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function ShelfRow({ locale, title, cta, products }: { locale: Locale; title: string; cta: string; products: any[] }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <button className="text-white/60 hover:text-white text-sm">{cta}</button>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {products.map((p) => (
          <div key={p.id} className="min-w-[160px] max-w-[160px]">
            <ProductCard locale={locale} p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
