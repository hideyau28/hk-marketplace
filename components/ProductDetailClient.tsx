"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import ProductSizeSelector from "@/components/ProductSizeSelector";
import { useCurrency } from "@/lib/currency";
import type { Translations } from "@/lib/translations";

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
  };
  locale: string;
  t: Translations;
};

// Wishlist helpers
function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("wishlist", JSON.stringify(ids));
}

export default function ProductDetailClient({ product, locale, t }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { showToast } = useToast();
  const { format } = useCurrency();

  // Check wishlist on mount
  useEffect(() => {
    const wishlist = getWishlist();
    setIsWishlisted(wishlist.includes(product.id));
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
    const wishlist = getWishlist();
    if (isWishlisted) {
      // Remove from wishlist
      const newWishlist = wishlist.filter((id) => id !== product.id);
      saveWishlist(newWishlist);
      setIsWishlisted(false);
    } else {
      // Add to wishlist
      wishlist.push(product.id);
      saveWishlist(wishlist);
      setIsWishlisted(true);
    }
    // Dispatch event for other components
    window.dispatchEvent(new Event("wishlistUpdated"));
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

      {/* Description */}
      <div className="text-zinc-600 text-sm leading-6 dark:text-zinc-400">
        Placeholder description. Shipping calculated at checkout.
      </div>

      {/* Size Selector */}
      {product.sizes && (
        <ProductSizeSelector
          sizeSystem={product.sizeSystem}
          sizes={product.sizes}
          locale={locale}
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
