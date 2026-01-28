import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function ProductRail({
  locale,
  title,
  products,
}: {
  locale: Locale;
  title: string;
  products: any[];
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="px-4">
        <h2 className="text-zinc-900 text-lg font-semibold mb-4">{title}</h2>
      </div>

      {/* Mobile: horizontal rail with "peek". Desktop: grid. */}
      <div className="-mx-4 px-4 sm:mx-0 sm:px-4">
        <div className="flex gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory pr-6 sm:grid sm:grid-cols-3 md:grid-cols-4 sm:gap-3 sm:overflow-visible sm:pr-0">
          {products.map((p, idx) => {
            const landscape = idx % 2 === 1;
            return (
              <div
                key={p.id}
                className={
                  (landscape ? "w-[200px]" : "w-[160px]") +
                  " shrink-0 snap-start sm:w-auto"
                }
              >
                <ProductCard locale={locale} p={p} imageAspect={landscape ? "landscape" : "square"} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
