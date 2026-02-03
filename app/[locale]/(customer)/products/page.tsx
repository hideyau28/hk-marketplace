"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";
import { useFilters } from "@/lib/filter-context";

type Product = {
  id: string;
  brand: string | null;
  title: string;
  imageUrl: string | null;
  price: number;
  originalPrice: number | null;
  stock: number;
  badges: string[] | null;
  promotionBadges: string[] | null;
  sizes: Record<string, number> | null;
  shoeType: string | null;
};

export default function ProductsPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "zh-HK";
  const isZh = locale === "zh-HK";

  const filterContext = useFilters();
  const filters = filterContext?.filters || { shoeType: null, hot: false, sale: false };

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all products on mount
  useEffect(() => {
    fetch("/api/products?limit=500")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Filter products based on active filters
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // ShoeType filter (radio - only one at a time)
    if (filters.shoeType === "adult") {
      result = result.filter((p) => p.shoeType === "adult");
    } else if (filters.shoeType === "womens") {
      result = result.filter((p) => p.shoeType === "womens");
    } else if (filters.shoeType === "kids") {
      result = result.filter((p) =>
        ["grade_school", "preschool", "toddler"].includes(p.shoeType || "")
      );
    }

    // Hot filter (今期熱賣)
    if (filters.hot) {
      result = result.filter((p) =>
        p.promotionBadges?.includes("今期熱賣")
      );
    }

    // Sale filter (has discount)
    if (filters.sale) {
      result = result.filter((p) =>
        p.originalPrice && p.originalPrice > p.price
      );
    }

    return result;
  }, [allProducts, filters]);

  // Build page title based on active filters
  const pageTitle = useMemo(() => {
    const parts: string[] = [];

    if (filters.shoeType === "adult") {
      parts.push(isZh ? "男裝" : "Men");
    } else if (filters.shoeType === "womens") {
      parts.push(isZh ? "女裝" : "Women");
    } else if (filters.shoeType === "kids") {
      parts.push(isZh ? "童裝" : "Kids");
    }

    if (filters.hot) {
      parts.push(isZh ? "熱賣" : "Hot");
    }

    if (filters.sale) {
      parts.push(isZh ? "減價" : "Sale");
    }

    return parts.length > 0
      ? parts.join(" · ")
      : isZh
        ? "所有產品"
        : "All Products";
  }, [filters, isZh]);

  // Map to ProductCard format
  const productList = filteredProducts.map((p) => ({
    id: p.id,
    brand: p.brand || undefined,
    title: p.title,
    image: p.imageUrl || undefined,
    price: p.price,
    originalPrice: p.originalPrice,
    stock: p.stock ?? 0,
    badges: p.badges && Array.isArray(p.badges) ? p.badges : undefined,
    sizes: p.sizes,
  }));

  if (loading) {
    return (
      <div className="px-4 py-6 pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse">
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-32 mb-4" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-28">
      {/* TEMPORARY DEBUG BAR */}
      <div className="bg-yellow-200 p-2 text-xs fixed top-0 left-0 right-0 z-[9999]">
        DEBUG: Filters={JSON.stringify(filters)} | Total={allProducts.length} | Shown={filteredProducts.length}
      </div>
      <div className="mx-auto max-w-6xl">
        <div className="flex items-baseline justify-between mb-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {pageTitle}
          </h1>
          <span className="text-sm text-zinc-500">
            {isZh ? `顯示 ${productList.length} 件產品` : `${productList.length} products`}
          </span>
        </div>

        {productList.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="text-5xl mb-4">👟</div>
            <p className="text-zinc-500">
              {isZh ? "冇搵到相關產品" : "No products found"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((p) => (
              <ProductCard key={p.id} locale={locale} p={p} fillWidth />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
