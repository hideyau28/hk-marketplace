"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import { getCoverTemplate } from "@/lib/cover-templates";
import { TemplateProvider } from "@/lib/template-context";
import { getGoogleFontsUrl } from "@/lib/fonts";
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
  const tmpl = useMemo(() => getCoverTemplate(tenant.coverTemplate), [tenant.coverTemplate]);
  const fontsUrl = useMemo(() => getGoogleFontsUrl(tmpl), [tmpl]);

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

  // Tap 產品卡 → 開 product sheet
  const handleProductTap = useCallback(
    (product: ProductForBioLink) => {
      setSheetProduct(product);
    },
    []
  );

  // Tap 圖片 → 開 lightbox
  const handleImageTap = useCallback(
    (images: string[], startIndex: number, videoUrl?: string | null) => {
      setLightbox({ images, startIndex, videoUrl });
    },
    []
  );

  return (
    <TemplateProvider value={tmpl}>
    {/* Google Fonts for current template */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link rel="stylesheet" href={fontsUrl} />
    <div
      className="min-h-screen max-w-[480px] mx-auto relative overflow-x-hidden"
      style={{ backgroundColor: tmpl.bg, fontFamily: `'${tmpl.bodyFont}', sans-serif` }}
    >
      <StickyHeader tenant={tenant} cartCount={cartCount} onCartClick={() => cartCount > 0 && setShowCart(true)} />
      <CoverPhoto url={tenant.coverPhoto} />
      <ProfileSection tenant={tenant} />

      {/* Search bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Featured loot cards */}
      {featured.length > 0 && (
        <FeaturedSection products={featured} currency={currency} onAdd={handleCardAdd} onTap={handleProductTap} onImageTap={handleImageTap} />
      )}

      {/* Spacer (no longer a gradient since bg is unified) */}
      {featured.length > 0 && <div className="h-6" />}

      {/* Light zone — Product grid */}
      <ProductGrid products={grid} currency={currency} onAdd={handleCardAdd} onTap={handleProductTap} searchQuery={searchQuery} />

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
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-slide-up" style={{ backgroundColor: tmpl.card, color: tmpl.text }}>
          {toast}
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 pb-20 text-center border-t" style={{ backgroundColor: tmpl.bg, borderColor: `${tmpl.subtext}20` }}>
        <span className="text-[11px] font-medium" style={{ color: tmpl.subtext }}>
          Powered by{" "}
        </span>
        <a href="/" className="text-[11px] font-bold hover:underline" style={{ color: tmpl.accent }}>Wowlix</a>
      </footer>
    </div>
    </TemplateProvider>
  );
}
