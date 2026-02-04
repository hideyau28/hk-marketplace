"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import ProductSizeSelector from "@/components/ProductSizeSelector";
import { useCurrency } from "@/lib/currency";
import type { Translations } from "@/lib/translations";
import { isWishlisted as checkWishlisted, toggleWishlist } from "@/lib/wishlist";

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
  };
  locale: string;
  t: Translations;
};

// Badge color mapping for product detail page
const BADGE_COLORS: Record<string, string> = {
  "店長推介": "bg-[#6B7A2F] text-white",
  "今期熱賣": "bg-orange-500 text-white",
  "新品上架": "bg-blue-500 text-white",
  "限時優惠": "bg-red-500 text-white",
  "人氣之選": "bg-purple-500 text-white",
  "快將售罄": "bg-red-600 text-white",
};

export default function ProductDetailClient({ product, locale, t }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();
  const { format } = useCurrency();

  // Check wishlist on mount
  useEffect(() => {
    setIsWishlisted(checkWishlisted(product.id));
  }, [product.id]);

  // Calculate discount percentage if on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const handleSizeSelect = (size: string, system: string) => {
    setSelectedSize(size);
    setSelectedSystem(system);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast(t.toast.outOfStock);
      return;
    }
    // Check if size is required
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

    setAdded(true);
    showToast(t.product.addedToCart);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    const newState = toggleWishlist(product.id);
    setIsWishlisted(newState);
  };

  // Determine if Add to Cart should be disabled (no size selected when required)
  const needsSize = !!product.sizes;
  const isDisabled = product.stock <= 0 || (needsSize && !selectedSize);

  // Get translated button text for disabled state
  const selectSizeFirstText = locale === "zh-HK" ? "請先選擇尺碼" : "Select a size";

  return (
    <div className="space-y-4">
      {/* Brand */}
      <div className="text-zinc-500 text-sm dark:text-zinc-400">{product.brand}</div>

      {/* Title */}
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{product.title}</h1>

      {/* Promotion Badges - show all badges */}
      {(() => {
        const badges: string[] = [];
        if (product.promotionBadges && product.promotionBadges.length > 0) {
          badges.push(...product.promotionBadges);
        }
        // Auto-add "快將售罄" if stock <= 5 and > 0
        if (product.stock > 0 && product.stock <= 5 && !badges.includes("快將售罄")) {
          badges.push("快將售罄");
        }
        if (badges.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`rounded-full px-3 py-1 text-sm font-medium ${BADGE_COLORS[badge] || "bg-zinc-500 text-white"}`}
              >
                {badge === "快將售罄" ? `🔥 ${badge}` : badge}
              </span>
            ))}
          </div>
        );
      })()}

      {/* Price */}
      <div className="flex items-center gap-2 flex-wrap">
        {isOnSale ? (
          <>
            <span className="text-lg text-zinc-400 line-through mr-2">{format(product.originalPrice!)}</span>
            <span className="text-2xl font-bold text-red-600">{format(product.price)}</span>
            <span className="bg-red-500 text-white text-sm font-medium px-2 py-0.5 rounded-full ml-2">-{discountPercent}%</span>
          </>
        ) : (
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{format(product.price)}</span>
        )}
      </div>

      {/* Trust badges */}
      <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400">
        <div>✓ 正品保證</div>
        <div>✓ 訂單滿 $600 免運費</div>
      </div>

      {product.stock <= 0 ? (
        <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t.product.outOfStock}</div>
      ) : product.stock <= 5 ? (
        <div className="text-sm font-semibold text-orange-600">🔥 快將售罄 - 僅剩 {product.stock} 件</div>
      ) : null}


      {/* Size Selector */}
      {product.sizes && (
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

      {/* Desktop Add to Cart + Wishlist */}
      <div className="hidden md:flex gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`flex-1 rounded-lg py-3.5 text-base font-semibold ${
            isDisabled
              ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              : "bg-olive-600 text-white hover:bg-olive-700"
          }`}
        >
          {added ? t.product.addedToCart : (isDisabled && needsSize ? selectSizeFirstText : t.product.addToCart)}
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
            className={isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400"}
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
                : "bg-olive-600 text-white hover:bg-olive-700"
            }`}
          >
            {added ? t.product.addedToCart : (isDisabled && needsSize ? selectSizeFirstText : t.product.addToCart)}
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`w-14 h-14 border rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isWishlisted
                ? "border-red-300 bg-red-50 dark:bg-red-900/20"
                : "border-zinc-300 dark:border-zinc-600"
            }`}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={24}
              className={isWishlisted ? "text-red-500 fill-red-500" : "text-zinc-400"}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
