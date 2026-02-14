"use client";

import type { ProductForBioLink } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";
import LootCard from "./LootCard";

type Props = {
  products: ProductForBioLink[];
  currency?: string;
  onAdd: (product: ProductForBioLink) => void;
  onTap?: (product: ProductForBioLink) => void;
  onImageTap?: (images: string[], startIndex: number) => void;
};

export default function FeaturedSection({ products, currency, onAdd, onTap, onImageTap }: Props) {
  const tmpl = useTemplate();

  if (products.length === 0) return null;

  return (
    <section className="py-6">
      <div className="px-5 mb-4">
        <h2 className="text-base font-bold tracking-wide uppercase" style={{ color: tmpl.text, fontFamily: tmpl.headingFont }}>
          Featured
        </h2>
        <p className="text-xs mt-0.5" style={{ color: tmpl.subtext }}>精選商品</p>
      </div>

      <div className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide snap-x snap-mandatory">
        {products.map((p, i) => (
          <div key={p.id} className="snap-start">
            <LootCard product={p} index={i} currency={currency} onAdd={onAdd} onTap={onTap} onImageTap={onImageTap} />
          </div>
        ))}
        {/* Right padding spacer */}
        <div className="flex-shrink-0 w-1" />
      </div>
    </section>
  );
}
