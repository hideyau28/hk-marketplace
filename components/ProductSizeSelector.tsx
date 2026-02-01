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

  // If no sizes or sizeSystem, don't render anything
  if (!sizeSystem || !sizes) {
    return null;
  }

  const isZh = locale === "zh-HK";
  const currentSizes: string[] = Array.isArray(sizes) ? sizes : [];

  // Determine if this is a UK shoe size system
  const isUKShoes = sizeSystem === "UK" || (currentSizes.length > 0 && currentSizes[0]?.startsWith("UK "));
  const isClothing = ["clothing", "socks", "accessories"].includes(sizeSystem.toLowerCase());

  // Header text
  const headerText = isUKShoes
    ? (isZh ? "選擇尺碼 (UK)" : "Select Size (UK)")
    : (isZh ? "選擇尺碼" : "Select Size");
  const sizeGuideText = isZh ? "尺碼表" : "Size Guide";

  // Grid columns: 5 for shoes, 4 for clothing
  const gridCols = isUKShoes ? "grid-cols-5" : "grid-cols-4";

  // Determine size guide type
  const sizeGuideType = isUKShoes ? "shoes" : "clothing";

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
          const isSelected = selectedSize === size && selectedSystem === sizeSystem;
          // Display text - remove "UK " prefix for cleaner display
          const displayText = size.startsWith("UK ") ? size : size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => onSizeSelect(size, sizeSystem)}
              className={`border py-3 text-sm text-center font-medium transition-colors ${
                isSelected
                  ? "bg-olive-600 text-white border-olive-600"
                  : "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
              style={{
                // Remove border overlap
                marginTop: index >= (isUKShoes ? 5 : 4) ? "-1px" : 0,
                marginLeft: index % (isUKShoes ? 5 : 4) !== 0 ? "-1px" : 0,
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
