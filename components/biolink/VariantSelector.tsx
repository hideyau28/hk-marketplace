"use client";

import { useState } from "react";
import { formatHKD } from "@/lib/biolink-helpers";

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
  },
  light: {
    soldOutBtn: "bg-zinc-200 text-zinc-400",
    directBtn: "bg-zinc-900 text-white",
    select: "bg-zinc-100 text-zinc-800 border-zinc-200 focus:border-zinc-400",
    option: "bg-white",
    arrow: "text-zinc-400",
    addActive: "bg-zinc-900 text-white",
    addDisabled: "bg-zinc-200 text-zinc-400",
  },
};

export default function VariantSelector({
  variants,
  label,
  productPrice,
  soldOut,
  onAdd,
  theme = "dark",
}: Props) {
  const [selected, setSelected] = useState("");
  const [animating, setAnimating] = useState(false);
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
  const displayPrice = selectedVariant?.price ?? productPrice;

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
        className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${
          canAdd ? s.addActive : `${s.addDisabled} cursor-not-allowed`
        } ${animating ? "scale-95" : ""}`}
      >
        {theme === "dark" ? formatHKD(displayPrice) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        )}
      </button>
    </div>
  );
}
