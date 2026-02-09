"use client";

import { useState } from "react";
import { formatHKD } from "@/lib/biolink-helpers";
import type { DualVariantData } from "@/lib/biolink-helpers";
import { getColorHex } from "@/lib/color-map";

type Variant = {
  name: string;
  stock: number;
  price: number | null;
};

type Props = {
  variants: Variant[];
  label: string;
  productPrice: number;
  soldOut: boolean;
  onAdd: (variant: string | null) => void;
  theme?: "dark" | "light";
  /** 雙維 variant data（顏色 × 尺碼） */
  dualVariant?: DualVariantData | null;
  /** 切換圖片 callback（雙維用） */
  onImageChange?: (imageIndex: number) => void;
};

const styles = {
  dark: {
    soldOutBtn: "bg-zinc-700 text-zinc-500",
    directBtn: "bg-[#FF9500] text-white",
    select: "bg-white/10 text-white border-white/10 focus:border-white/30",
    option: "bg-[#1a1a1a]",
    arrow: "text-white/40",
    addActive: "bg-[#FF9500] text-white",
    addDisabled: "bg-zinc-700 text-zinc-500",
    dotBorder: "border-white/30",
    dotSelected: "border-[#FF9500]",
  },
  light: {
    soldOutBtn: "bg-zinc-200 text-zinc-400",
    directBtn: "bg-zinc-900 text-white",
    select: "bg-zinc-100 text-zinc-800 border-zinc-200 focus:border-zinc-400",
    option: "bg-white",
    arrow: "text-zinc-400",
    addActive: "bg-[#FF9500] text-white",
    addDisabled: "bg-zinc-200 text-zinc-400",
    dotBorder: "border-zinc-300",
    dotSelected: "border-[#FF9500]",
  },
};

export default function VariantSelector({
  variants,
  label,
  productPrice,
  soldOut,
  onAdd,
  theme = "dark",
  dualVariant,
  onImageChange,
}: Props) {
  const [selected, setSelected] = useState("");
  const [animating, setAnimating] = useState(false);
  // 雙維 state
  const [selectedDim1, setSelectedDim1] = useState(() =>
    dualVariant ? dualVariant.options[dualVariant.dimensions[0]]?.[0] || "" : ""
  );
  const [selectedDim2, setSelectedDim2] = useState("");
  const s = styles[theme];

  if (soldOut) {
    return (
      <button
        disabled
        className={`w-full py-2.5 rounded-lg text-sm font-semibold cursor-not-allowed ${s.soldOutBtn}`}
      >
        SOLD OUT
      </button>
    );
  }

  // ─── 雙維 variant UI ───
  if (dualVariant && dualVariant.dimensions.length >= 2) {
    const [dim1, dim2] = dualVariant.dimensions;
    const dim1Options = dualVariant.options[dim1] || [];
    const dim2Options = dualVariant.options[dim2] || [];

    const handleDim1 = (value: string) => {
      setSelectedDim1(value);
      setSelectedDim2(""); // reset dim2
      const imgIndex = dualVariant.optionImages?.[value] ?? 0;
      onImageChange?.(imgIndex);
    };

    // 過濾 dim2 — 只顯示有庫存嘅
    const availableDim2 = dim2Options.filter((opt) => {
      const key = `${selectedDim1}|${opt}`;
      const combo = dualVariant.combinations[key];
      return combo && combo.status !== "hidden" && combo.qty > 0;
    });

    const canAddDual = selectedDim1 && selectedDim2;

    const handleDim2 = (value: string) => {
      setSelectedDim2(value);
    };

    const handleAddDual = () => {
      if (!canAddDual) return;
      setAnimating(true);
      onAdd(`${selectedDim1}|${selectedDim2}`);
      setTimeout(() => {
        setAnimating(false);
        setSelectedDim2("");
      }, 300);
    };

    return (
      <div>
        {/* Dim 1: 顏色 dots */}
        <div className="flex gap-2 mb-2 flex-wrap">
          {dim1Options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleDim1(opt)}
              className={`w-6 h-6 rounded-full border-2 transition-all flex-shrink-0 ${
                selectedDim1 === opt ? s.dotSelected : s.dotBorder
              }`}
              style={{ backgroundColor: getColorHex(opt) }}
              title={opt}
            />
          ))}
        </div>

        {/* Dim 2: dropdown + cart button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <select
              value={selectedDim2}
              onChange={(e) => handleDim2(e.target.value)}
              className={`w-full appearance-none text-xs font-medium px-3 py-2.5 pr-8 rounded-lg border transition-colors focus:outline-none ${s.select}`}
            >
              <option value="" className={s.option}>
                {dim2}
              </option>
              {availableDim2.map((opt) => {
                const key = `${selectedDim1}|${opt}`;
                const qty = dualVariant.combinations[key]?.qty || 0;
                return (
                  <option key={opt} value={opt} className={s.option}>
                    {opt}
                    {qty <= 3 ? ` (餘${qty})` : ""}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className={`w-3 h-3 ${s.arrow}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
          <button
            onClick={handleAddDual}
            disabled={!canAddDual}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
              canAddDual ? s.addActive : `${s.addDisabled} cursor-not-allowed`
            } ${animating ? "scale-95" : ""}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ─── 單維 / 無 variant（現有行為）───

  // No variants → direct add button
  if (variants.length === 0) {
    const handleDirectAdd = () => {
      setAnimating(true);
      onAdd(null);
      setTimeout(() => setAnimating(false), 300);
    };

    return (
      <button
        onClick={handleDirectAdd}
        className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${s.directBtn} ${
          animating ? "scale-95" : ""
        }`}
      >
        加入購物車{theme === "dark" ? ` ${formatHKD(productPrice)}` : ""}
      </button>
    );
  }

  const selectedVariant = variants.find((v) => v.name === selected);
  const canAdd = selected && selectedVariant && selectedVariant.stock > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    setAnimating(true);
    onAdd(selected);
    setTimeout(() => {
      setAnimating(false);
      setSelected("");
    }, 300);
  };

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className={`w-full appearance-none text-xs font-medium px-3 py-2.5 pr-8 rounded-lg border transition-colors focus:outline-none ${s.select}`}
        >
          <option value="" className={s.option}>
            {label}
          </option>
          {variants.map((v) => (
            <option
              key={v.name}
              value={v.name}
              disabled={v.stock === 0}
              className={s.option}
            >
              {v.name}
              {v.stock === 0 ? " (售罄)" : v.stock <= 3 ? ` (剩${v.stock})` : ""}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className={`w-3 h-3 ${s.arrow}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
      <button
        onClick={handleAdd}
        disabled={!canAdd}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95 ${
          canAdd ? s.addActive : `${s.addDisabled} cursor-not-allowed`
        } ${animating ? "scale-95" : ""}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
      </button>
    </div>
  );
}
