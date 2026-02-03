"use client";

import { useState } from "react";
import SizeGuideModal from "./SizeGuideModal";
import type { Translations } from "@/lib/translations";

type SizeSelectorProps = {
  sizeSystem: string | null;
  sizes: Record<string, number> | string[] | null;
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
  if (!sizes) {
    return null;
  }

  const isZh = locale === "zh-HK";

  // Handle both array and object formats
  // Object format: {"US 7": 5, "US 8.5": 3} where value is stock count
  // Array format: ["US 7", "US 8.5"]
  let currentSizes: string[] = [];
  if (Array.isArray(sizes)) {
    currentSizes = sizes;
  } else if (typeof sizes === "object" && sizes !== null) {
    // Extract all size keys from the object, filter out sizes with 0 stock
    currentSizes = Object.keys(sizes).filter((size) => {
      const stock = sizes[size];
      return typeof stock === "number" && stock > 0;
    });
  }

  if (currentSizes.length === 0) {
    return null;
  }

  // Detect size system from size format
  const firstSize = currentSizes[0] || "";
  const isUSShoes = firstSize.startsWith("US ");
  const isUKShoes = firstSize.startsWith("UK ");
  const effectiveSizeSystem = sizeSystem || (isUSShoes ? "US" : isUKShoes ? "UK" : "");

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

      {/* Size grid */}
      <div className={`grid ${gridCols} gap-0`}>
        {currentSizes.map((size, index) => {
          const isSelected = selectedSize === size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeSelect(size, effectiveSizeSystem)}
              className={`border py-3 text-sm text-center font-medium transition-colors ${
                isSelected
                  ? "bg-olive-600 text-white border-olive-600 z-10"
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
              style={{
                // Remove border overlap
                marginTop: index >= ((isUKShoes || isUSShoes) ? 5 : 4) ? "-1px" : 0,
                marginLeft: index % ((isUKShoes || isUSShoes) ? 5 : 4) !== 0 ? "-1px" : 0,
              }}
            >
              {size}
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
