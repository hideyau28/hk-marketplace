"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import SectionTitle from "./SectionTitle";
import WishlistHeart from "@/components/WishlistHeart";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
};

const RECENT_VIEWS_KEY = "hk-market-recent-views";

export default function RecentlyViewed({
  locale,
  fallbackProducts,
  recentTitle,
  fallbackTitle,
}: {
  locale: Locale;
  fallbackProducts: Product[];
  recentTitle: string;
  fallbackTitle: string;
}) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const { format: formatPrice } = useCurrency();

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_VIEWS_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored) as string[];
        // We'd need to fetch these products from the server
        // For now, just use fallback
        setRecentProducts([]);
      } catch {
        setRecentProducts([]);
      }
    }
  }, []);

  const hasRecent = recentProducts.length > 0;
  const products = hasRecent ? recentProducts : fallbackProducts.slice(0, 8);
  const title = hasRecent ? recentTitle : fallbackTitle;

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionTitle title={title} />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-2 snap-x snap-mandatory">
          {products.map((product, idx) => (
            <Link
              key={product.id}
              href={`/${locale}/product/${product.id}`}
              className={`group shrink-0 snap-start ${idx === 0 ? "ml-4" : ""} ${
                idx === products.length - 1 ? "mr-4" : ""
              }`}
            >
              <div className="w-[120px] overflow-hidden rounded-lg bg-white border border-zinc-200/50 shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 dark:border-zinc-800">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="120px"
                  />
                  <WishlistHeart productId={product.id} size="sm" />
                </div>
                <div className="p-2">
                  <h3 className="text-xs text-zinc-900 line-clamp-1 dark:text-zinc-100">
                    {product.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
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
