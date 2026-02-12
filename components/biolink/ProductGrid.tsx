"use client";

import type { ProductForBioLink } from "@/lib/biolink-helpers";
import BioProductCard from "./BioProductCard";

type Props = {
  products: ProductForBioLink[];
  currency?: string;
  onAdd: (product: ProductForBioLink) => void;
  onImageTap?: (images: string[], startIndex: number) => void;
  searchQuery?: string;
};

export default function ProductGrid({ products, currency, onAdd, onImageTap, searchQuery }: Props) {
  if (products.length === 0) {
    // 搜尋結果為空
    const emptyMessage = searchQuery ? "搵唔到商品" : "仲未有商品，快啲加第一件啦！";

    return (
      <section className="bg-[#f5f5f0] px-4 py-12">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-200 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <p className="text-zinc-500 text-sm font-medium">
            {emptyMessage}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f5f5f0] px-4 py-6">
      <h2 className="text-zinc-900 text-base font-bold mb-4">全部商品</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <BioProductCard key={p.id} product={p} currency={currency} onAdd={onAdd} onImageTap={onImageTap} />
        ))}
      </div>
    </section>
  );
}
