import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function ProductGrid({
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
    <section className="mt-12 px-4">
      <h2 className="text-zinc-900 text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} locale={locale} p={p} />
        ))}
      </div>
    </section>
  );
}
