"use client";

import { useState } from "react";
import SizeGuideModal from "./SizeGuideModal";
import type { Translations } from "@/lib/translations";

type SizeSelectorProps = {
  sizeSystem: string | null;
  sizes: any;
  locale: string;
  onSizeSelect: (size: string, system: string) => void;
  selectedSize: string | null;
  selectedSystem: string | null;
  t: Translations;
  category?: string;
};

export default function ProductSizeSelector({
  sizeSystem,
  sizes,
  locale,
  onSizeSelect,
  selectedSize,
  selectedSystem,
  t,
  category,
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // If no sizes, don't render anything
  // Support both array format and JSON object format {"US 7": 5, "US 8.5": 3}
  if (!sizes) {
    return null;
  }

  const isZh = locale === "zh-HK";

  // Handle both array and object formats
  let currentSizes: string[] = [];
  if (Array.isArray(sizes)) {
    currentSizes = sizes;
  } else if (typeof sizes === "object") {
    // Filter out sizes with 0 stock
    currentSizes = Object.entries(sizes)
      .filter(([, stock]) => (stock as number) > 0)
      .map(([size]) => size);
  }

  if (currentSizes.length === 0) {
    return null;
  }

  // Use sizeSystem if provided, otherwise detect from size format
  const effectiveSizeSystem = sizeSystem || (currentSizes[0]?.startsWith("US ") ? "US" : "UK");

  // Determine if this is a UK shoe size system
  const isUKShoes = effectiveSizeSystem === "UK" || (currentSizes.length > 0 && currentSizes[0]?.startsWith("UK "));
  const isUSShoes = effectiveSizeSystem === "US" || (currentSizes.length > 0 && currentSizes[0]?.startsWith("US "));
  const isClothing = effectiveSizeSystem && ["clothing", "socks", "accessories"].includes(effectiveSizeSystem.toLowerCase());

  // Header text
  const headerText = isUKShoes
    ? (isZh ? "選擇尺碼 (UK)" : "Select Size (UK)")
    : isUSShoes
    ? (isZh ? "選擇尺碼 (US)" : "Select Size (US)")
    : (isZh ? "選擇尺碼" : "Select Size");
  const sizeGuideText = isZh ? "尺碼表" : "Size Guide";

  // Grid columns: 5 for shoes, 4 for clothing
  const gridCols = (isUKShoes || isUSShoes) ? "grid-cols-5" : "grid-cols-4";

  // Determine size guide type
  const sizeGuideType = (isUKShoes || isUSShoes) ? "shoes" : "clothing";

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">{headerText}</span>
        <button
          type="button"
          onClick={() => setShowSizeGuide(true)}
          className="text-sm text-olive-600 hover:text-olive-700 underline"
        >
          {sizeGuideText}
        </button>
      </div>

      {/* Size grid - no rounded corners (Nike/Adidas style) */}
      <div className={`grid ${gridCols} gap-0`}>
        {currentSizes.map((size, index) => {
          const isSelected = selectedSize === size && selectedSystem === effectiveSizeSystem;
          // Display text - remove "UK " prefix for cleaner display
          const displayText = size.startsWith("UK ") ? size : size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeSelect(size, effectiveSizeSystem)}
              className={`border py-3 text-sm text-center font-medium transition-colors ${
                isSelected
                  ? "bg-olive-600 text-white border-olive-600"
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
              style={{
                // Remove border overlap
                marginTop: index >= ((isUKShoes || isUSShoes) ? 5 : 4) ? "-1px" : 0,
                marginLeft: index % ((isUKShoes || isUSShoes) ? 5 : 4) !== 0 ? "-1px" : 0,
              }}
            >
              {displayText}
            </button>
          );
        })}
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        type={sizeGuideType}
        locale={locale}
      />
    </div>
  );
}
