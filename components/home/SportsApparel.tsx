"use client";

import { useState, useMemo } from "react";
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
  brand: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  sizes?: Record<string, number> | null;
  stock?: number;
};

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function SmallCardItem({ product, locale, isFirst, isLast, isTopSeller }: { product: Product; locale: Locale; isFirst: boolean; isLast: boolean; isTopSeller?: boolean }) {
  const { format: formatPrice } = useCurrency();
  const { showToast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showCartIcon, setShowCartIcon] = useState(false);

  const availableSizes = useMemo(() => {
    if (!product.sizes || typeof product.sizes !== "object") return [];
    return Object.entries(product.sizes)
      .filter(([, stock]) => stock > 0)
      .map(([size]) => size);
  }, [product.sizes]);

  const isOnSale = product.originalPrice != null && product.originalPrice > product.price;

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const size = e.target.value;
    setSelectedSize(size);
    if (size) {
      setShowCartIcon(true);
    } else {
      setShowCartIcon(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedSize) {
      addToCart({
        productId: product.id,
        title: `${product.title} - ${selectedSize}`,
        unitPrice: product.price,
        imageUrl: product.image,
        size: selectedSize,
      });
      showToast("✓ 已加入購物車");
      setSelectedSize("");
      setShowCartIcon(false);
    }
  };

  return (
    <div className={`group shrink-0 snap-start ${isFirst ? "ml-4" : ""} ${isLast ? "mr-4" : ""}`}>
      {/* Small card: 160px mobile, 180px desktop - all content inside card border */}
      <div className={`w-[160px] min-w-[160px] md:w-[180px] md:min-w-[180px] overflow-hidden rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 ${isOnSale ? "border-red-200 ring-1 ring-red-200 dark:border-red-900/50 dark:ring-red-900/50" : "border-zinc-200/50 dark:border-zinc-800"}`}>
        <Link href={`/${locale}/product/${product.id}`}>
          <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 160px, 180px"
            />
            <WishlistHeart productId={product.id} size="sm" />
            {isTopSeller && (
              <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded text-white bg-red-500 z-10">
                {locale.startsWith("zh") ? "\uD83D\uDD25 \u71B1\u8CE3" : "\uD83D\uDD25 Hot"}
              </span>
            )}
            {/* Cart icon - shows after size selection */}
            {showCartIcon && selectedSize && (
              <button
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full text-white flex items-center justify-center shadow-lg hover:brightness-90 transition-all z-10"
                style={{ backgroundColor: "var(--tmpl-accent, #2D6A4F)", animation: "fadeIn 0.2s ease-out" }}
                aria-label="Add to cart"
              >
                <CartIcon />
              </button>
            )}
          </div>
          <div className="p-2.5 pb-1 flex flex-col">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
            <h3 className="text-xs font-medium text-zinc-900 line-clamp-2 leading-tight min-h-[2rem] dark:text-zinc-100">
              {product.title}
            </h3>
          </div>
        </Link>
        {/* Price row with size dropdown - INSIDE card, uses stopPropagation */}
        <div
          className="px-2.5 pb-2.5 flex items-center justify-between gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col leading-tight">
            {isOnSale ? (
              <>
                <span className="text-[10px] text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>
                <span className="text-sm font-bold text-red-600">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(product.price)}</span>
            )}
          </div>
          {availableSizes.length > 0 && (
            <div
              className="relative"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <select
                value={selectedSize}
                onChange={handleSizeChange}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-medium px-1.5 py-1 pr-4 rounded-md cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
              >
                <option value="">尺碼 ▼</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function SportsApparel({
  locale,
  products,
  title,
  viewAllText,
  viewAllHref,
  topSellerIds,
}: {
  locale: Locale;
  products: Product[];
  title: string;
  viewAllText: string;
  viewAllHref?: string;
  topSellerIds?: string[];
}) {
  if (products.length === 0) return null;

  const topSet = useMemo(() => new Set(topSellerIds || []), [topSellerIds]);

  return (
    <section className="py-6">
      <SectionTitle title={title} viewAllText={viewAllText} viewAllHref={viewAllHref || `/${locale}/products`} />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 snap-x snap-mandatory">
          {products.map((product, idx) => (
            <SmallCardItem
              key={product.id}
              product={product}
              locale={locale}
              isFirst={idx === 0}
              isLast={idx === products.length - 1}
              isTopSeller={topSet.has(product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
