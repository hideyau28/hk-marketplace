"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import type { Translations } from "@/lib/translations";
import { getCartItemCount, getCart } from "@/lib/cart";
import { Moon, ShoppingCart, Sun, Menu, Search } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  parts[0] = nextLocale;
  return "/" + parts.join("/");
}

export default function TopNav({ locale, t, storeName = "HK•Market" }: { locale: Locale; t: Translations; storeName?: string }) {
  const pathname = usePathname() || `/${locale}`;
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Currency context still available if needed elsewhere
  const { resolved, cycleMode } = useTheme();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(getCartItemCount(cart));
    };

    updateCartCount();

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    if (query?.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-base font-bold tracking-wide text-zinc-900 dark:text-zinc-100"
          >
            {storeName}
          </Link>

          {/* Desktop search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden flex-1 md:block">
            <input
              name="q"
              placeholder={t.nav.search}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </form>

          {/* Spacer for mobile (pushes icons to the right) */}
          <div className="flex-1 md:hidden" />

          {/* Mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={cycleMode}
              className="rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link
              href={swapLocale(pathname, "zh-HK")}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                locale === "zh-HK"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              }`}
            >
              中
            </Link>
            <Link
              href={swapLocale(pathname, "en")}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                locale === "en"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              }`}
            >
              EN
            </Link>
          </div>

          {/* Cart - always visible */}
          <Link
            className="relative flex items-center gap-1 text-[#6B7A2F] hover:text-[#5a6827] dark:text-[#8fa03d] dark:hover:text-[#a0b44a]"
            href={`/${locale}/cart`}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <MobileMenu locale={locale} t={t} isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Search Overlay */}
      <SearchOverlay
        locale={locale}
        t={t}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
