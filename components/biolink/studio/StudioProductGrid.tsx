"use client";

import type { ProductForBioLink } from "@/lib/biolink-helpers";
import StudioProductCard from "./StudioProductCard";

type Props = {
  products: ProductForBioLink[];
  currency: string;
  onTap: (product: ProductForBioLink) => void;
  searchQuery?: string;
};

export default function StudioProductGrid({
  products,
  currency,
  onTap,
  searchQuery,
}: Props) {
  const filtered = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  if (filtered.length === 0) {
    return (
      <div className="px-5 py-24 text-center">
        <p className="text-[13px] uppercase tracking-[0.18em] text-wlx-stone">
          {searchQuery ? "No matches" : "Inventory restocking soon"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-8 py-10 sm:py-14">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4 lg:gap-x-8">
        {filtered.map((product) => (
          <StudioProductCard
            key={product.id}
            product={product}
            currency={currency}
            onTap={onTap}
          />
        ))}
      </div>
    </div>
  );
}
