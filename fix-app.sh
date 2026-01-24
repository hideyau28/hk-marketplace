#!/usr/bin/env bash
set -euo pipefail

# 讀 tsconfig paths 推斷 @/* 指向邊度（./src/* 或 ./*）
ROOT="$(node - <<'NODE'
const fs = require("fs");
const p = "tsconfig.json";
let root = "";
try{
  const j = JSON.parse(fs.readFileSync(p,"utf8"));
  const paths = j.compilerOptions?.paths?.["@/*"]?.[0] || "";
  if (paths.startsWith("./src/") || paths.startsWith("src/")) root = "src";
}catch(e){}
process.stdout.write(root);
NODE
)"

APP_DIR="${ROOT:+$ROOT/}app"
BASE_DIR="${ROOT:-.}"

mkdir -p "$BASE_DIR/messages" "$BASE_DIR/lib" "$BASE_DIR/components" "$APP_DIR/[locale]/product/[id]"

# messages
cat > "$BASE_DIR/messages/zh-HK.json" <<'EOM'
{
  "nav": { "search": "搜尋商品", "collections": "我的清單", "orders": "我的訂單", "cart": "購物車", "signin": "登入" },
  "home": { "featured": "今日精選", "trending": "熱門", "forYou": "你可能鍾意", "byTag": "按標籤精選", "viewAll": "查看全部" },
  "product": { "addToCart": "加入購物車", "buyNow": "立即購買" }
}
EOM

cat > "$BASE_DIR/messages/en.json" <<'EOM'
{
  "nav": { "search": "Search products", "collections": "My Collections", "orders": "My Orders", "cart": "Cart", "signin": "Sign in" },
  "home": { "featured": "Featured", "trending": "Trending", "forYou": "For you", "byTag": "Curated by tag", "viewAll": "View all" },
  "product": { "addToCart": "Add to cart", "buyNow": "Buy now" }
}
EOM

# lib
cat > "$BASE_DIR/lib/i18n.ts" <<'EOM'
import zhHK from "@/messages/zh-HK.json";
import en from "@/messages/en.json";

export type Locale = "zh-HK" | "en";
export const locales: Locale[] = ["zh-HK", "en"];

const dict = { "zh-HK": zhHK, "en": en } as const;
export function getDict(locale: Locale) {
  return dict[locale] ?? dict["en"];
}
EOM

cat > "$BASE_DIR/lib/mock.ts" <<'EOM'
export const mockProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i + 1),
  title: `Product ${i + 1}`,
  price: 199 + i * 10,
  shopName: "Demo Shop",
  image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60"
}));
EOM

# components
cat > "$BASE_DIR/components/TopNav.tsx" <<'EOM'
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
EOM

cat > "$BASE_DIR/components/ProductCard.tsx" <<'EOM'
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function ProductCard({ locale, p }: { locale: Locale; p: any }) {
  return (
    <Link href={`/${locale}/product/${p.id}`} className="group rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition">
      <div className="aspect-square overflow-hidden rounded-xl bg-white/5">
        <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
      </div>
      <div className="mt-3">
        <div className="line-clamp-2 text-sm text-white">{p.title}</div>
        <div className="mt-1 text-xs text-white/60">{p.shopName}</div>
        <div className="mt-2 text-sm text-white font-semibold">HK$ {p.price}</div>
      </div>
    </Link>
  );
}
EOM

cat > "$BASE_DIR/components/ShelfRow.tsx" <<'EOM'
import type { Locale } from "@/lib/i18n";
import ProductCard from "@/components/ProductCard";

export default function ShelfRow({ locale, title, cta, products }: { locale: Locale; title: string; cta: string; products: any[] }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2 className="text-white text-lg font-semibold">{title}</h2>
        <button className="text-white/60 hover:text-white text-sm">{cta}</button>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {products.map((p) => (
          <div key={p.id} className="min-w-[160px] max-w-[160px]">
            <ProductCard locale={locale} p={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
EOM

# locale layout (唔包 html/body)
cat > "$APP_DIR/[locale]/layout.tsx" <<'EOM'
import { getDict, type Locale } from "@/lib/i18n";
import TopNav from "@/components/TopNav";

export default function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
  const t = getDict(params.locale);
  return (
    <div className="min-h-screen bg-black text-white">
      <TopNav locale={params.locale} t={t} />
      <main className="mx-auto max-w-6xl">{children}</main>
    </div>
  );
}
EOM

# home
cat > "$APP_DIR/[locale]/page.tsx" <<'EOM'
import { getDict, type Locale } from "@/lib/i18n";
import { mockProducts } from "@/lib/mock";
import ShelfRow from "@/components/ShelfRow";

export default function Home({ params }: { params: { locale: Locale } }) {
  const t = getDict(params.locale);
  return (
    <div className="pb-16">
      <div className="px-4 pt-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
          <div className="text-white/80 text-sm">HK Marketplace</div>
          <div className="mt-2 text-2xl font-semibold">Deep dark, easy shopping</div>
          <div className="mt-2 text-white/60 text-sm">Spotify-like browsing, standard checkout.</div>
        </div>
      </div>

      <ShelfRow locale={params.locale} title={t.home.featured} cta={t.home.viewAll} products={mockProducts.slice(0, 8)} />
      <ShelfRow locale={params.locale} title={t.home.trending} cta={t.home.viewAll} products={mockProducts.slice(2, 10)} />
      <ShelfRow locale={params.locale} title={t.home.forYou} cta={t.home.viewAll} products={mockProducts.slice(4, 12)} />
    </div>
  );
}
EOM

# product
cat > "$APP_DIR/[locale]/product/[id]/page.tsx" <<'EOM'
import { getDict, type Locale } from "@/lib/i18n";
import { mockProducts } from "@/lib/mock";

export default function ProductPage({ params }: { params: { locale: Locale; id: string } }) {
  const t = getDict(params.locale);
  const p = mockProducts.find((x) => x.id === params.id) ?? mockProducts[0];

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-white/60 text-sm">{p.shopName}</div>
          <h1 className="mt-2 text-2xl font-semibold">{p.title}</h1>
          <div className="mt-3 text-xl font-semibold">HK$ {p.price}</div>
          <div className="mt-4 text-white/60 text-sm leading-6">Placeholder description. Shipping calculated at checkout.</div>

          <div className="mt-6 hidden gap-3 md:flex">
            <button className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90">{t.product.addToCart}</button>
            <button className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white hover:bg-white/10">{t.product.buyNow}</button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-white font-semibold">HK$ {p.price}</div>
          <button className="flex-1 rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90">{t.product.addToCart}</button>
        </div>
      </div>
    </div>
  );
}
EOM

# root redirect
cat > "$APP_DIR/page.tsx" <<'EOM'
import { redirect } from "next/navigation";
export default function Page() {
  redirect("/zh-HK");
}
EOM

echo "WROTE TO: $APP_DIR  (ROOT=$ROOT)"
