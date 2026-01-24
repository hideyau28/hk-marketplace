"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  parts[0] = nextLocale;
  return "/" + parts.join("/");
}

export default function TopNav({ locale, t }: { locale: Locale; t: any }) {
  const pathname = usePathname() || `/${locale}`;
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href={`/${locale}`} className="text-white font-semibold tracking-wide">HK•Market</Link>
        <div className="flex-1">
          <input
            placeholder={t.nav.search}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link className="text-white/70 hover:text-white" href={`/${locale}/collections`}>{t.nav.collections}</Link>
          <Link className="text-white/70 hover:text-white" href={`/${locale}/orders`}>{t.nav.orders}</Link>
          <Link className="text-white/70 hover:text-white" href={`/${locale}/cart`}>{t.nav.cart}</Link>
        </div>
        <div className="ml-2 flex items-center gap-2">
          <Link href={swapLocale(pathname, "zh-HK")} className={`rounded-lg px-2 py-1 text-xs ${locale==="zh-HK"?"bg-white/15 text-white":"text-white/60 hover:text-white"}`}>中</Link>
          <Link href={swapLocale(pathname, "en")} className={`rounded-lg px-2 py-1 text-xs ${locale==="en"?"bg-white/15 text-white":"text-white/60 hover:text-white"}`}>EN</Link>
        </div>
      </div>
    </div>
  );
}
