"use client";

import { useState } from "react";
import { addToCart } from "@/lib/cart";
import { useToast } from "@/components/Toast";
import ProductSizeSelector from "@/components/ProductSizeSelector";
import { useCurrency } from "@/lib/currency";

type ProductDetailClientProps = {
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
    brand: string;
    sizeSystem: string | null;
    sizes: any;
    stock: number;
  };
  locale: string;
  texts: {
    addToCart: string;
    addedToCart: string;
    buyNow: string;
    pleaseSelectSize: string;
  };
};

export default function ProductDetailClient({ product, locale, texts }: ProductDetailClientProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { showToast } = useToast();
  const { format } = useCurrency();

  const handleSizeSelect = (size: string, system: string) => {
    setSelectedSize(size);
    setSelectedSystem(system);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast(locale === "zh-HK" ? "缺貨中" : "Out of stock");
      return;
    }
    // Check if size is required
    if (product.sizeSystem && !selectedSize) {
      showToast(texts.pleaseSelectSize);
      return;
    }

    // Add to cart with size info
    addToCart({
      productId: product.id,
      title: product.title,
      unitPrice: product.price,
      imageUrl: product.image,
      size: selectedSize || undefined,
      sizeSystem: selectedSystem || undefined,
    });

    setAdded(true);
    showToast(texts.addedToCart);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Brand */}
      <div className="text-zinc-600 text-sm">{product.brand}</div>

      {/* Title */}
      <h1 className="text-2xl font-semibold text-zinc-900">{product.title}</h1>

      {/* Price */}
      <div className="text-xl font-semibold text-zinc-900">{format(product.price)}</div>

      {product.stock <= 0 ? (
        <div className="text-sm font-semibold text-zinc-500">Out of Stock</div>
      ) : product.stock < 5 ? (
        <div className="text-sm font-semibold text-red-600">Low Stock</div>
      ) : null}

      {/* Description */}
      <div className="text-zinc-600 text-sm leading-6">
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
        />
      )}

      {/* Desktop Buttons */}
      <div className="hidden gap-3 md:flex">
        <button
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
          className={`rounded-2xl px-4 py-3 font-semibold ${
            product.stock <= 0
              ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
              : "bg-olive-600 text-white hover:bg-olive-700"
          }`}
        >
          {added ? texts.addedToCart : texts.addToCart}
        </button>
        <button className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 hover:bg-zinc-50">
          {texts.buyNow}
        </button>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-zinc-900 font-semibold">{format(product.price)}</div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 rounded-2xl px-4 py-3 font-semibold ${
              product.stock <= 0
                ? "bg-zinc-200 text-zinc-500 cursor-not-allowed"
                : "bg-olive-600 text-white hover:bg-olive-700"
            }`}
          >
            {added ? texts.addedToCart : texts.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
