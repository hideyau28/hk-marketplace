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
import { useTemplate } from "@/lib/template-context";

type Props = {
  product: ProductForBioLink;
  currency?: string;
  onClose: () => void;
  onAddToCart: (product: ProductForBioLink, variant: string | null, qty: number) => void;
};

export default function ProductSheet({ product, currency = "HKD", onClose, onAddToCart }: Props) {
  const tmpl = useTemplate();
  const images = getAllImages(product);
  const dualVariant = getDualVariantData(product);
  const singleVariants = getVisibleVariants(product);
  const variantLabel = getVariantLabel(product);
  const videoEmbedUrl = product.videoUrl ? getEmbedUrl(product.videoUrl) : null;

  const isDual = dualVariant !== null;

  // 檢測邊個 dimension 係顏色
  const isColorDimension = (dimName: string) => {
    const lower = dimName.toLowerCase();
    return lower.includes("color") || lower.includes("顏色") || lower === "色";
  };

  // 決定顏色同尺碼嘅 dimension index
  let colorDimIndex = -1;
  let sizeDimIndex = -1;
  if (isDual && dualVariant) {
    if (isColorDimension(dualVariant.dimensions[0])) {
      colorDimIndex = 0;
      sizeDimIndex = 1;
    } else {
      colorDimIndex = 1;
      sizeDimIndex = 0;
    }
  }

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
    if (isDual && dualVariant && colorDimIndex >= 0 && sizeDimIndex >= 0) {
      const colorOptions = dualVariant.options[dualVariant.dimensions[colorDimIndex]] || [];
      const sizeOptions = dualVariant.options[dualVariant.dimensions[sizeDimIndex]] || [];
      for (const c of colorOptions) {
        for (const s of sizeOptions) {
          // 組合 key 要按照原本 dimensions 嘅順序
          const key = colorDimIndex === 0 ? `${c}|${s}` : `${s}|${c}`;
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
    if (isDual && dualVariant && selectedColor && selectedSize && colorDimIndex >= 0) {
      // 組合 key 要按照原本 dimensions 嘅順序
      const key = colorDimIndex === 0 ? `${selectedColor}|${selectedSize}` : `${selectedSize}|${selectedColor}`;
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
    if (dualVariant && sizeDimIndex >= 0 && colorDimIndex >= 0) {
      const imgIdx = dualVariant.optionImages?.[color] ?? 0;
      setCarouselIndex(imgIdx);
      // 自動選第一個有貨尺碼
      const sizeOptions = dualVariant.options[dualVariant.dimensions[sizeDimIndex]] || [];
      for (const s of sizeOptions) {
        const key = colorDimIndex === 0 ? `${color}|${s}` : `${s}|${color}`;
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
      const variantKey = colorDimIndex === 0 ? `${selectedColor}|${selectedSize}` : `${selectedSize}|${selectedColor}`;
      onAddToCart(product, variantKey, qty);
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
    if (isDual && dualVariant && sizeDimIndex >= 0 && colorDimIndex >= 0) {
      const sizeDim = dualVariant.dimensions[sizeDimIndex];
      const sizeOptions = dualVariant.options[sizeDim] || [];
      return sizeOptions.map((opt) => {
        const key = colorDimIndex === 0 ? `${selectedColor}|${opt}` : `${opt}|${selectedColor}`;
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

  // Derived border color
  const sectionBorder = `${tmpl.subtext}25`;

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: tmpl.bg }}>
      {/* Fullscreen modal */}
      <div className="h-full flex flex-col max-w-[480px] mx-auto animate-slide-up">
        {/* Image Carousel Section - 全寬 1:1 */}
        <div className="relative w-full aspect-square" style={{ backgroundColor: `${tmpl.card}` }}>
          {/* Close button - 右上角 */}
          <button
            onClick={onClose}
            aria-label="關閉"
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
                  aria-label={`查看圖片 ${idx + 1}`}
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
            <h3 className="text-xl font-bold mb-2" style={{ color: tmpl.text }}>
              {product.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl" style={{ color: tmpl.text }}>
                {formatPrice(product.price, currency)}
              </span>
              {isOnSale && (
                <>
                  <span className="text-base line-through" style={{ color: tmpl.subtext }}>
                    {formatPrice(product.originalPrice!, currency)}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded bg-red-500 text-white">
                    -{discountPct}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* 顏色（雙維 only，永遠顯示喺先） */}
          {isDual && dualVariant && colorDimIndex >= 0 && (
            <div>
              <p className="text-sm font-semibold mb-3 pb-2" style={{ color: tmpl.text, borderBottom: `1px solid ${sectionBorder}` }}>
                顏色
                {showError && !selectedColor && (
                  <span className="text-red-500 ml-1 font-normal">請選擇</span>
                )}
              </p>
              <div className="flex gap-3 flex-wrap">
                {(dualVariant.options[dualVariant.dimensions[colorDimIndex]] || []).map(
                  (opt) => {
                    const colorHex = getColorHex(opt);
                    const isWhite = colorHex.toLowerCase() === "#fafafa" || opt.toLowerCase().includes("white") || opt.includes("白");
                    return (
                      <button
                        key={opt}
                        onClick={() => handleColorChange(opt)}
                        aria-label={`選擇顏色 ${opt}`}
                        className={`w-10 h-10 rounded-full transition-all flex-shrink-0 border-2 ${
                          selectedColor === opt
                            ? "scale-110"
                            : ""
                        }`}
                        style={{
                          backgroundColor: colorHex,
                          borderColor: selectedColor === opt ? tmpl.accent : isWhite ? "#d4d4d8" : "#e4e4e7",
                          boxShadow: selectedColor === opt ? `0 0 0 3px ${tmpl.accent}4D` : undefined,
                        }}
                      />
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* 尺碼（用文字顯示） */}
          <div>
            <p className="text-sm font-semibold mb-3 pb-2" style={{ color: tmpl.text, borderBottom: `1px solid ${sectionBorder}` }}>
              {isDual && sizeDimIndex >= 0 ? dualVariant!.dimensions[sizeDimIndex] : variantLabel}
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
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all flex-shrink-0"
                  style={
                    selectedSize === s.name
                      ? { borderColor: tmpl.accent, backgroundColor: `${tmpl.accent}18`, color: tmpl.accent }
                      : s.available
                        ? { borderColor: sectionBorder, color: tmpl.text }
                        : { borderColor: `${tmpl.subtext}15`, color: `${tmpl.subtext}60`, backgroundColor: `${tmpl.subtext}08`, textDecoration: "line-through", cursor: "not-allowed" }
                  }
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
                aria-label={showDescription ? "隱藏商品描述" : "展開商品描述"}
                className="w-full flex items-center justify-between text-sm font-semibold pb-2"
                style={{ color: tmpl.text, borderBottom: `1px solid ${sectionBorder}` }}
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
                <div className="mt-3 text-sm whitespace-pre-wrap" style={{ color: tmpl.subtext }}>
                  {product.description}
                </div>
              )}
            </div>
          )}

          {/* 數量 stepper */}
          <div>
            <p className="text-sm font-semibold mb-3 pb-2" style={{ color: tmpl.text, borderBottom: `1px solid ${sectionBorder}` }}>數量</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label="減少數量"
                className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: sectionBorder, color: tmpl.text }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              <span className="text-lg font-semibold w-10 text-center" style={{ color: tmpl.text }}>
                {qty}
              </span>
              <button
                onClick={() =>
                  setQty((q) => Math.min(selectedStock || 99, q + 1))
                }
                disabled={qty >= selectedStock}
                aria-label="增加數量"
                className="w-10 h-10 rounded-xl border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ borderColor: sectionBorder, color: tmpl.text }}
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
        <div className="absolute bottom-0 left-0 right-0 max-w-[480px] mx-auto px-4 py-4" style={{ backgroundColor: tmpl.bg, borderTop: `1px solid ${sectionBorder}` }}>
          <button
            onClick={handleAdd}
            className="w-full py-4 rounded-xl text-base font-semibold transition-all active:scale-[0.98]"
            style={
              canAdd
                ? { backgroundColor: tmpl.accent, color: "#FFFFFF", boxShadow: `0 10px 15px -3px ${tmpl.accent}4D` }
                : { backgroundColor: `${tmpl.subtext}30`, color: tmpl.subtext }
            }
          >
            加入購物車{canAdd ? ` ${formatPrice(product.price * qty, currency)}` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
