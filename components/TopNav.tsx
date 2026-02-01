"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { getCartItemCount, getCart } from "@/lib/cart";
import { Moon, ShoppingCart, Sun } from "lucide-react";
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

        {/* Cart stays visible on mobile */}
        <div className="flex items-center">
          <Link className="relative text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1" href={`/${locale}/cart`}>
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-white text-xs">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
        </div>
        <div className="ml-2 flex items-center gap-2">
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
          <Link href={swapLocale(pathname, "zh-HK")} className={`rounded-lg px-2 py-1 text-xs ${locale==="zh-HK"?"bg-zinc-900 text-white":"text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"}`}>中</Link>
          <Link href={swapLocale(pathname, "en")} className={`rounded-lg px-2 py-1 text-xs ${locale==="en"?"bg-zinc-900 text-white":"text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"}`}>EN</Link>
        </div>
      </div>
    </div>
  );
}
