"use client";

import { usePathname } from "next/navigation";
import CategoryNav from "./CategoryNav";
import CategoryBrowseNav from "./CategoryBrowseNav";
import type { Locale } from "@/lib/i18n";

type CategoryNavWrapperProps = {
  locale: Locale;
};

export default function CategoryNavWrapper({ locale }: CategoryNavWrapperProps) {
  const pathname = usePathname();

  // Show CategoryNav on homepage, products listing, and search pages
  // Hide on: /product/[id], /cart, /checkout, /orders, /collections, /track, /profile
  const showCategoryNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/products`) ||
    pathname?.startsWith(`/${locale}/search`);

  // Show CategoryBrowseNav on category pages and homepage
  const showBrowseNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/categories`);

  // Exclude individual product pages (which would be /product/[id])
  const isProductDetailPage = pathname?.match(/^\/[a-z-]+\/product\/[^/]+$/);

  if (isProductDetailPage) {
    return null;
  }

  return (
    <>
      {showCategoryNav && <CategoryNav locale={locale} />}
      {showBrowseNav && <CategoryBrowseNav locale={locale} />}
    </>
  );
}
