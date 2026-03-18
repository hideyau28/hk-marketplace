"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, ShieldCheck, FileText, Lock } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import ProductSizeSelector from "@/components/ProductSizeSelector";
import VariantSelector, {
  type VariantData,
} from "@/components/VariantSelector";
import { useCurrency } from "@/lib/currency";
import type { Translations } from "@/lib/translations";
import {
  isWishlisted as checkWishlisted,
  toggleWishlist,
} from "@/lib/wishlist";

type ProductDetailClientProps = {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number | null;
    image: string;
    images?: string[];
    brand: string;
    category?: string | null;
    sizeSystem: string | null;
    sizes: any;
    stock: number;
    isKids?: boolean;
    promotionBadges?: string[];
    variants?: VariantData[];
  };
  locale: string;
  t: Translations;
};

// Badge color mapping for product detail page
const BADGE_COLORS: Record<
  string,
  { className: string; style?: React.CSSProperties }
> = {
  店長推介: {
    className: "text-white",
    style: { backgroundColor: "var(--tmpl-accent, #2D6A4F)" },
  },
  今期熱賣: { className: "bg-orange-500 text-white" },
  新品上架: { className: "bg-blue-500 text-white" },
  限時優惠: { className: "bg-red-500 text-white" },
  人氣之選: { className: "bg-purple-500 text-white" },
  快將售罄: { className: "bg-red-600 text-white" },
};
const DEFAULT_BADGE = { className: "bg-zinc-500 text-white" };

export default function ProductDetailClient({
  product,
  locale,
  t,
}: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(
    null,
  );
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();
  const { format } = useCurrency();

  const hasVariants = product.variants && product.variants.length > 0;

  // Check wishlist on mount
  useEffect(() => {
    setIsWishlisted(checkWishlisted(product.id));
  }, [product.id]);

  // Derive display values from selected variant or product
  const displayPrice = selectedVariant
    ? (selectedVariant.price ?? product.price)
    : product.price;
  const displayOriginalPrice: number | null = selectedVariant
    ? selectedVariant.price != null
      ? (selectedVariant.compareAtPrice ?? null)
      : (product.originalPrice ?? null)
    : (product.originalPrice ?? null);
  const displayStock = selectedVariant ? selectedVariant.stock : product.stock;

  // Calculate discount percentage if on sale
  const isOnSale =
    displayOriginalPrice != null && displayOriginalPrice > displayPrice;
  const discountPercent = isOnSale
    ? Math.round((1 - displayPrice / displayOriginalPrice!) * 100)
    : 0;

  const handleSizeSelect = (size: string, system: string) => {
    setSelectedSize(size);
    setSelectedSystem(system);
  };

  const handleVariantSelect = useCallback((variant: VariantData | null) => {
    setSelectedVariant(variant);
    // Notify carousel of variant image change
    window.dispatchEvent(
      new CustomEvent("variantImageChange", {
        detail: { imageUrl: variant?.imageUrl || null },
      }),
    );
  }, []);

  const handleAddToCart = () => {
    if (displayStock <= 0) {
      showToast(t.toast.outOfStock);
      return;
    }

    if (hasVariants) {
      // Variant product: require variant selection
      if (!selectedVariant) {
        showToast(locale === "zh-HK" ? "請選擇款式" : "Please select options");
        return;
      }
      addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        title: product.title,
        unitPrice: displayPrice,
        imageUrl: selectedVariant.imageUrl || product.image,
      });
    } else {
      // Non-variant product: use existing size logic
      if (product.sizes && !selectedSize) {
        showToast(t.product.pleaseSelectSize);
        return;
      }
      addToCart({
        productId: product.id,
        title: product.title,
        unitPrice: product.price,
        imageUrl: product.image,
        size: selectedSize || undefined,
        sizeSystem: selectedSystem || undefined,
      });
    }

    setAdded(true);
    showToast(t.product.addedToCart);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    const newState = toggleWishlist(product.id);
    setIsWishlisted(newState);
  };

  // Determine if Add to Cart should be disabled
  const needsSize = !hasVariants && !!product.sizes;
  const needsVariant = hasVariants;
  const isDisabled =
    displayStock <= 0 ||
    (needsSize && !selectedSize) ||
    (needsVariant && !selectedVariant);

  // Get translated button text for disabled state
  const selectSizeFirstText =
    locale === "zh-HK" ? "請先選擇尺碼" : "Select a size";
  const selectVariantFirstText =
    locale === "zh-HK" ? "請選擇款式" : "Select options";

  return (
    <div className="space-y-4">
      {/* Brand */}
      <div className="text-zinc-500 text-sm dark:text-zinc-400">
        {product.brand}
      </div>

      {/* Title */}
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
        {product.title}
      </h1>

      {/* Promotion Badges - show all badges */}
      {(() => {
        const badges: string[] = [];
        if (product.promotionBadges && product.promotionBadges.length > 0) {
          badges.push(...product.promotionBadges);
        }
        // Auto-add "快將售罄" if stock <= 5 and > 0
        if (
          product.stock > 0 &&
          product.stock <= 5 &&
          !badges.includes("快將售罄")
        ) {
          badges.push("快將售罄");
        }
        if (badges.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => {
              const bc = BADGE_COLORS[badge] || DEFAULT_BADGE;
              return (
                <span
                  key={idx}
                  className={`rounded-full px-3 py-1 text-sm font-medium ${bc.className}`}
                  style={bc.style}
                >
                  {badge === "快將售罄" ? `🔥 ${badge}` : badge}
                </span>
              );
            })}
          </div>
        );
      })()}

      {/* Price */}
      <div className="flex items-center gap-2 flex-wrap">
        {isOnSale ? (
          <>
            <span className="text-lg text-zinc-400 line-through mr-2">
              {format(displayOriginalPrice!)}
            </span>
            <span className="text-2xl font-bold text-red-600">
              {format(displayPrice)}
            </span>
            <span className="bg-red-500 text-white text-sm font-medium px-2 py-0.5 rounded-full ml-2">
              -{discountPercent}%
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {format(displayPrice)}
          </span>
        )}
      </div>

      {/* Stock urgency warning */}
      {displayStock != null && displayStock > 0 && displayStock <= 5 && (
        <div className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          {locale === "zh-HK" ? "快將售罄" : "Almost Gone"}
        </div>
      )}

      {/* Trust badges */}
      <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
        <div>
          {locale === "zh-HK" ? "✓ 正品保證" : "✓ Authenticity Guaranteed"}
        </div>
        <div>
          {locale === "zh-HK"
            ? "✓ 訂單滿 $600 免運費"
            : "✓ Secure international shipping"}
        </div>
      </div>

      {!hasVariants &&
        (displayStock <= 0 ? (
          <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {t.product.outOfStock}
          </div>
        ) : displayStock <= 5 ? (
          <div className="text-sm font-semibold text-orange-600">
            🔥 快將售罄 - 僅剩 {displayStock} 件
          </div>
        ) : null)}

      {/* Variant Selector (when product has variants) */}
      {hasVariants && (
        <VariantSelector
          variants={product.variants!}
          locale={locale}
          onVariantSelect={handleVariantSelect}
        />
      )}

      {/* Size Selector (when no variants, fallback to existing behavior) */}
      {!hasVariants && product.sizes && (
        <ProductSizeSelector
          sizeSystem={product.sizeSystem}
          sizes={product.sizes}
          locale={locale}
          isKids={product.isKids || false}
          onSizeSelect={handleSizeSelect}
          selectedSize={selectedSize}
          selectedSystem={selectedSystem}
          t={t}
          category={product.category || undefined}
        />
      )}

      {/* Trust signals below selectors */}
      <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <ShieldCheck
            size={16}
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span>
            {locale === "zh-HK" ? "正品鑑定保證" : "Authenticity Guaranteed"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <FileText
            size={16}
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span>
            {locale === "zh-HK"
              ? "附正品鑑定證書"
              : "Certificate of Authenticity included"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
          <Lock
            size={16}
            className="shrink-0 text-emerald-600 dark:text-emerald-400"
          />
          <span>{locale === "zh-HK" ? "安全結帳" : "Secure checkout"}</span>
        </div>
      </div>

      {/* Desktop Add to Cart + Wishlist */}
      <div className="hidden md:flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`flex-1 rounded-lg py-3.5 text-base font-semibold ${
            isDisabled
              ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              : "text-white hover:brightness-90"
          }`}
          style={
            !isDisabled
              ? { backgroundColor: "var(--tmpl-accent, #2D6A4F)" }
              : undefined
          }
        >
          {added
            ? t.product.addedToCart
            : isDisabled && needsVariant && !selectedVariant
              ? selectVariantFirstText
              : isDisabled && needsSize
                ? selectSizeFirstText
                : t.product.addToCart}
        </button>
        <button
          onClick={handleToggleWishlist}
          className={`w-14 h-14 border rounded-lg flex items-center justify-center transition-colors ${
            isWishlisted
              ? "border-red-300 bg-red-50 dark:bg-red-900/20"
              : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={24}
            className={
              isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400"
            }
          />
        </button>
      </div>

      {/* Mobile Fixed Bottom Bar - Add to Cart + Wishlist */}
      <div className="fixed bottom-[56px] left-0 right-0 border-t border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 md:hidden z-40 px-4 py-3">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`flex-1 rounded-lg py-3.5 text-base font-semibold ${
              isDisabled
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : "text-white hover:brightness-90"
            }`}
            style={
              !isDisabled
                ? { backgroundColor: "var(--tmpl-accent, #2D6A4F)" }
                : undefined
            }
          >
            {added
              ? t.product.addedToCart
              : isDisabled && needsVariant && !selectedVariant
                ? selectVariantFirstText
                : isDisabled && needsSize
                  ? selectSizeFirstText
                  : t.product.addToCart}
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`w-14 h-14 border rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isWishlisted
                ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                : "border-zinc-300 dark:border-zinc-600"
            }`}
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <Heart
              size={24}
              className={
                isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400"
              }
            />
          </button>
        </div>
      </div>
    </div>
  );
}
