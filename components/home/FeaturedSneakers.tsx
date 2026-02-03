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

function LargeCardItem({ product, locale, isFirst, isLast }: { product: Product; locale: Locale; isFirst: boolean; isLast: boolean }) {
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
      {/* Large card: 220px mobile, 280px desktop - all content inside card border */}
      <div className={`w-[220px] min-w-[220px] md:w-[280px] md:min-w-[280px] overflow-hidden rounded-xl bg-white border shadow-sm hover:shadow-md transition-shadow dark:bg-zinc-900 ${isOnSale ? "border-red-200 ring-1 ring-red-200 dark:border-red-900/50 dark:ring-red-900/50" : "border-zinc-200/50 dark:border-zinc-800"}`}>
        <Link href={`/${locale}/product/${product.id}`}>
          <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50 dark:bg-zinc-800">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-contain group-hover:scale-105 transition-transform"
              sizes="(max-width: 768px) 220px, 280px"
            />
            <WishlistHeart productId={product.id} size="sm" />
            {/* Cart icon - shows after size selection */}
            {showCartIcon && selectedSize && (
              <button
                onClick={handleAddToCart}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-[#6B7A2F] text-white flex items-center justify-center shadow-lg hover:bg-[#5a6827] transition-all z-10"
                style={{ animation: "fadeIn 0.2s ease-out" }}
                aria-label="Add to cart"
              >
                <CartIcon />
              </button>
            )}
          </div>
          <div className="p-3 pb-1 flex flex-col">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
            <h3 className="text-sm font-medium text-zinc-900 line-clamp-2 leading-tight min-h-[2.5rem] dark:text-zinc-100">
              {product.title}
            </h3>
          </div>
        </Link>
        {/* Price row with size dropdown - INSIDE card, uses stopPropagation */}
        <div
          className="px-3 pb-3 flex items-center justify-between gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col leading-tight">
            {isOnSale ? (
              <>
                <span className="text-[10px] text-zinc-400 line-through">{formatPrice(product.originalPrice!)}</span>
                <span className="text-base font-bold text-red-600">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{formatPrice(product.price)}</span>
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
                className="appearance-none bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium px-2 py-1 pr-5 rounded-lg cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none"
              >
                <option value="">尺碼</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <svg className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
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

export default function FeaturedSneakers({
  locale,
  products,
  title,
  viewAllText,
  viewAllHref,
}: {
  locale: Locale;
  products: Product[];
  title: string;
  viewAllText: string;
  viewAllHref?: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <SectionTitle
        title={title}
        viewAllText={viewAllText}
        viewAllHref={viewAllHref || `/${locale}/products`}
      />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-4 snap-x snap-mandatory">
          {products.map((product, idx) => (
            <LargeCardItem
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
