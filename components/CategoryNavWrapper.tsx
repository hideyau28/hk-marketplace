"use client";

import { usePathname } from "next/navigation";
import CategoryNav from "./CategoryNav";
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

  // Exclude individual product pages (which would be /product/[id])
  const isProductDetailPage = pathname?.match(/^\/[a-z-]+\/product\/[^/]+$/);

  if (!showCategoryNav || isProductDetailPage) {
    return null;
  }

  return <CategoryNav locale={locale} />;
}
