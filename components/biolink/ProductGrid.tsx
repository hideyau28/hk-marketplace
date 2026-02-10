"use client";

import type { ProductForBioLink } from "@/lib/biolink-helpers";
import BioProductCard from "./BioProductCard";

type Props = {
  products: ProductForBioLink[];
  onAdd: (product: ProductForBioLink) => void;
  onImageTap?: (images: string[], startIndex: number) => void;
};

export default function ProductGrid({ products, onAdd, onImageTap }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="bg-[#f5f5f0] px-4 py-6">
      <h2 className="text-zinc-900 text-base font-bold mb-4">全部商品</h2>
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <BioProductCard key={p.id} product={p} onAdd={onAdd} onImageTap={onImageTap} />
        ))}
      </div>
    </section>
  );
}
