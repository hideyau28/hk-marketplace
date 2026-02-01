"use client";

import { usePathname } from "next/navigation";
import CategoryNav from "./CategoryNav";
import type { Locale } from "@/lib/i18n";

type CategoryNavWrapperProps = {
  locale: Locale;
};

export default function CategoryNavWrapper({ locale }: CategoryNavWrapperProps) {
  const pathname = usePathname();

  // Only show CategoryNav on homepage and products listing pages
  // Hide on: /product/[id], /cart, /checkout, /orders, /collections, /search, /track, /profile
  const showCategoryNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/products`);

  // Exclude individual product pages (which would be /product/[id])
  const isProductDetailPage = pathname?.match(/^\/[a-z-]+\/product\/[^/]+$/);

  if (!showCategoryNav || isProductDetailPage) {
    return null;
  }

  return <CategoryNav locale={locale} />;
}
