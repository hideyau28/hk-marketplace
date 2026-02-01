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

export default function RecommendedGrid({
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
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {products.slice(0, 6).map((product) => (
            <Link
              key={product.id}
              href={`/${locale}/product/${product.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800"
            >
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <WishlistHeart productId={product.id} size="md" />
              </div>
              <div className="p-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
                <h3 className="text-sm font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">
                  {product.title}
                </h3>
                <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
