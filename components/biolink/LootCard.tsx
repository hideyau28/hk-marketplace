"use client";

import { useState } from "react";
import Image from "next/image";
import {
  type ProductForBioLink,
  getRarity,
  rarityConfig,
  getBadgeText,
  getAllImages,
  getVisibleVariants,
  getVariantLabel,
  getDualVariantData,
  isSoldOut,
  formatHKD,
} from "@/lib/biolink-helpers";
import VariantSelector from "./VariantSelector";
import SoldOutOverlay from "./SoldOutOverlay";

type Props = {
  product: ProductForBioLink;
  index: number;
  onAdd: (product: ProductForBioLink, variant: string | null) => void;
};

export default function LootCard({ product, index, onAdd }: Props) {
  const rarity = getRarity(product);
  const config = rarity ? rarityConfig[rarity] : rarityConfig.common;
  const badge = getBadgeText(product);
  const images = getAllImages(product);
  const heroImage = images[0] || null;
  const variants = getVisibleVariants(product);
  const dualVariant = getDualVariantData(product);
  const variantLabel = getVariantLabel(product);
  const soldOut = isSoldOut(product);
  const hasVideo = !!product.videoUrl;

  // 雙維 variant — 切換顏色時顯示對應圖片
  const [heroIndex, setHeroIndex] = useState(0);
  const displayHero = images[heroIndex] || heroImage;

  const isOnSale =
    product.originalPrice != null &&
    product.originalPrice > product.price;
  const discountPct = isOnSale
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      className="biolink-float-bob flex-shrink-0 w-[200px]"
      style={{ animationDelay: `${index * 0.3}s` }}
    >
      <div
        className={`relative rounded-2xl overflow-hidden bg-[#1a1a1a] border border-white/10 shadow-lg ${config.glow}`}
        style={{
          boxShadow: `0 8px 32px ${config.color}30, 0 0 0 1px ${config.color}20`,
        }}
      >
        {/* Rarity ribbon */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 z-10"
          style={{ backgroundColor: config.color }}
        />

        {/* Image */}
        <div className="relative aspect-square">
          {displayHero ? (
            <Image
              src={displayHero}
              alt={product.title}
              fill
              className="object-cover"
              sizes="200px"
              priority={index < 3}
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-3xl font-bold">
                {product.title.charAt(0)}
              </span>
            </div>
          )}

          {soldOut && <SoldOutOverlay />}

          {/* Badge */}
          {badge && !soldOut && (
            <div className="absolute top-2 left-2 z-10">
              <span
                className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded text-white"
                style={{ backgroundColor: config.color }}
              >
                {badge}
              </span>
            </div>
          )}

          {/* Rarity label — hidden for common/no-badge products */}
          {rarity && (
            <div className="absolute bottom-2 right-2 z-10">
              <span
                className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.15em] rounded text-white/80"
                style={{ backgroundColor: `${config.color}60` }}
              >
                {config.label}
              </span>
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

        {/* Info */}
        <div className="p-3">
          <h3 className="text-white text-sm font-semibold line-clamp-1 mb-1">
            {product.title}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            {isOnSale ? (
              <>
                <span className="text-white font-bold text-sm">
                  {formatHKD(product.price)}
                </span>
                <span className="text-zinc-500 text-xs line-through">
                  {formatHKD(product.originalPrice!)}
                </span>
                <span className="px-1 py-0.5 text-[9px] font-bold rounded bg-red-500 text-white">
                  -{discountPct}%
                </span>
              </>
            ) : (
              <span className="text-white font-bold text-sm">
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
            dualVariant={dualVariant}
            onImageChange={setHeroIndex}
          />
        </div>
      </div>
    </div>
  );
}
