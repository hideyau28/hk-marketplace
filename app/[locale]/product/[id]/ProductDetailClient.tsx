"use client";

import { useEffect, useState } from "react";
import { addToCart } from "@/lib/cart";

// Badge color mapping
const BADGE_COLORS: Record<string, string> = {
  "快將售罄": "bg-red-500 text-white",
  "店長推介": "bg-amber-500 text-white",
  "今期熱賣": "bg-orange-500 text-white",
  "新品上架": "bg-green-500 text-white",
  "限時優惠": "bg-purple-500 text-white",
  "人氣之選": "bg-blue-500 text-white",
};

type ProductBadgesProps = {
  promotionBadges: string[];
  isLowStock: boolean;
};

export function AnimatedProductBadges({ promotionBadges, isLowStock }: ProductBadgesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Combine promotion badges with auto low stock badge
  const allBadges = [...promotionBadges];
  if (isLowStock && !allBadges.includes("快將售罄")) {
    allBadges.push("快將售罄");
  }

  useEffect(() => {
    if (allBadges.length <= 1) return;

    // Animation cycle: fade in 0.5s -> stay 2s -> fade out 0.5s -> pause 1s = 4s total
    const cycleTime = 4000;
    let fadeOutTimeout: NodeJS.Timeout;
    let nextBadgeTimeout: NodeJS.Timeout;

    const interval = setInterval(() => {
      setIsVisible(false);

      fadeOutTimeout = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % allBadges.length);
        nextBadgeTimeout = setTimeout(() => {
          setIsVisible(true);
        }, 100);
      }, 500);
    }, cycleTime);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeOutTimeout);
      clearTimeout(nextBadgeTimeout);
    };
  }, [allBadges.length]);

  if (allBadges.length === 0) return null;

  const currentBadge = allBadges[currentIndex];
  const colorClass = BADGE_COLORS[currentBadge] || "bg-zinc-700 text-white";

  return (
    <div className="absolute top-3 left-3 flex flex-col gap-2">
      <div
        className={`px-3 py-1.5 text-sm font-semibold rounded-xl shadow-lg transition-opacity duration-500 ${colorClass} ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {currentBadge}
      </div>
    </div>
  );
}

// Size selector component for product detail page
type SizeSelectorProps = {
  sizes: Record<string, number>;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
};

export function SizeSelector({ sizes, productId, productTitle, productPrice, productImage }: SizeSelectorProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [showMessage, setShowMessage] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const sizeKeys = Object.keys(sizes);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    setShowMessage(false);
    setAddedToCart(false);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowMessage(true);
      return;
    }

    addToCart({
      productId,
      title: `${productTitle} - ${selectedSize}`,
      unitPrice: productPrice,
      imageUrl: productImage,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-zinc-900">尺碼</span>
        {showMessage && !selectedSize && (
          <span className="text-sm text-red-500">請先選擇尺碼</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {sizeKeys.map((size) => {
          const stock = sizes[size];
          const isSelected = selectedSize === size;
          const isOutOfStock = stock === 0;

          return (
            <button
              key={size}
              onClick={() => !isOutOfStock && handleSizeClick(size)}
              disabled={isOutOfStock}
              className={`px-4 py-2 text-sm font-medium rounded-xl border transition-all ${
                isSelected
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : isOutOfStock
                  ? "bg-zinc-100 text-zinc-300 border-zinc-200 cursor-not-allowed line-through"
                  : "bg-white text-zinc-700 border-zinc-300 hover:border-zinc-900"
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>

      {/* Add to cart button for mobile - shows below sizes */}
      <button
        onClick={handleAddToCart}
        className={`mt-4 w-full py-3 px-4 rounded-2xl font-semibold text-white transition-colors md:hidden ${
          addedToCart ? "bg-green-600" : "bg-zinc-900 hover:bg-zinc-800"
        }`}
      >
        {addedToCart ? "✓ 已加入購物車" : selectedSize ? `加入購物車 - ${selectedSize}` : "加入購物車"}
      </button>
    </div>
  );
}

export default function ProductDetailClient() {
  return null;
}
