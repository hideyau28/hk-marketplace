"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  getDualVariantData,
  getVariantLabel,
  formatHKD,
} from "@/lib/biolink-helpers";
import { getColorHex } from "@/lib/color-map";

type Props = {
  product: ProductForBioLink;
  onClose: () => void;
  onAddToCart: (product: ProductForBioLink, variant: string | null, qty: number) => void;
};

export default function ProductSheet({ product, onClose, onAddToCart }: Props) {
  const images = getAllImages(product);
  const dualVariant = getDualVariantData(product);
  const singleVariants = getVisibleVariants(product);
  const variantLabel = getVariantLabel(product);

  const isDual = dualVariant !== null;

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  // 預設選第一個有貨組合
  useEffect(() => {
    if (isDual && dualVariant) {
      const dim1Options = dualVariant.options[dualVariant.dimensions[0]] || [];
      const dim2Options = dualVariant.options[dualVariant.dimensions[1]] || [];
      for (const c of dim1Options) {
        for (const s of dim2Options) {
          const key = `${c}|${s}`;
          const combo = dualVariant.combinations[key];
          if (combo && combo.status !== "hidden" && combo.qty > 0) {
            setSelectedColor(c);
            setSelectedSize(s);
            const imgIdx = dualVariant.optionImages?.[c] ?? 0;
            setHeroIndex(imgIdx);
            return;
          }
        }
      }
    } else if (singleVariants && singleVariants.length > 0) {
      const first = singleVariants.find((v) => v.stock > 0);
      if (first) setSelectedSize(first.name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // 計算目前選中組合嘅庫存
  const getSelectedStock = (): number => {
    if (isDual && dualVariant && selectedColor && selectedSize) {
      const key = `${selectedColor}|${selectedSize}`;
      return dualVariant.combinations[key]?.qty ?? 0;
    }
    if (singleVariants && selectedSize) {
      const v = singleVariants.find((sv) => sv.name === selectedSize);
      return v?.stock ?? 0;
    }
    return 0;
  };

  const selectedStock = getSelectedStock();

  // 切換顏色
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setSelectedSize("");
    setQty(1);
    setShowError(false);
    if (dualVariant) {
      const imgIdx = dualVariant.optionImages?.[color] ?? 0;
      setHeroIndex(imgIdx);
      // 自動選第一個有貨尺碼
      const dim2Options = dualVariant.options[dualVariant.dimensions[1]] || [];
      for (const s of dim2Options) {
        const key = `${color}|${s}`;
        const combo = dualVariant.combinations[key];
        if (combo && combo.status !== "hidden" && combo.qty > 0) {
          setSelectedSize(s);
          break;
        }
      }
    }
  };

  // 切換尺碼
  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setQty(1);
    setShowError(false);
  };

  // 加入購物車
  const handleAdd = () => {
    if (isDual) {
      if (!selectedColor || !selectedSize) {
        setShowError(true);
        return;
      }
      onAddToCart(product, `${selectedColor}|${selectedSize}`, qty);
    } else {
      if (!selectedSize) {
        setShowError(true);
        return;
      }
      onAddToCart(product, selectedSize, qty);
    }
  };

  // 取得尺碼列表（含庫存）
  const getSizeOptions = () => {
    if (isDual && dualVariant) {
      const dim2 = dualVariant.dimensions[1];
      const dim2Options = dualVariant.options[dim2] || [];
      return dim2Options.map((opt) => {
        const key = `${selectedColor}|${opt}`;
        const combo = dualVariant.combinations[key];
        return {
          name: opt,
          stock: combo ? combo.qty : 0,
          available: combo ? combo.status !== "hidden" && combo.qty > 0 : false,
        };
      });
    }
    if (singleVariants) {
      return singleVariants.map((v) => ({
        name: v.name,
        stock: v.stock,
        available: v.stock > 0,
      }));
    }
    return [];
  };

  const sizes = getSizeOptions();
  const displayImage = images[heroIndex] || images[0] || null;
  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const canAdd = isDual
    ? !!(selectedColor && selectedSize && selectedStock > 0)
    : !!(selectedSize && selectedStock > 0);

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>

        {/* Header: 縮圖 + 商品資訊 + 關閉 */}
        <div className="flex gap-3 px-4 pb-3 border-b border-zinc-100">
          {displayImage && (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={displayImage}
                alt={product.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-zinc-900 text-sm font-semibold line-clamp-2">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-zinc-900 font-bold text-lg">
                {formatHKD(product.price)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-zinc-400 text-xs line-through">
                    {formatHKD(product.originalPrice!)}
                  </span>
                  <span className="px-1 py-0.5 text-[9px] font-bold rounded bg-red-500 text-white">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="self-start p-1 text-zinc-400 hover:text-zinc-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {/* 顏色（雙維 only） */}
          {isDual && dualVariant && (
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-2">
                {dualVariant.dimensions[0]}
                {showError && !selectedColor && (
                  <span className="text-red-500 ml-1">請選擇</span>
                )}
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {(dualVariant.options[dualVariant.dimensions[0]] || []).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => handleColorChange(opt)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex-shrink-0 ${
                        selectedColor === opt
                          ? "border-[#FF9500] ring-2 ring-[#FF9500]/30 scale-110"
                          : "border-zinc-200"
                      }`}
                      style={{ backgroundColor: getColorHex(opt) }}
                      title={opt}
                    />
                  )
                )}
              </div>
            </div>
          )}

          {/* 尺碼 chips */}
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">
              {isDual ? dualVariant!.dimensions[1] : variantLabel}
              {showError && !selectedSize && (
                <span className="text-red-500 ml-1">請選擇</span>
              )}
            </p>
            <div
              className={`flex gap-2 ${
                sizes.length > 8
                  ? "overflow-x-auto pb-1 scrollbar-hide"
                  : "flex-wrap"
              }`}
            >
              {sizes.map((s) => (
                <button
                  key={s.name}
                  onClick={() => s.available && handleSizeChange(s.name)}
                  disabled={!s.available}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all flex-shrink-0 ${
                    selectedSize === s.name
                      ? "border-[#FF9500] bg-[#FF9500]/10 text-[#FF9500]"
                      : s.available
                        ? "border-zinc-200 text-zinc-700 active:border-zinc-300"
                        : "border-zinc-100 text-zinc-300 cursor-not-allowed bg-zinc-50 line-through"
                  }`}
                >
                  {s.name}
                  {s.available && s.stock > 0 && s.stock <= 3 && (
                    <span className="text-[10px] text-red-500 ml-1">
                      剩{s.stock}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 數量 stepper */}
          <div>
            <p className="text-xs font-medium text-zinc-500 mb-2">數量</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 active:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              <span className="text-base font-semibold w-8 text-center">
                {qty}
              </span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(selectedStock || 99, q + 1))
                }
                disabled={qty >= selectedStock}
                className="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 active:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 固定底部 CTA */}
        <div className="px-4 py-4 border-t border-zinc-100">
          <button
            onClick={handleAdd}
            className={`w-full py-3.5 rounded-xl text-base font-semibold transition-all active:scale-[0.98] ${
              canAdd
                ? "bg-[#FF9500] text-white shadow-lg shadow-[#FF9500]/30"
                : "bg-zinc-200 text-zinc-400"
            }`}
          >
            加入購物車{canAdd ? ` ${formatHKD(product.price * qty)}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
