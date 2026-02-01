"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
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
    sizeSystem: string | null;
    sizes: any;
    stock: number;
  };
  locale: string;
  t: Translations;
};

export default function ProductDetailClient({ product, locale, t }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { showToast } = useToast();
  const { format } = useCurrency();

  // Calculate discount percentage if on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  const handleSizeSelect = (size: string, system: string) => {
    setSelectedSize(size);
    setSelectedSystem(system);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(prev + delta, product.stock)));
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast(t.toast.outOfStock);
      return;
    }
    // Check if size is required
    if (product.sizeSystem && !selectedSize) {
      showToast(t.product.pleaseSelectSize);
      return;
    }

    // Add to cart with size info (add quantity times)
    for (let i = 0; i < quantity; i++) {
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

  // Determine if Add to Cart should be disabled (no size selected when required)
  const needsSize = !!product.sizeSystem;
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

      {product.stock <= 0 ? (
        <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{t.product.outOfStock}</div>
      ) : product.stock < 5 ? (
        <div className="text-sm font-semibold text-red-600">{t.product.lowStock}</div>
      ) : null}

      {/* Description */}
      <div className="text-zinc-600 text-sm leading-6 dark:text-zinc-400">
        Placeholder description. Shipping calculated at checkout.
      </div>

      {/* Size Selector */}
      {product.sizeSystem && (
        <ProductSizeSelector
          sizeSystem={product.sizeSystem}
          sizes={product.sizes}
          locale={locale}
          onSizeSelect={handleSizeSelect}
          selectedSize={selectedSize}
          selectedSystem={selectedSystem}
          t={t}
        />
      )}

      {/* Quantity Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {t.product.quantity || (locale === "zh-HK" ? "數量" : "Quantity")}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleQuantityChange(-1)}
            disabled={quantity <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center text-lg font-semibold text-zinc-900 dark:text-zinc-100">{quantity}</span>
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={quantity >= product.stock}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Desktop Add to Cart Button */}
      <div className="hidden md:block pt-2">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`w-full rounded-full py-3 text-base font-semibold ${
            isDisabled
              ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              : "bg-olive-600 text-white hover:bg-olive-700"
          }`}
        >
          {added ? t.product.addedToCart : (isDisabled && needsSize ? selectSizeFirstText : t.product.addToCart)}
        </button>
      </div>

      {/* Mobile Fixed Bottom Bar - positioned above bottom nav (56px) */}
      <div className="fixed bottom-[56px] left-0 right-0 border-t border-zinc-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 md:hidden z-40 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`w-full rounded-full py-3 text-base font-semibold ${
            isDisabled
              ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              : "bg-olive-600 text-white hover:bg-olive-700"
          }`}
        >
          {added ? t.product.addedToCart : (isDisabled && needsSize ? selectSizeFirstText : t.product.addToCart)}
        </button>
      </div>
    </div>
  );
}
