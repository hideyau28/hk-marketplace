"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { useFilters, type CategoryFilter } from "@/lib/filter-context";

type CategoryNavProps = {
  locale: Locale;
};

const CATEGORIES: { key: CategoryFilter; label: string; labelEn: string }[] = [
  { key: null, label: "全部", labelEn: "All" },
  { key: "Air Jordan", label: "Air Jordan", labelEn: "Air Jordan" },
  { key: "Dunk/SB", label: "Dunk/SB", labelEn: "Dunk/SB" },
  { key: "Air Max", label: "Air Max", labelEn: "Air Max" },
  { key: "Air Force", label: "Air Force", labelEn: "Air Force" },
  { key: "Running", label: "Running", labelEn: "Running" },
  { key: "Basketball", label: "Basketball", labelEn: "Basketball" },
  { key: "Lifestyle", label: "Lifestyle", labelEn: "Lifestyle" },
  { key: "Training", label: "Training", labelEn: "Training" },
  { key: "Sandals", label: "Sandals", labelEn: "Sandals" },
];

export default function CategoryNav({ locale }: CategoryNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const filterContext = useFilters();
  const isZh = locale === "zh-HK";

  // Check if we're on the products page
  const isProductsPage = pathname?.startsWith(`/${locale}/products`);

  // Get current filter state (or defaults if no context)
  const filters = filterContext?.filters || { shoeType: null, hot: false, sale: false, category: null };

  // Handle main pill click (hot/sale/shoeType)
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
      if (filterContext) {
        if (type === "hot") {
          filterContext.setFilters({ shoeType: null, hot: true, sale: false, category: null });
        } else if (type === "sale") {
          filterContext.setFilters({ shoeType: null, hot: false, sale: true, category: null });
        } else if (type === "shoeType" && value) {
          filterContext.setFilters({ shoeType: value, hot: false, sale: false, category: null });
        }
      }
      router.push(`/${locale}/products`);
    }
  };

  // Handle category pill click
  const handleCategoryClick = (category: CategoryFilter) => {
    if (isProductsPage && filterContext) {
      // On products page: update context state directly
      filterContext.toggleCategory(category);
    } else {
      // On homepage: navigate to products page with category
      if (filterContext) {
        filterContext.setFilters({ shoeType: null, hot: false, sale: false, category });
      }
      router.push(`/${locale}/products`);
    }
  };

  return (
    <div className="sticky top-[57px] z-40 border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto max-w-6xl px-4 py-2.5">
        {/* Main filter pills row */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {/* 熱賣 Hot pill */}
          <button
            onClick={() => handlePillClick("hot")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors shrink-0 ${
              filters.hot
                ? "bg-[#6B7A2F] text-white"
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
                ? "bg-[#6B7A2F] text-white"
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
                ? "bg-[#6B7A2F] text-white"
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
                ? "bg-[#6B7A2F] text-white"
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
                ? "bg-[#6B7A2F] text-white"
                : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            {isZh ? "童裝" : "Kids"}
          </button>
        </div>

        {/* Category pills row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mt-2 -mx-4 px-4">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat.key;
            return (
              <button
                key={cat.key || "all"}
                onClick={() => handleCategoryClick(cat.key)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? "bg-olive-600 text-white"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {isZh ? cat.label : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
