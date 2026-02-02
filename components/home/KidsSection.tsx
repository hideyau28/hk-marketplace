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
  image: string;
  sizes?: Record<string, number> | null;
  stock?: number;
};

function KidsCardItem({ product, locale, isFirst, isLast }: { product: Product; locale: Locale; isFirst: boolean; isLast: boolean }) {
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
          <div className="p-2.5 flex flex-col">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.brand}</p>
            <h3 className="text-xs font-medium text-zinc-900 line-clamp-2 dark:text-zinc-100">
              {product.title}
            </h3>
          </div>
        </div>
      </Link>
      {/* Price row with size dropdown - outside Link */}
      <div className="w-[160px] md:w-[200px] mt-1 px-2.5 flex items-center justify-between gap-1">
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {formatPrice(product.price)}
        </p>
        {availableSizes.length > 0 && (
          <div className="relative">
            <select
              value={selectedSize}
              onChange={handleSizeChange}
              onClick={(e) => e.stopPropagation()}
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
  );
}

export default function KidsSection({
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
        viewAllHref={viewAllHref || `/${locale}/products?shoeType=grade_school,preschool,toddler`}
      />
      <div className="overflow-x-auto scrollbar-hide [-webkit-overflow-scrolling:touch]">
        <div className="flex gap-3 snap-x snap-mandatory">
          {products.map((product, idx) => (
            <KidsCardItem
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
