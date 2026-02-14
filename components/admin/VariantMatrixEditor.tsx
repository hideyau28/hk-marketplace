"use client";

import { useState, useMemo } from "react";
import { X, Plus, Trash2 } from "lucide-react";

export type VariantRow = {
  key: string; // unique combo key e.g. "M|黑色"
  option1Value: string;
  option2Value?: string;
  price: string; // keep as string for input
  stock: string;
  active: boolean;
};

type Props = {
  option1Label: string;
  option1Values: string[];
  option2Label: string;
  option2Values: string[];
  basePrice: string;
  inventoryMode: "limited" | "made_to_order";
  variants: VariantRow[];
  onVariantsChange: (variants: VariantRow[]) => void;
  disabled?: boolean;
};

function makeKey(v1: string, v2?: string): string {
  return v2 ? `${v1}|${v2}` : v1;
}

export default function VariantMatrixEditor({
  option1Label,
  option1Values,
  option2Label,
  option2Values,
  basePrice,
  inventoryMode,
  variants,
  onVariantsChange,
  disabled = false,
}: Props) {
  const [bulkPrice, setBulkPrice] = useState("");

  // Generate expected combinations
  const expectedKeys = useMemo(() => {
    const keys: { key: string; o1: string; o2?: string }[] = [];
    if (option1Values.length === 0 && option2Values.length === 0) return keys;

    if (option1Values.length > 0 && option2Values.length > 0) {
      for (const o1 of option1Values) {
        for (const o2 of option2Values) {
          keys.push({ key: makeKey(o1, o2), o1, o2 });
        }
      }
    } else if (option1Values.length > 0) {
      for (const o1 of option1Values) {
        keys.push({ key: makeKey(o1), o1 });
      }
    } else if (option2Values.length > 0) {
      for (const o2 of option2Values) {
        keys.push({ key: makeKey(o2), o1: o2 });
      }
    }
    return keys;
  }, [option1Values, option2Values]);

  // Sync variants when combos change: keep existing data, add new, remove stale
  const syncedVariants = useMemo(() => {
    const map = new Map(variants.map((v) => [v.key, v]));
    return expectedKeys.map(({ key, o1, o2 }) => {
      if (map.has(key)) return map.get(key)!;
      return {
        key,
        option1Value: o1,
        option2Value: o2,
        price: basePrice,
        stock: inventoryMode === "made_to_order" ? "999" : "0",
        active: true,
      };
    });
  }, [expectedKeys, variants, basePrice, inventoryMode]);

  // If synced differs from current variants, push update
  if (JSON.stringify(syncedVariants.map((v) => v.key)) !== JSON.stringify(variants.map((v) => v.key))) {
    // Defer to avoid render-during-render
    setTimeout(() => onVariantsChange(syncedVariants), 0);
  }

  const updateVariant = (key: string, field: keyof VariantRow, value: string | boolean) => {
    onVariantsChange(
      variants.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (key: string) => {
    onVariantsChange(variants.filter((v) => v.key !== key));
  };

  const applyBulkPrice = () => {
    if (!bulkPrice.trim()) return;
    onVariantsChange(variants.map((v) => ({ ...v, price: bulkPrice })));
    setBulkPrice("");
  };

  if (variants.length === 0 && expectedKeys.length === 0) {
    return (
      <div className="text-sm text-zinc-400 py-4 text-center">
        請先選擇至少一個選項維度嘅值
      </div>
    );
  }

  const has2Dims = option2Values.length > 0 && option1Values.length > 0;

  return (
    <div className="space-y-3">
      {/* Bulk price */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-600">統一設定價錢:</span>
        <input
          type="number"
          min="0"
          step="1"
          value={bulkPrice}
          onChange={(e) => setBulkPrice(e.target.value)}
          disabled={disabled}
          className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#6B7A2F] disabled:opacity-50"
          placeholder="HKD"
        />
        <button
          type="button"
          onClick={applyBulkPrice}
          disabled={disabled || !bulkPrice.trim()}
          className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
        >
          套用全部
        </button>
      </div>

      {/* Variant matrix table */}
      <div className="overflow-x-auto border border-zinc-100 rounded-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-zinc-50">
            <tr className="text-zinc-500 border-b border-zinc-200">
              <th className="py-2 px-3 text-left font-medium">{option1Label || "選項 1"}</th>
              {has2Dims && (
                <th className="py-2 px-3 text-left font-medium">{option2Label || "選項 2"}</th>
              )}
              <th className="py-2 px-3 text-right font-medium w-28">價錢 (HKD)</th>
              {inventoryMode === "limited" && (
                <th className="py-2 px-3 text-right font-medium w-24">庫存</th>
              )}
              <th className="py-2 px-3 text-center font-medium w-12">✓</th>
              <th className="py-2 px-3 text-center font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr
                key={v.key}
                className={`border-b border-zinc-100 hover:bg-zinc-50 ${!v.active ? "opacity-40" : ""}`}
              >
                <td className="py-2 px-3 text-zinc-900">{v.option1Value}</td>
                {has2Dims && (
                  <td className="py-2 px-3 text-zinc-900">{v.option2Value}</td>
                )}
                <td className="py-2 px-3 text-right">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={v.price}
                    onChange={(e) => updateVariant(v.key, "price", e.target.value)}
                    disabled={disabled}
                    className="w-24 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#6B7A2F] disabled:opacity-50"
                  />
                </td>
                {inventoryMode === "limited" && (
                  <td className="py-2 px-3 text-right">
                    <input
                      type="number"
                      min="0"
                      value={v.stock}
                      onChange={(e) => updateVariant(v.key, "stock", e.target.value)}
                      disabled={disabled}
                      className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#6B7A2F] disabled:opacity-50"
                      placeholder="0"
                    />
                  </td>
                )}
                <td className="py-2 px-3 text-center">
                  <input
                    type="checkbox"
                    checked={v.active}
                    onChange={(e) => updateVariant(v.key, "active", e.target.checked)}
                    disabled={disabled}
                    className="h-4 w-4 accent-[#6B7A2F] disabled:opacity-50"
                  />
                </td>
                <td className="py-2 px-3 text-center">
                  <button
                    type="button"
                    onClick={() => removeVariant(v.key)}
                    disabled={disabled}
                    className="text-zinc-400 hover:text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-zinc-400">
        共 {variants.filter((v) => v.active).length} 個有效組合
        {inventoryMode === "limited" && (
          <span>
            ，總庫存: {variants.filter((v) => v.active).reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}
          </span>
        )}
      </div>
    </div>
  );
}
