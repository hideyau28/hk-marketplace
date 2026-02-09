"use client";

import {
  type ProductForBioLink,
  getAllImages,
  getVisibleVariants,
  getVariantLabel,
  isSoldOut,
  isNew,
  getLowStockCount,
  isPreorder as checkPreorder,
  formatArrivalDate,
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
  const variantLabel = getVariantLabel(product);
  const soldOut = isSoldOut(product);
  const isNewProduct = isNew(product);
  const lowStock = variants ? getLowStockCount(variants) : null;
  const preorder = checkPreorder(product);

  const isOnSale =
    product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-black/[0.04]">
      {/* Image */}
      <div className="relative">
        <ImageCarousel images={images} alt={product.title} />
        {soldOut && <SoldOutOverlay />}

        {/* Badges */}
        {!soldOut && (
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {preorder && (
              <span className="bg-[#FF9500] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                PRE-ORDER
              </span>
            )}
            {!preorder && isNewProduct && <NewBadge />}
            {lowStock && <LowStockBadge count={lowStock} />}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-zinc-900 text-sm font-semibold line-clamp-2 min-h-[2.5rem] mb-1">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-1">
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

        {preorder && product.preorderDate && (
          <p className="text-xs text-zinc-400 mb-2">
            📦 {formatArrivalDate(product.preorderDate)}
          </p>
        )}

        {!preorder && <div className="mb-2" />}

        <VariantSelector
          variants={variants || []}
          label={variantLabel}
          productPrice={product.price}
          soldOut={soldOut}
          onAdd={(variant) => onAdd(product, variant)}
          theme="light"
          isPreorder={preorder}
        />
      </div>
    </div>
  );
}
