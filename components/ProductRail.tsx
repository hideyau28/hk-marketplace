import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function ProductRail({
  locale,
  title,
  products,
  size = "sm",
}: {
  locale: Locale;
  title: string;
  products: any[];
  size?: "sm" | "lg";
}) {
  if (products.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="px-4">
        <h2 className="text-zinc-900 text-lg font-semibold mb-3">{title}</h2>
      </div>

      {/* <= md: always horizontal rail. Desktop (lg+): grid. */}
      <div className="lg:px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] snap-x snap-mandatory pl-4 lg:grid lg:grid-cols-4 xl:grid-cols-5 lg:gap-3 lg:overflow-visible lg:pl-0">
          {products.map((p) => (
            <div
              key={p.id}
              className={(size === "lg" ? "w-[200px]" : "w-[160px]") + " shrink-0 snap-start lg:w-auto"}
            >
              <ProductCard locale={locale} p={p} />
            </div>
          ))}
          {/* End spacer: ensures last card can scroll fully into view on mobile */}
          <div className="w-4 shrink-0 lg:hidden" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
