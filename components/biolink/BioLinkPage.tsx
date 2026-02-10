"use client";

import { useState, useCallback, useEffect } from "react";
import type { ProductForBioLink, TenantForBioLink } from "@/lib/biolink-helpers";
import {
  splitProducts,
  getVisibleVariants,
  getDualVariantData,
  isDualVariant,
} from "@/lib/biolink-helpers";
import StickyHeader from "./StickyHeader";
import CoverPhoto from "./CoverPhoto";
import ProfileSection from "./ProfileSection";
import FeaturedSection from "./FeaturedSection";
import ProductGrid from "./ProductGrid";
import CartBar from "./CartBar";
import WhatsAppFAB from "./WhatsAppFAB";
import CheckoutPanel from "./CheckoutPanel";
import OrderConfirmation from "./OrderConfirmation";
import ProductSheet from "./ProductSheet";
import ImageLightbox from "./ImageLightbox";

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
  const [sheetProduct, setSheetProduct] = useState<ProductForBioLink | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; startIndex: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { featured, grid } = splitProducts(products);

  // Toast 自動消失
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCart = useCallback(
    (product: ProductForBioLink, variant: string | null, qty: number = 1) => {
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
              ? { ...i, qty: i.qty + qty }
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
            qty,
            imageUrl: product.imageUrl,
          },
        ];
      });
    },
    [products]
  );

  const updateCartQty = useCallback(
    (productId: string, variant: string | null, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) => {
            if (item.id === productId && item.variant === variant) {
              const newQty = item.qty + delta;
              return newQty > 0 ? { ...item, qty: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    []
  );

  const removeFromCart = useCallback(
    (productId: string, variant: string | null) => {
      setCart((prev) =>
        prev.filter((i) => !(i.id === productId && i.variant === variant))
      );
    },
    []
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // 全部刪除後自動關閉 checkout panel
  useEffect(() => {
    if (checkoutOpen && cart.length === 0) {
      setCheckoutOpen(false);
    }
  }, [cart.length, checkoutOpen]);

  const handleOrderComplete = (result: OrderResult) => {
    setCheckoutOpen(false);
    setOrderResult(result);
    setCart([]); // Clear cart after successful order
  };

  const handleConfirmationClose = () => {
    setOrderResult(null);
  };

  // Card「+」按鈕 — 冇 variant 直接加入，有 variant 開 sheet
  const handleCardAdd = useCallback(
    (product: ProductForBioLink) => {
      const hasVariants = (() => {
        if (isDualVariant(product.sizes)) return true;
        const variants = getVisibleVariants(product);
        return variants !== null && variants.length > 0;
      })();

      if (!hasVariants) {
        addToCart(product, null);
        setToast("已加入購物車");
      } else {
        setSheetProduct(product);
      }
    },
    [addToCart]
  );

  // ProductSheet 加入購物車
  const handleSheetAdd = useCallback(
    (product: ProductForBioLink, variant: string | null, qty: number) => {
      addToCart(product, variant, qty);
      setSheetProduct(null);
      setToast("已加入購物車");
    },
    [addToCart]
  );

  // Tap 圖片 → 開 lightbox
  const handleImageTap = useCallback(
    (images: string[], startIndex: number) => {
      setLightbox({ images, startIndex });
    },
    []
  );

  return (
    <div className="min-h-screen max-w-[480px] mx-auto relative overflow-x-hidden bg-[#0f0f0f]">
      <StickyHeader tenant={tenant} cartCount={cartCount} />
      <CoverPhoto url={tenant.coverPhoto} brandColor={tenant.brandColor} />
      <ProfileSection tenant={tenant} />

      {/* Dark zone — Featured loot cards */}
      {featured.length > 0 && (
        <FeaturedSection products={featured} onAdd={handleCardAdd} onImageTap={handleImageTap} />
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
      <ProductGrid products={grid} onAdd={handleCardAdd} onImageTap={handleImageTap} />

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
        onUpdateQty={updateCartQty}
        onRemoveItem={removeFromCart}
      />

      {/* Order confirmation (FPS/PayMe payment info) */}
      {orderResult && (
        <OrderConfirmation
          order={orderResult}
          onClose={handleConfirmationClose}
        />
      )}

      {/* Product bottom sheet (variant selection) */}
      {sheetProduct && (
        <ProductSheet
          product={sheetProduct}
          onClose={() => setSheetProduct(null)}
          onAddToCart={handleSheetAdd}
        />
      )}

      {/* Image lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full bg-zinc-900/90 text-white text-sm font-medium shadow-lg animate-slide-up">
          {toast}
        </div>
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
