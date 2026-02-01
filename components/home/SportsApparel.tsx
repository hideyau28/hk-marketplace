"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import SectionTitle from "./SectionTitle";
import WishlistHeart from "@/components/WishlistHeart";

type Product = {
  id: string;
  brand: string;
  title: string;
  price: number;
  image: string;
};

export default function SportsApparel({
  locale,
  products,
  title,
  viewAllText,
}: {
  locale: Locale;
  products: Product[];
  title: string;
  viewAllText: string;
}) {
  const { format: formatPrice } = useCurrency();

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionTitle title={title} viewAllText={viewAllText} viewAllHref={`/${locale}`} />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 snap-x snap-mandatory">
          {products.map((product, idx) => (
            <Link
              key={product.id}
              href={`/${locale}/product/${product.id}`}
              className={`group shrink-0 snap-start ${idx === 0 ? "ml-4" : ""} ${
                idx === products.length - 1 ? "mr-4" : ""
              }`}
            >
              <div className="w-[160px] md:w-[200px] overflow-hidden rounded-xl bg-white border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 160px, 200px"
                  />
                  <WishlistHeart productId={product.id} size="sm" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
                  <h3 className="text-xs font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">
                    {product.title}
                  </h3>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
