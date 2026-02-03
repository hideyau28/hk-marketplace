"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { useFilters } from "@/lib/filter-context";

type CategoryNavProps = {
  locale: Locale;
};

export default function CategoryNav({ locale }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filterContext = useFilters();
  const isZh = locale === "zh-HK";

  // Check if we're on the products page
  const isProductsPage = pathname?.startsWith(`/${locale}/products`);

  // Get current filter state (or defaults if no context)
  const filters = filterContext?.filters || { shoeType: null, hot: false, sale: false };

  // Handle pill click
  const handlePillClick = (type: "hot" | "sale" | "shoeType", value?: "adult" | "womens" | "kids") => {
    if (isProductsPage && filterContext) {
      // On products page: update context state directly
      if (type === "hot") {
        filterContext.toggleHot();
      } else if (type === "sale") {
        filterContext.toggleSale();
      } else if (type === "shoeType" && value) {
        filterContext.toggleShoeType(value);
      }
    } else {
      // On homepage: navigate to products page (filter will be applied there)
      // We set initial filter state then navigate
      if (filterContext) {
        if (type === "hot") {
          filterContext.setFilters({ shoeType: null, hot: true, sale: false });
        } else if (type === "sale") {
          filterContext.setFilters({ shoeType: null, hot: false, sale: true });
        } else if (type === "shoeType" && value) {
          filterContext.setFilters({ shoeType: value, hot: false, sale: false });
        }
      }
      router.push(`/${locale}/products`);
    }
  };

  return (
    <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-6xl px-4 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* 熱賣 Hot pill */}
          <button
            onClick={() => handlePillClick("hot")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.hot
                ? "bg-orange-500 text-white"
                : "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
            }`}
          >
            {isZh ? "熱賣" : "Hot"}
          </button>

          {/* 減價 Sale pill */}
          <button
            onClick={() => handlePillClick("sale")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.sale
                ? "bg-red-500 text-white"
                : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            }`}
          >
            {isZh ? "減價" : "Sale"}
          </button>

          {/* 男裝 Men pill */}
          <button
            onClick={() => handlePillClick("shoeType", "adult")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.shoeType === "adult"
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isZh ? "男裝" : "Men"}
          </button>

          {/* 女裝 Women pill */}
          <button
            onClick={() => handlePillClick("shoeType", "womens")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.shoeType === "womens"
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isZh ? "女裝" : "Women"}
          </button>

          {/* 童裝 Kids pill */}
          <button
            onClick={() => handlePillClick("shoeType", "kids")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.shoeType === "kids"
                ? "bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isZh ? "童裝" : "Kids"}
          </button>
        </div>
      </div>
    </div>
  );
}
