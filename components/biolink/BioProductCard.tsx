"use client";

import Image from "next/image";
import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  isSoldOut,
  isNew,
  getLowStockCount,
  formatHKD,
} from "@/lib/biolink-helpers";
import SoldOutOverlay from "./SoldOutOverlay";
import NewBadge from "./NewBadge";
import LowStockBadge from "./LowStockBadge";

type Props = {
  product: ProductForBioLink;
  onAdd: (product: ProductForBioLink) => void;
};

export default function BioProductCard({ product, onAdd }: Props) {
  const images = getAllImages(product);
  const heroImage = images[0] || null;
  const variants = getVisibleVariants(product);
  const soldOut = isSoldOut(product);
  const isNewProduct = isNew(product);
  const lowStock = variants ? getLowStockCount(variants) : null;

  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-black/[0.04]">
      {/* Image 1:1 */}
      <div className="relative aspect-square">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 480px) 50vw, 240px"
          />
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
      </div>

      {/* Content */}
      <div className="p-3 relative">
        <h3 className="text-zinc-900 text-sm font-semibold truncate mb-1 pr-10">
          {product.title}
        </h3>

        <div className="flex items-center gap-2">
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

        {/* + 圓形按鈕 — 右下角 */}
        {!soldOut && (
          <button
            onClick={() => onAdd(product)}
            className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#FF9500] text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
