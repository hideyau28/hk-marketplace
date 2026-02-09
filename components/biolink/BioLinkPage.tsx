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
import CheckoutPanel from "./CheckoutPanel";
import OrderConfirmation from "./OrderConfirmation";

type CartItem = {
  id: string;
  title: string;
  price: number;
  variant: string | null;
  variantId?: string;
  qty: number;
  imageUrl: string | null;
};

type OrderResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  storeName: string;
  whatsapp: string | null;
  fpsInfo?: { accountName: string | null; id: string | null; qrCode: string | null };
  paymeInfo?: { link: string | null; qrCode: string | null };
  items?: Array<{ name: string; qty: number; unitPrice: number }>;
  customer?: { name: string; phone: string };
  delivery?: { method: string; label: string };
  paymentMethod?: string;
};

type Props = {
  tenant: TenantForBioLink;
  products: ProductForBioLink[];
};

export default function BioLinkPage({ tenant, products }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const { featured, grid } = splitProducts(products);

  const addToCart = useCallback(
    (product: ProductForBioLink, variant: string | null) => {
      // Look up variantId from product's variants by name
      let variantId: string | undefined;
      if (variant && product.variants) {
        const match = product.variants.find((v) => v.name === variant);
        if (match) variantId = match.id;
      }

      setCart((prev) => {
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
            variantId,
            qty: 1,
            imageUrl: product.imageUrl,
          },
        ];
      });
    },
    [products]
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleOrderComplete = (result: OrderResult) => {
    setCheckoutOpen(false);
    setOrderResult(result);
    setCart([]); // Clear cart after successful order
  };

  const handleConfirmationClose = () => {
    setOrderResult(null);
  };

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
          onCheckout={() => setCheckoutOpen(true)}
        />
      ) : (
        <WhatsAppFAB whatsapp={tenant.whatsapp} />
      )}

      {/* Checkout panel (bottom sheet) */}
      <CheckoutPanel
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        total={cartTotal}
        tenant={tenant}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order confirmation (FPS/PayMe payment info) */}
      {orderResult && (
        <OrderConfirmation
          order={orderResult}
          onClose={handleConfirmationClose}
        />
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
