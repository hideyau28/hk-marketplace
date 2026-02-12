"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  isSoldOut,
  isNew,
  getLowStockCount,
  formatPrice,
} from "@/lib/biolink-helpers";
import SoldOutOverlay from "./SoldOutOverlay";
import NewBadge from "./NewBadge";
import LowStockBadge from "./LowStockBadge";

type Props = {
  product: ProductForBioLink;
  currency?: string;
  onAdd: (product: ProductForBioLink) => void;
  onImageTap?: (images: string[], startIndex: number, videoUrl?: string | null) => void;
};

export default function BioProductCard({ product, currency = "HKD", onAdd, onImageTap }: Props) {
  const images = getAllImages(product);
  const heroImage = images[0] || null;
  const variants = getVisibleVariants(product);
  const soldOut = isSoldOut(product);
  const isNewProduct = isNew(product);
  const lowStock = variants ? getLowStockCount(variants) : null;
  const hasMultipleImages = images.length > 1;
  const hasVideo = !!product.videoUrl;

  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 自動輪播 — 多張圖每 3 秒切換
  useEffect(() => {
    if (!hasMultipleImages) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasMultipleImages, images.length]);

  const handleImageTap = useCallback(() => {
    if (images.length > 0 && onImageTap) {
      onImageTap(images, current, product.videoUrl);
    }
  }, [images, current, onImageTap, product.videoUrl]);

  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-black/[0.04]">
      {/* Image 1:1 with carousel */}
      <div
        className="relative aspect-square overflow-hidden cursor-pointer"
        onClick={handleImageTap}
      >
        {heroImage ? (
          <div className="relative w-full h-full">
            {/* 所有圖片疊喺一齊，用 opacity 切換 */}
            {images.map((src, i) => (
              <Image
                key={src}
                src={src}
                alt={`${product.title} ${i + 1}`}
                fill
                className={`object-cover transition-opacity duration-500 ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 480px) 50vw, 240px"
                loading={i === 0 ? undefined : "lazy"}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-400 text-3xl font-bold">
              {product.title.charAt(0)}
            </span>
          </div>
        )}

        {soldOut && <SoldOutOverlay />}

        {/* Badges — 左上角 */}
        {!soldOut && (
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {isNewProduct && <NewBadge />}
            {lowStock && <LowStockBadge count={lowStock} />}
          </div>
        )}

        {/* Video icon */}
        {hasVideo && (
          <div className="absolute bottom-2 right-2 z-10">
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-white">
              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" className="inline-block">
                <path d="M2 1.5v7l6-3.5-6-3.5z" fill="currentColor" />
              </svg>
            </span>
          </div>
        )}

        {/* Dots 指示器 — 只有多張圖先顯示 */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
            {images.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all ${
                  i === current
                    ? "w-3 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 relative">
        <h3 className="text-zinc-900 text-sm font-semibold leading-snug mb-1 pr-10" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.title}
        </h3>

        <div className="flex items-center gap-2">
          {isOnSale ? (
            <>
              <span className="text-zinc-900 font-bold text-base">
                {formatPrice(product.price, currency)}
              </span>
              <span className="text-zinc-400 text-xs line-through">
                {formatPrice(product.originalPrice!, currency)}
              </span>
              <span className="px-1 py-0.5 text-[9px] font-bold rounded bg-red-500 text-white">
                -{discountPct}%
              </span>
            </>
          ) : (
            <span className="text-zinc-900 font-bold text-base">
              {formatPrice(product.price, currency)}
            </span>
          )}
        </div>

        {/* + 圓形按鈕 — 右下角 */}
        <button
          onClick={() => !soldOut && onAdd(product)}
          disabled={soldOut}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-transform ${
            soldOut
              ? "bg-zinc-300 text-zinc-400 cursor-not-allowed"
              : "bg-[#FF9500] text-white active:scale-95"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
