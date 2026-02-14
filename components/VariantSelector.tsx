"use client";

import { useState, useMemo } from "react";

export type VariantData = {
  id: string;
  name: string;
  price: number | null;
  compareAtPrice: number | null;
  stock: number;
  options: Record<string, string> | null;
  imageUrl: string | null;
  active: boolean;
};

type VariantSelectorProps = {
  variants: VariantData[];
  locale: string;
  onVariantSelect: (variant: VariantData | null) => void;
};

// Option key translations (supports both English and Chinese keys)
const OPTION_LABELS: Record<string, Record<string, string>> = {
  color: { "zh-HK": "顏色", en: "Color" },
  colour: { "zh-HK": "顏色", en: "Color" },
  size: { "zh-HK": "尺碼", en: "Size" },
  material: { "zh-HK": "材質", en: "Material" },
  style: { "zh-HK": "款式", en: "Style" },
  // Chinese option keys used by new variant system
  "顏色": { "zh-HK": "顏色", en: "Color" },
  "尺碼": { "zh-HK": "尺碼", en: "Size" },
  "口味": { "zh-HK": "口味", en: "Flavor" },
  "材質": { "zh-HK": "材質", en: "Material" },
  "款式": { "zh-HK": "款式", en: "Style" },
};

function findMatchingVariant(
  variants: VariantData[],
  allKeys: string[],
  options: Record<string, string>
): VariantData | null {
  if (allKeys.length === 0 || allKeys.some((k) => !options[k])) return null;
  return (
    variants.find((v) => {
      if (!v.active || !v.options) return false;
      const opts = v.options as Record<string, string>;
      return allKeys.every((k) => opts[k] === options[k]);
    }) || null
  );
}

export default function VariantSelector({
  variants,
  locale,
  onVariantSelect,
}: VariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Extract unique option keys and their values from active variants
  const { optionKeys, allKeys } = useMemo(() => {
    const keys = new Map<string, string[]>();
    const seen = new Map<string, Set<string>>();

    for (const v of variants) {
      if (!v.active || !v.options) continue;
      const opts = v.options as Record<string, string>;
      for (const [key, value] of Object.entries(opts)) {
        if (!seen.has(key)) seen.set(key, new Set());
        seen.get(key)!.add(value);
      }
    }

    for (const [key, valueSet] of seen.entries()) {
      keys.set(key, Array.from(valueSet));
    }

    return { optionKeys: keys, allKeys: Array.from(keys.keys()) };
  }, [variants]);

  // Matched variant for display (stock warnings etc.)
  const matchedVariant = useMemo(
    () => findMatchingVariant(variants, allKeys, selectedOptions),
    [selectedOptions, variants, allKeys]
  );

  // Check if a specific option value has any in-stock variant given current other selections
  const isOptionValueAvailable = (key: string, value: string): boolean => {
    return variants.some((v) => {
      if (!v.active || !v.options) return false;
      const opts = v.options as Record<string, string>;
      if (opts[key] !== value) return false;
      // Check compatibility with other selected options
      for (const [selectedKey, selectedValue] of Object.entries(selectedOptions)) {
        if (selectedKey === key) continue;
        if (opts[selectedKey] !== selectedValue) return false;
      }
      return v.stock > 0;
    });
  };

  const handleOptionSelect = (key: string, value: string) => {
    const newOptions = { ...selectedOptions, [key]: value };
    setSelectedOptions(newOptions);
    onVariantSelect(findMatchingVariant(variants, allKeys, newOptions));
  };

  const getLabel = (key: string): string => {
    const lower = key.toLowerCase();
    return OPTION_LABELS[lower]?.[locale] || key;
  };

  if (optionKeys.size === 0) return null;

  const outOfStockLabel = locale === "zh-HK" ? "冇貨" : "Out of stock";

  return (
    <div className="space-y-4">
      {Array.from(optionKeys.entries()).map(([key, values]) => (
        <div key={key}>
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            {getLabel(key)}
            {selectedOptions[key] && (
              <span className="ml-2 text-zinc-500 dark:text-zinc-400 font-normal">
                {selectedOptions[key]}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => {
              const selected = selectedOptions[key] === value;
              const available = isOptionValueAvailable(key, value);
              return (
                <button
                  key={value}
                  onClick={() => handleOptionSelect(key, value)}
                  disabled={!available}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    selected
                      ? "border-olive-600 bg-olive-50 text-olive-700 dark:bg-olive-900/20 dark:text-olive-300 dark:border-olive-500"
                      : available
                        ? "border-zinc-300 text-zinc-700 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-500"
                        : "border-zinc-200 text-zinc-300 cursor-not-allowed line-through dark:border-zinc-700 dark:text-zinc-600"
                  }`}
                >
                  {value}
                  {!available && (
                    <span className="block text-[10px] leading-tight text-zinc-400 dark:text-zinc-600">
                      {outOfStockLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Variant stock & price info */}
      {matchedVariant && matchedVariant.stock <= 0 && (
        <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          {locale === "zh-HK" ? "已售罄" : "Out of stock"}
        </div>
      )}
      {matchedVariant && matchedVariant.stock > 0 && matchedVariant.stock <= 5 && (
        <div className="text-sm font-semibold text-orange-600">
          {locale === "zh-HK" ? `快將售罄 - 僅剩 ${matchedVariant.stock} 件` : `Low stock - ${matchedVariant.stock} left`}
        </div>
      )}
      {matchedVariant && matchedVariant.stock > 5 && matchedVariant.stock < 999 && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {locale === "zh-HK" ? `庫存: ${matchedVariant.stock} 件` : `In stock: ${matchedVariant.stock}`}
        </div>
      )}
      {matchedVariant && matchedVariant.stock >= 999 && (
        <div className="text-sm text-green-600 dark:text-green-400">
          {locale === "zh-HK" ? "接單製作" : "Made to order"}
        </div>
      )}
    </div>
  );
}
