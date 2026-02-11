"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  getDualVariantData,
  getVariantLabel,
  formatPrice,
} from "@/lib/biolink-helpers";
import { getColorHex } from "@/lib/color-map";
import { getEmbedUrl } from "@/lib/video-embed";

type Props = {
  product: ProductForBioLink;
  currency?: string;
  onClose: () => void;
  onAddToCart: (product: ProductForBioLink, variant: string | null, qty: number) => void;
};

export default function ProductSheet({ product, currency = "HKD", onClose, onAddToCart }: Props) {
  const images = getAllImages(product);
  const dualVariant = getDualVariantData(product);
  const singleVariants = getVisibleVariants(product);
  const variantLabel = getVariantLabel(product);
  const videoEmbedUrl = product.videoUrl ? getEmbedUrl(product.videoUrl) : null;

  const isDual = dualVariant !== null;

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // 建立 carousel slides：圖片 + video (如果有)
  const carouselSlides = [...images];
  if (videoEmbedUrl) {
    carouselSlides.push("__VIDEO__");
  }
  const totalSlides = carouselSlides.length;

  // Body scroll lock
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
            setCarouselIndex(imgIdx);
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
      setCarouselIndex(imgIdx);
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
  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const canAdd = isDual
    ? !!(selectedColor && selectedSize && selectedStock > 0)
    : !!(selectedSize && selectedStock > 0);

  // Swipe 手勢
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // 最小滑動距離

    if (Math.abs(diff) < threshold) return;

    if (diff > 0) {
      // Swipe left - 下一張
      setCarouselIndex((prev) => Math.min(totalSlides - 1, prev + 1));
    } else {
      // Swipe right - 上一張
      setCarouselIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Fullscreen modal */}
      <div className="h-full flex flex-col max-w-[480px] mx-auto animate-slide-up">
        {/* Image Carousel Section - 全寬 1:1 */}
        <div className="relative w-full aspect-square bg-zinc-100">
          {/* Close button - 右上角 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-zinc-600 hover:text-zinc-900 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Carousel slides */}
          <div
            className="w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {carouselSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-300 ${
                  idx === carouselIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {slide === "__VIDEO__" ? (
                  <iframe
                    src={videoEmbedUrl!}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <Image
                    src={slide}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="480px"
                    priority={idx === 0}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Dots indicator */}
          {totalSlides > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
              {carouselSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === carouselIndex
                      ? "bg-white w-4"
                      : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* 商品名稱 + 價格 */}
          <div>
            <h3 className="text-zinc-900 text-xl font-bold mb-2">
              {product.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-zinc-900 font-bold text-2xl">
                {formatPrice(product.price, currency)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-zinc-400 text-base line-through">
                    {formatPrice(product.originalPrice!, currency)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500 text-white">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 顏色（雙維 only） */}
          {isDual && dualVariant && (
            <div>
              <p className="text-sm font-semibold text-zinc-700 mb-3 border-b border-zinc-100 pb-2">
                {dualVariant.dimensions[0]}
                {showError && !selectedColor && (
                  <span className="text-red-500 ml-1 font-normal">請選擇</span>
                )}
              </p>
              <div className="flex gap-3 flex-wrap">
                {(dualVariant.options[dualVariant.dimensions[0]] || []).map(
                  (opt) => (
                    <button
                      key={opt}
                      onClick={() => handleColorChange(opt)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex-shrink-0 ${
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
            <p className="text-sm font-semibold text-zinc-700 mb-3 border-b border-zinc-100 pb-2">
              {isDual ? dualVariant!.dimensions[1] : variantLabel}
              {showError && !selectedSize && (
                <span className="text-red-500 ml-1 font-normal">請選擇</span>
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
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-shrink-0 ${
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

          {/* 商品描述（可摺疊） */}
          {product.description && (
            <div>
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="w-full flex items-center justify-between text-sm font-semibold text-zinc-700 border-b border-zinc-100 pb-2"
              >
                <span>商品描述</span>
                <svg
                  className={`w-4 h-4 transition-transform ${showDescription ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDescription && (
                <div className="mt-3 text-sm text-zinc-600 whitespace-pre-wrap">
                  {product.description}
                </div>
              )}
            </div>
          )}

          {/* 數量 stepper */}
          <div>
            <p className="text-sm font-semibold text-zinc-700 mb-3 border-b border-zinc-100 pb-2">數量</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 active:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              <span className="text-lg font-semibold w-10 text-center">
                {qty}
              </span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(selectedStock || 99, q + 1))
                }
                disabled={qty >= selectedStock}
                className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 active:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom padding for CTA */}
          <div className="h-20" />
        </div>

        {/* 固定底部 CTA */}
        <div className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto px-4 py-4 bg-white border-t border-zinc-100">
          <button
            onClick={handleAdd}
            className={`w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-[0.98] ${
              canAdd
                ? "bg-[#FF9500] text-white shadow-lg shadow-[#FF9500]/30"
                : "bg-zinc-200 text-zinc-400"
            }`}
          >
            加入購物車{canAdd ? ` ${formatPrice(product.price * qty, currency)}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
