"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import SectionTitle from "./SectionTitle";
import WishlistHeart from "@/components/WishlistHeart";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  sizes?: Record<string, number> | null;
  stock?: number;
};

const RECENT_VIEWS_KEY = "hk-market-recent-views";

function RecentCardItem({ product, locale, isFirst, isLast }: { product: Product; locale: Locale; isFirst: boolean; isLast: boolean }) {
  const { format: formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");

  const availableSizes = useMemo(() => {
    if (!product.sizes || typeof product.sizes !== "object") return [];
    return Object.entries(product.sizes)
      .filter(([, stock]) => stock > 0)
      .map(([size]) => size);
  }, [product.sizes]);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedSize(e.target.value);
    if (e.target.value) {
      addToCart({
        productId: product.id,
        title: `${product.title} - ${e.target.value}`,
        unitPrice: product.price,
        imageUrl: product.image,
        size: e.target.value,
      });
      showToast("✓ 已加入購物車");
      setSelectedSize("");
    }
  };

  return (
    <div className={`group shrink-0 snap-start flex flex-col ${isFirst ? "ml-4" : ""} ${isLast ? "mr-4" : ""}`}>
      <Link href={`/${locale}/product/${product.id}`}>
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
          <div className="p-2 flex flex-col">
            <h3 className="text-xs text-zinc-900 line-clamp-1 dark:text-zinc-100">
              {product.title}
            </h3>
          </div>
        </div>
      </Link>
      {/* Price row with size dropdown - outside Link */}
      <div className="w-[120px] mt-0.5 px-2 flex items-center justify-between gap-1">
        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
          {formatPrice(product.price)}
        </p>
        {availableSizes.length > 0 && (
          <div className="relative">
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              onClick={(e) => e.stopPropagation()}
              className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium px-1 py-0.5 pr-3 rounded cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
            >
              <option value="">尺碼</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <svg className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2 h-2 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

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
            <RecentCardItem
              key={product.id}
              product={product}
              locale={locale}
              isFirst={idx === 0}
              isLast={idx === products.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
