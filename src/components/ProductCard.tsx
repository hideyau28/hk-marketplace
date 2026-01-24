import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function ProductCard({ locale, p }: { locale: Locale; p: any }) {
  return (
    <Link
      href={`/${locale}/product/${p.id}`}
      className="group rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
    >
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
