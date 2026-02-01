"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import SectionTitle from "./SectionTitle";

type Product = {
  id: string;
  brand: string;
  title: string;
  price: number;
  originalPrice: number;
  image: string;
};

export default function SaleZone({
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

  const calculateDiscount = (original: number, sale: number) => {
    return Math.round(((original - sale) / original) * 100);
  };

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionTitle title={title} viewAllText={viewAllText} viewAllHref={`/${locale}?sale=true`} />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 snap-x snap-mandatory">
          {products.map((product, idx) => {
            const discount = calculateDiscount(product.originalPrice, product.price);
            return (
              <Link
                key={product.id}
                href={`/${locale}/product/${product.id}`}
                className={`group shrink-0 snap-start ${idx === 0 ? "ml-4" : ""} ${
                  idx === products.length - 1 ? "mr-4" : ""
                }`}
              >
                <div className="w-[200px] md:w-[240px] overflow-hidden rounded-2xl bg-white border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800">
                  {/* Discount Badge */}
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      -{discount}%
                    </div>
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 768px) 200px, 240px"
                      />
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
                    <h3 className="text-sm font-medium text-zinc-900 line-clamp-1 dark:text-zinc-100">
                      {product.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm text-zinc-400 line-through dark:text-zinc-500">
                        {formatPrice(product.originalPrice)}
                      </p>
                      <p className="text-sm font-bold text-red-600 dark:text-red-500">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
