"use client";

import { useState } from "react";
import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  getVariantLabel,
  getDualVariantData,
  isSoldOut,
  isNew,
  getLowStockCount,
  formatHKD,
} from "@/lib/biolink-helpers";
import ImageCarousel from "./ImageCarousel";
import VariantSelector from "./VariantSelector";
import SoldOutOverlay from "./SoldOutOverlay";
import NewBadge from "./NewBadge";
import LowStockBadge from "./LowStockBadge";

type Props = {
  product: ProductForBioLink;
  onAdd: (product: ProductForBioLink, variant: string | null) => void;
};

export default function BioProductCard({ product, onAdd }: Props) {
  const images = getAllImages(product);
  const variants = getVisibleVariants(product);
  const dualVariant = getDualVariantData(product);
  const variantLabel = getVariantLabel(product);
  const soldOut = isSoldOut(product);
  const isNewProduct = isNew(product);
  const lowStock = variants ? getLowStockCount(variants) : null;
  const hasVideo = !!product.videoUrl;

  // 雙維 variant — 外部控制 ImageCarousel 顯示邊張圖
  const [activeImageIndex, setActiveImageIndex] = useState<number | undefined>(
    undefined
  );

  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-black/[0.04]">
      {/* Image */}
      <div className="relative">
        <ImageCarousel
          images={images}
          alt={product.title}
          activeIndex={activeImageIndex}
          videoUrl={product.videoUrl}
        />
        {soldOut && <SoldOutOverlay />}

        {/* Badges */}
        {!soldOut && (
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {isNewProduct && <NewBadge />}
            {lowStock && <LowStockBadge count={lowStock} />}
          </div>
        )}

        {/* Video icon — 左下角 */}
        {hasVideo && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="inline-block">
                <path d="M2 1.5v7l6-3.5-6-3.5z" fill="currentColor" />
              </svg>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-zinc-900 text-sm font-semibold line-clamp-2 min-h-[2.5rem] mb-1">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          {isOnSale ? (
            <>
              <span className="text-zinc-900 font-bold text-base">
                {formatHKD(product.price)}
              </span>
              <span className="text-zinc-400 text-xs line-through">
                {formatHKD(product.originalPrice!)}
              </span>
              <span className="px-1 py-0.5 text-[9px] font-bold rounded bg-red-500 text-white">
                -{discountPct}%
              </span>
            </>
          ) : (
            <span className="text-zinc-900 font-bold text-base">
              {formatHKD(product.price)}
            </span>
          )}
        </div>

        <VariantSelector
          variants={variants || []}
          label={variantLabel}
          productPrice={product.price}
          soldOut={soldOut}
          onAdd={(variant) => onAdd(product, variant)}
          theme="light"
          dualVariant={dualVariant}
          onImageChange={setActiveImageIndex}
        />
      </div>
    </div>
  );
}
