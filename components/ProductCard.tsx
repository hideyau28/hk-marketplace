import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export default function ProductCard({ locale, p }: { locale: Locale; p: any }) {
  return (
    <Link href={`/${locale}/product/${p.id}`} className="group rounded-2xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 transition">
      <div className="aspect-square overflow-hidden rounded-xl bg-zinc-100">
        <img src={p.image} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.02] transition" />
      </div>
      <div className="mt-3">
        <div className="line-clamp-2 text-sm text-zinc-900">{p.title}</div>
        <div className="mt-1 text-xs text-zinc-500">{p.shopName}</div>
        <div className="mt-2 text-sm text-zinc-900 font-semibold">HK$ {p.price}</div>
      </div>
    </Link>
  );
}
