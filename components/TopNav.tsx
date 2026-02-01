"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getCartItemCount, getCart } from "@/lib/cart";
import { Moon, ShoppingCart, Sun, Menu, X } from "lucide-react";
import { currencyOptions, useCurrency } from "@/lib/currency";
import { useTheme } from "@/lib/theme-context";

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  parts[0] = nextLocale;
  return "/" + parts.join("/");
}

export default function TopNav({ locale, t }: { locale: Locale; t: any }) {
  const pathname = usePathname() || `/${locale}`;
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { currency, setCurrency } = useCurrency();
  const { resolved, cycleMode } = useTheme();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = getCart();
      setCartCount(getCartItemCount(cart));
    };

    updateCartCount();

    // Listen for storage events (cart updates from other tabs)
    window.addEventListener("storage", updateCartCount);
    // Listen for custom cart update events
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link href={`/${locale}`} className="text-zinc-900 font-semibold tracking-wide dark:text-zinc-100">HK•Market</Link>

          {/* Desktop search only (mobile uses floating pill + bottom tab) */}
          <div className="hidden md:block flex-1">
            <input
              placeholder={t.nav.search}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Desktop links only */}
          <div className="hidden md:flex items-center gap-2 text-sm">
            <Link className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" href={`/${locale}/collections`}>{t.nav.collections}</Link>
            <Link className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100" href={`/${locale}/orders`}>{t.nav.orders}</Link>
          </div>

          {/* Spacer for mobile */}
          <div className="flex-1 md:hidden" />

          {/* Cart - always visible */}
          <Link className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1" href={`/${locale}/cart`}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* Desktop controls */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              {currencyOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={cycleMode}
              className="rounded-lg border border-zinc-200 bg-white p-1 text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              aria-label="Toggle theme"
            >
              {resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href={swapLocale(pathname, "zh-HK")} className={`rounded-lg px-2 py-1 text-xs ${locale==="zh-HK"?"bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900":"text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"}`}>中</Link>
            <Link href={swapLocale(pathname, "en")} className={`rounded-lg px-2 py-1 text-xs ${locale==="en"?"bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900":"text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"}`}>EN</Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="fixed inset-x-0 top-[57px] z-40 md:hidden border-b border-zinc-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto max-w-6xl px-4 py-4 space-y-3">
            {/* Language */}
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Language</div>
              <div className="flex gap-2">
                <Link
                  href={swapLocale(pathname, "zh-HK")}
                  onClick={() => setMenuOpen(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-sm ${locale==="zh-HK"?"bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900":"border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}
                >
                  中文
                </Link>
                <Link
                  href={swapLocale(pathname, "en")}
                  onClick={() => setMenuOpen(false)}
                  className={`flex-1 rounded-lg px-3 py-2 text-center text-sm ${locale==="en"?"bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900":"border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}
                >
                  English
                </Link>
              </div>
            </div>

            {/* Currency */}
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Currency</div>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {currencyOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Dark Mode */}
            <div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">Appearance</div>
              <button
                type="button"
                onClick={() => {
                  cycleMode();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <span>{resolved === "dark" ? "Dark" : "Light"} Mode</span>
                {resolved === "dark" ? <Moon size={16} /> : <Sun size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
