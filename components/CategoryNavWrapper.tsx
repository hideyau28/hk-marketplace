"use client";

import { usePathname } from "next/navigation";
import CategoryNav from "./CategoryNav";
import CategoryBrowseNav from "./CategoryBrowseNav";
import type { Locale } from "@/lib/i18n";

type CategoryNavWrapperProps = {
  locale: Locale;
  tenantSlug?: string;
};

export default function CategoryNavWrapper({
  locale,
  tenantSlug,
}: CategoryNavWrapperProps) {
  const pathname = usePathname();

  // Show CategoryNav (Hot/Sale/Men/Women/Kids + subcategory pills) on homepage, products, search
  const showCategoryNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/products`) ||
    pathname?.startsWith(`/${locale}/search`);

  // Show CategoryBrowseNav (DB categories) on homepage, products, search, category pages
  const showBrowseNav =
    pathname === `/${locale}` ||
    pathname === `/${locale}/` ||
    pathname?.startsWith(`/${locale}/categories`) ||
    pathname?.startsWith(`/${locale}/products`) ||
    pathname?.startsWith(`/${locale}/search`);

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
