"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Suspense } from "react";
import CategoryNav from "./CategoryNav";
import type { Locale } from "@/lib/i18n";

type CategoryNavWrapperProps = {
  locale: Locale;
};

// Labels for display
const SHOE_TYPE_LABELS: Record<string, Record<string, string>> = {
  adult: { "zh-HK": "男裝", en: "Men" },
  womens: { "zh-HK": "女裝", en: "Women" },
  grade_school: { "zh-HK": "童裝", en: "Kids" },
  preschool: { "zh-HK": "童裝", en: "Kids" },
  toddler: { "zh-HK": "童裝", en: "Kids" },
};

function ActiveFilterPills({ locale }: { locale: Locale }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isZh = locale === "zh-HK";

  // Only show on products or search pages
  const isFilterablePage = pathname?.includes("/products") || pathname?.includes("/search");
  if (!isFilterablePage) return null;

  const shoeType = searchParams?.get("shoeType");
  const category = searchParams?.get("category");
  const minPrice = searchParams?.get("minPrice");
  const maxPrice = searchParams?.get("maxPrice");
  const sizes = searchParams?.get("sizes");
  const badge = searchParams?.get("badge");
  const sale = searchParams?.get("sale");

  // Check if any filters are active
  const hasFilters = shoeType || category || minPrice || sizes || badge || sale;
  if (!hasFilters) return null;

  // Build list of active filter pills
  const pills: { key: string; label: string; param: string }[] = [];

  // ShoeType pill
  if (shoeType) {
    const types = shoeType.split(",");
    const firstType = types[0];
    const label = SHOE_TYPE_LABELS[firstType]?.[locale] || firstType;
    pills.push({ key: "shoeType", label, param: "shoeType" });
  }

  // Badge pill (熱賣)
  if (badge) {
    const badgeLabel = badge === "今期熱賣" ? (isZh ? "熱賣" : "Hot") : badge;
    pills.push({ key: "badge", label: badgeLabel, param: "badge" });
  }

  // Sale pill (減價)
  if (sale === "true") {
    pills.push({ key: "sale", label: isZh ? "減價" : "Sale", param: "sale" });
  }

  // Category pills
  if (category) {
    category.split(",").forEach((cat) => {
      pills.push({ key: `category-${cat}`, label: cat, param: `category:${cat}` });
    });
  }

  // Price range pill
  if (minPrice) {
    const priceLabel = maxPrice ? `$${minPrice}-${maxPrice}` : `$${minPrice}+`;
    pills.push({ key: "price", label: priceLabel, param: "price" });
  }

  // Size pills
  if (sizes) {
    sizes.split(",").forEach((size) => {
      pills.push({ key: `size-${size}`, label: size, param: `sizes:${size}` });
    });
  }

  const removeFilter = (param: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (param === "shoeType") {
      params.delete("shoeType");
    } else if (param === "badge") {
      params.delete("badge");
    } else if (param === "sale") {
      params.delete("sale");
    } else if (param === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else if (param.startsWith("category:")) {
      const catToRemove = param.split(":")[1];
      const currentCats = params.get("category")?.split(",").filter(c => c !== catToRemove) || [];
      if (currentCats.length > 0) {
        params.set("category", currentCats.join(","));
      } else {
        params.delete("category");
      }
    } else if (param.startsWith("sizes:")) {
      const sizeToRemove = param.split(":")[1];
      const currentSizes = params.get("sizes")?.split(",").filter(s => s !== sizeToRemove) || [];
      if (currentSizes.length > 0) {
        params.set("sizes", currentSizes.join(","));
      } else {
        params.delete("sizes");
      }
    }

    const queryString = params.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
    router.push(newUrl);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    // Preserve search query if present
    const q = params.get("q");
    const newParams = new URLSearchParams();
    if (q) newParams.set("q", q);

    const queryString = newParams.toString();
    const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
    router.push(newUrl);
  };

  return (
    <div className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500 shrink-0">
            {isZh ? "已選篩選:" : "Active filters:"}
          </span>
          {pills.map((pill) => (
            <button
              key={pill.key}
              onClick={() => removeFilter(pill.param)}
              className="flex items-center gap-1 rounded-full bg-olive-100 dark:bg-olive-900/30 px-2.5 py-1 text-xs font-medium text-olive-700 dark:text-olive-300 hover:bg-olive-200 dark:hover:bg-olive-900/50 transition-colors"
            >
              {pill.label}
              <X size={12} className="text-olive-500" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 underline ml-2"
          >
            {isZh ? "清除全部" : "Clear all"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoryNavWrapper({ locale }: CategoryNavWrapperProps) {
  const pathname = usePathname();

  // Show CategoryNav on homepage, products listing, and search pages
  // Hide on: /product/[id], /cart, /checkout, /orders, /collections, /track, /profile
  const showCategoryNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/products`) ||
    pathname?.startsWith(`/${locale}/search`);

  // Exclude individual product pages (which would be /product/[id])
  const isProductDetailPage = pathname?.match(/^\/[a-z-]+\/product\/[^/]+$/);

  if (!showCategoryNav || isProductDetailPage) {
    return null;
  }

  return (
    <>
      <CategoryNav locale={locale} />
      <Suspense fallback={null}>
        <ActiveFilterPills locale={locale} />
      </Suspense>
    </>
  );
}
