"use client";

import { useState, useCallback, useEffect } from "react";
import type {
  ProductForBioLink,
  TenantForBioLink,
  DeliveryOption,
  OrderConfirmConfig,
} from "@/lib/biolink-helpers";
import {
  splitProducts,
  getVisibleVariants,
  isDualVariant,
  formatPrice,
  DEFAULT_DELIVERY_OPTIONS,
  DEFAULT_ORDER_CONFIRM,
} from "@/lib/biolink-helpers";
import {
  loadCart,
  addToCart as bioAddToCart,
  updateQty as bioUpdateQty,
  removeFromCart as bioRemoveFromCart,
  clearCart as bioClearCart,
  getCartCount,
  getCartTotal,
  type BioCart,
  type BioCartItem,
} from "@/lib/biolink-cart";
import { getTheme } from "@/lib/biolink-themes";
import StickyHeader from "./StickyHeader";
import CoverPhoto from "./CoverPhoto";
import ProfileSection from "./ProfileSection";
import SearchBar from "./SearchBar";
import FeaturedSection from "./FeaturedSection";
import ProductGrid from "./ProductGrid";
import CartBar from "./CartBar";
import WhatsAppFAB from "./WhatsAppFAB";
import CartSheet from "./CartSheet";
import CheckoutPage from "./CheckoutPage";
import type { OrderResult } from "./CheckoutPage";
import OrderConfirmation from "./OrderConfirmation";
import ProductSheet from "./ProductSheet";
import ImageLightbox from "./ImageLightbox";

type Props = {
  tenant: TenantForBioLink;
  products: ProductForBioLink[];
};

export default function BioLinkPage({ tenant, products }: Props) {
  const [cart, setCart] = useState<BioCart>({ tenantId: tenant.id, items: [] });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [sheetProduct, setSheetProduct] = useState<ProductForBioLink | null>(null);
  const [lightbox, setLightbox] = useState<{ images: string[]; startIndex: number; videoUrl?: string | null } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currency = tenant.currency || "HKD";
  const deliveryOptions: DeliveryOption[] = tenant.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
  const orderConfirmMessage: OrderConfirmConfig = tenant.orderConfirmMessage || DEFAULT_ORDER_CONFIRM;

  // Get theme based on template
  const theme = getTheme(tenant.template);

  // Filter products by search query
  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const { featured, grid } = splitProducts(filteredProducts);

  // Load cart from localStorage on mount
  useEffect(() => {
    setCart(loadCart(tenant.id));
  }, [tenant.id]);

  // Toast 自動消失
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(timer);
  }, [toast]);

  const cartCount = getCartCount(cart);
  const cartTotal = getCartTotal(cart);

  // Auto-close cart sheet when empty
  useEffect(() => {
    if (showCart && cart.items.length === 0) {
      setShowCart(false);
    }
  }, [cart.items.length, showCart]);

  const handleAddToCart = useCallback(
    (product: ProductForBioLink, variant: string | null, qty: number = 1) => {
      let variantId: string | undefined;
      if (variant && product.variants) {
        const match = product.variants.find((v) => v.name === variant);
        if (match) variantId = match.id;
      }

      const item: BioCartItem = {
        productId: product.id,
        name: product.title,
        price: product.price,
        image: product.imageUrl,
        variant: variant || undefined,
        variantLabel: variant ? variant.replace(/\|/g, " · ") : undefined,
        variantId,
        qty,
      };

      setCart((prev) => bioAddToCart(prev, item));
    },
    []
  );

  const handleUpdateQty = useCallback(
    (productId: string, variant: string | undefined, delta: number) => {
      setCart((prev) => bioUpdateQty(prev, productId, variant, delta));
    },
    []
  );

  const handleRemoveItem = useCallback(
    (productId: string, variant: string | undefined) => {
      setCart((prev) => bioRemoveFromCart(prev, productId, variant));
    },
    []
  );

  const handleClearCart = useCallback(() => {
    setCart(bioClearCart(tenant.id));
  }, [tenant.id]);

  const handleOrderComplete = (result: OrderResult) => {
    setShowCheckout(false);
    setShowCart(false);
    setOrderResult(result);
    setCart(bioClearCart(tenant.id));
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
        handleAddToCart(product, null);
        setToast("已加入購物車");
      } else {
        setSheetProduct(product);
      }
    },
    [handleAddToCart]
  );

  // ProductSheet 加入購物車
  const handleSheetAdd = useCallback(
    (product: ProductForBioLink, variant: string | null, qty: number) => {
      handleAddToCart(product, variant, qty);
      setSheetProduct(null);
      setToast("已加入購物車");
    },
    [handleAddToCart]
  );

  // Tap 圖片 → 開 lightbox
  const handleImageTap = useCallback(
    (images: string[], startIndex: number, videoUrl?: string | null) => {
      setLightbox({ images, startIndex, videoUrl });
    },
    []
  );

  return (
    <div
      className="min-h-screen max-w-[480px] mx-auto relative overflow-x-hidden"
      style={{
        backgroundColor: theme.background,
        ["--brand-color" as any]: tenant.brandColor || "#FF9500",
      }}
    >
      <StickyHeader tenant={tenant} cartCount={cartCount} onCartClick={() => cartCount > 0 && setShowCart(true)} />
      <CoverPhoto url={tenant.coverPhoto} brandColor={tenant.brandColor} coverTemplate={tenant.coverTemplate} />
      <ProfileSection tenant={tenant} />

      {/* Search bar */}
      <div style={{ backgroundColor: theme.darkZone }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Dark zone — Featured loot cards */}
      {featured.length > 0 && (
        <div style={{ backgroundColor: theme.darkZone }}>
          <FeaturedSection
            products={featured}
            currency={currency}
            onAdd={handleCardAdd}
            onImageTap={handleImageTap}
            textColor={theme.textPrimary}
            textSecondary={theme.textSecondary}
          />
        </div>
      )}

      {/* Transition gradient: dark → light */}
      <div
        className="h-20"
        style={{
          background: theme.gradient,
        }}
      />

      {/* Light zone — Product grid */}
      <div style={{ backgroundColor: theme.lightZone }}>
        <ProductGrid
          products={grid}
          currency={currency}
          onAdd={handleCardAdd}
          onImageTap={handleImageTap}
          searchQuery={searchQuery}
          textColor={theme.id === "dark" ? "#FFFFFF" : "#18181B"}
        />
      </div>

      {/* Cart bar or WhatsApp FAB */}
      {cartCount > 0 ? (
        <CartBar
          count={cartCount}
          total={cartTotal}
          currency={currency}
          whatsapp={tenant.whatsapp}
          onCheckout={() => setShowCart(true)}
        />
      ) : (
        <WhatsAppFAB whatsapp={tenant.whatsapp} cart={cart.items} />
      )}

      {/* Cart sheet (bottom sheet) */}
      <CartSheet
        open={showCart}
        onClose={() => setShowCart(false)}
        items={cart.items}
        currency={currency}
        freeShippingThreshold={tenant.freeShippingThreshold}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />

      {/* Checkout page (full screen) */}
      <CheckoutPage
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart.items}
        tenant={tenant}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order confirmation */}
      {orderResult && (
        <OrderConfirmation
          order={orderResult}
          onClose={handleConfirmationClose}
          orderConfirmMessage={orderConfirmMessage}
        />
      )}

      {/* Product bottom sheet (variant selection) */}
      {sheetProduct && (
        <ProductSheet
          product={sheetProduct}
          currency={currency}
          onClose={() => setSheetProduct(null)}
          onAddToCart={handleSheetAdd}
        />
      )}

      {/* Image lightbox */}
      {lightbox && (
        <ImageLightbox
          images={lightbox.images}
          startIndex={lightbox.startIndex}
          videoUrl={lightbox.videoUrl}
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
      <footer
        className="py-4 pb-20 text-center border-t"
        style={{
          backgroundColor: theme.lightZone,
          borderColor: theme.id === "minimal" ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.1)",
        }}
      >
        <span className="text-[11px] font-medium" style={{ color: theme.textSecondary }}>
          Powered by{" "}
        </span>
        <a href="/" className="text-[11px] text-[#FF9500] font-bold hover:underline">Wowlix</a>
      </footer>
    </div>
  );
}
