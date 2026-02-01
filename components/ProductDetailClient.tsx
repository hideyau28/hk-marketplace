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

  return (
    <div className="space-y-6 pb-32 md:pb-0">
      {/* Brand */}
      <div className="text-zinc-600 text-sm dark:text-zinc-400">{product.brand}</div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{product.title}</h1>

      {/* Price */}
      <div className="flex items-center gap-3">
        {isOnSale ? (
          <>
            <span className="text-lg text-zinc-400 line-through">{format(product.originalPrice!)}</span>
            <span className="text-2xl font-bold text-red-600">{format(product.price)}</span>
            <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full">-{discountPercent}%</span>
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
      <div className="hidden md:block">
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`w-full rounded-full py-3 text-lg font-semibold ${
            isDisabled
              ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
              : "bg-olive-600 text-white hover:bg-olive-700"
          }`}
        >
          {added ? t.product.addedToCart : t.product.addToCart}
        </button>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-16 left-0 right-0 border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden z-10 dark:border-zinc-800 dark:bg-zinc-950/95">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <button
            onClick={handleAddToCart}
            disabled={isDisabled}
            className={`w-full rounded-full py-3 text-lg font-semibold ${
              isDisabled
                ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                : "bg-olive-600 text-white hover:bg-olive-700"
            }`}
          >
            {added ? t.product.addedToCart : t.product.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
