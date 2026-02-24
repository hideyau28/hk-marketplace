"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, locales } from "@/lib/i18n";
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
import { getFontVar } from "@/lib/fonts";
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

function swapLocale(pathname: string, nextLocale: Locale) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${nextLocale}`;
  if ((locales as readonly string[]).includes(parts[0])) {
    parts[0] = nextLocale;
    return "/" + parts.join("/");
  }
  // Path-based route without locale prefix (e.g. /maysshop) — prepend locale
  return "/" + nextLocale + "/" + parts.join("/");
}

type Props = {
  tenant: TenantForBioLink;
  products: ProductForBioLink[];
};

export default function BioLinkPage({ tenant, products }: Props) {
  const tmpl = useMemo(
    () => getCoverTemplate(tenant.coverTemplate),
    [tenant.coverTemplate],
  );
  const pathname = usePathname() || "/en";
  const locale = (pathname.split("/").filter(Boolean)[0] || "en") as Locale;

  const [cart, setCart] = useState<BioCart>({ tenantId: tenant.id, items: [] });
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [sheetProduct, setSheetProduct] = useState<ProductForBioLink | null>(
    null,
  );
  const [lightbox, setLightbox] = useState<{
    images: string[];
    startIndex: number;
    videoUrl?: string | null;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const currency = tenant.currency || "HKD";
  const deliveryOptions: DeliveryOption[] =
    tenant.deliveryOptions || DEFAULT_DELIVERY_OPTIONS;
  const orderConfirmMessage: OrderConfirmConfig =
    tenant.orderConfirmMessage || DEFAULT_ORDER_CONFIRM;

  // Filter products by search query
  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : products;

  const { grid: allGrid } = splitProducts(products);
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
    [],
  );

  const handleUpdateQty = useCallback(
    (productId: string, variant: string | undefined, delta: number) => {
      setCart((prev) => bioUpdateQty(prev, productId, variant, delta));
    },
    [],
  );

  const handleRemoveItem = useCallback(
    (productId: string, variant: string | undefined) => {
      setCart((prev) => bioRemoveFromCart(prev, productId, variant));
    },
    [],
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
    [handleAddToCart],
  );

  // ProductSheet 加入購物車
  const handleSheetAdd = useCallback(
    (product: ProductForBioLink, variant: string | null, qty: number) => {
      handleAddToCart(product, variant, qty);
      setSheetProduct(null);
      setToast("已加入購物車");
    },
    [handleAddToCart],
  );

  // Tap 產品卡 → 開 product sheet
  const handleProductTap = useCallback((product: ProductForBioLink) => {
    setSheetProduct(product);
  }, []);

  // Tap 圖片 → 開 lightbox
  const handleImageTap = useCallback(
    (images: string[], startIndex: number, videoUrl?: string | null) => {
      setLightbox({ images, startIndex, videoUrl });
    },
    [],
  );

  return (
    <TemplateProvider value={tmpl}>
      <div
        className="min-h-screen max-w-[480px] mx-auto relative overflow-x-hidden"
        style={{
          backgroundColor: tmpl.bg,
          fontFamily: `${getFontVar(tmpl.bodyFont)}, sans-serif`,
        }}
      >
        <StickyHeader
          tenant={tenant}
          cartCount={cartCount}
          onCartClick={() => cartCount > 0 && setShowCart(true)}
        />

        {/* Language toggle — always visible at top-right over cover */}
        <Link
          href={swapLocale(pathname, locale === "zh-HK" ? "en" : "zh-HK")}
          className="absolute top-3 right-3 z-40 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm transition-colors"
          style={{ color: tmpl.subtext, backgroundColor: `${tmpl.bg}80` }}
        >
          {locale === "zh-HK" ? "EN" : "繁"}
        </Link>

        <CoverPhoto url={tenant.coverPhoto} />
        <ProfileSection tenant={tenant} />

        {/* Search bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Featured loot cards */}
        {featured.length > 0 && (
          <FeaturedSection
            products={featured}
            currency={currency}
            onAdd={handleCardAdd}
            onTap={handleProductTap}
            onImageTap={handleImageTap}
          />
        )}

        {/* Spacer (no longer a gradient since bg is unified) */}
        {featured.length > 0 && <div className="h-6" />}

        {/* Light zone — Product grid */}
        <ProductGrid
          products={grid}
          allProducts={allGrid}
          currency={currency}
          onAdd={handleCardAdd}
          onTap={handleProductTap}
          searchQuery={searchQuery}
        />

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
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-full text-sm font-medium shadow-lg animate-slide-up"
            style={{ backgroundColor: tmpl.card, color: tmpl.text }}
          >
            {toast}
          </div>
        )}

        {/* Footer — growth CTA */}
        <footer
          className="py-5 pb-20 text-center border-t"
          style={{ backgroundColor: tmpl.bg, borderColor: `${tmpl.subtext}20` }}
        >
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] font-bold transition-opacity hover:opacity-80 active:opacity-60"
            style={{ color: tmpl.accent }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            用 WoWlix 免費開店 →
          </a>
        </footer>
      </div>
    </TemplateProvider>
  );
}
