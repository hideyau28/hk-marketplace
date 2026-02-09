"use client";

import { useState, useCallback } from "react";
import type { ProductForBioLink, TenantForBioLink } from "@/lib/biolink-helpers";
import { splitProducts } from "@/lib/biolink-helpers";
import StickyHeader from "./StickyHeader";
import CoverPhoto from "./CoverPhoto";
import ProfileSection from "./ProfileSection";
import FeaturedSection from "./FeaturedSection";
import ProductGrid from "./ProductGrid";
import CartBar from "./CartBar";
import WhatsAppFAB from "./WhatsAppFAB";

type CartItem = {
  id: string;
  title: string;
  price: number;
  variant: string | null;
  qty: number;
  imageUrl: string | null;
};

type Props = {
  tenant: TenantForBioLink;
  products: ProductForBioLink[];
};

export default function BioLinkPage({ tenant, products }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const { featured, grid } = splitProducts(products);

  const addToCart = useCallback(
    (product: ProductForBioLink, variant: string | null) => {
      setCart((prev) => {
        const key = `${product.id}::${variant ?? ""}`;
        const exists = prev.find(
          (i) => i.id === product.id && i.variant === variant
        );
        if (exists) {
          return prev.map((i) =>
            i.id === product.id && i.variant === variant
              ? { ...i, qty: i.qty + 1 }
              : i
          );
        }
        return [
          ...prev,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            variant,
            qty: 1,
            imageUrl: product.imageUrl,
          },
        ];
      });
    },
    []
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="min-h-screen max-w-[480px] mx-auto relative overflow-x-hidden bg-[#0f0f0f]">
      <StickyHeader tenant={tenant} cartCount={cartCount} />
      <CoverPhoto url={tenant.coverPhoto} brandColor={tenant.brandColor} />
      <ProfileSection tenant={tenant} />

      {/* Dark zone — Featured loot cards */}
      {featured.length > 0 && (
        <FeaturedSection products={featured} onAdd={addToCart} />
      )}

      {/* Transition gradient: dark → light */}
      <div
        className="h-20"
        style={{
          background:
            "linear-gradient(180deg, #0f0f0f 0%, #f5f5f0 100%)",
        }}
      />

      {/* Light zone — Product grid */}
      <ProductGrid products={grid} onAdd={addToCart} />

      {/* Cart bar or WhatsApp FAB */}
      {cartCount > 0 ? (
        <CartBar
          count={cartCount}
          total={cartTotal}
          whatsapp={tenant.whatsapp}
        />
      ) : (
        <WhatsAppFAB whatsapp={tenant.whatsapp} />
      )}

      {/* Footer */}
      <footer className="bg-[#f5f5f0] py-4 pb-20 text-center border-t border-black/[0.04]">
        <span className="text-[11px] text-zinc-400 font-medium">
          Powered by{" "}
        </span>
        <span className="text-[11px] text-[#FF9500] font-bold">Wowlix</span>
      </footer>
    </div>
  );
}
