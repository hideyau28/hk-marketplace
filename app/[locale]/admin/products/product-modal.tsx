"use client";

import { useState, useTransition } from "react";
import type { Product } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { createProduct, updateProduct } from "./actions";

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  locale: Locale;
};

// Available promotion badge options
const PROMOTION_BADGE_OPTIONS = [
  "店長推介",
  "今期熱賣",
  "新品上架",
  "限時優惠",
  "人氣之選",
];

export function ProductModal({ product, onClose, locale }: ProductModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const [brand, setBrand] = useState(product?.brand || "");
  const [title, setTitle] = useState(product?.title || "");
  const [price, setPrice] = useState(product?.price.toString() || "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [badges, setBadges] = useState(
    product?.badges && Array.isArray(product.badges) ? (product.badges as string[]).join(", ") : ""
  );
  const [promotionBadges, setPromotionBadges] = useState<string[]>(
    product?.promotionBadges || []
  );
  const [category, setCategory] = useState(product?.category || "");
  const [active, setActive] = useState(product?.active ?? true);

  const togglePromotionBadge = (badge: string) => {
    setPromotionBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : [...prev, badge]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError({ code: "VALIDATION_ERROR", message: "Price must be a non-negative number" });
      return;
    }

    if (!brand.trim()) {
      setError({ code: "VALIDATION_ERROR", message: "Brand is required" });
      return;
    }

    if (!title.trim()) {
      setError({ code: "VALIDATION_ERROR", message: "Title is required" });
      return;
    }

    startTransition(async () => {
      let result;
      if (product) {
        // Update existing product
        result = await updateProduct(
          product.id,
          {
            brand: brand.trim(),
            title: title.trim(),
            price: priceNum,
            imageUrl: imageUrl.trim() || null,
            badges: badges.trim() || undefined,
            promotionBadges,
            category: category.trim() || null,
            active,
          },
          locale
        );
      } else {
        // Create new product
        result = await createProduct(
          {
            brand: brand.trim(),
            title: title.trim(),
            price: priceNum,
            imageUrl: imageUrl.trim() || undefined,
            badges: badges.trim() || undefined,
            promotionBadges,
            category: category.trim() || null,
            active,
          },
          locale
        );
      }

      if (result.ok) {
        onClose();
        window.location.reload();
      } else {
        setError({ code: result.code, message: result.message });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0a0a0a] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{product ? "Edit Product" : "Create Product"}</h2>
            <p className="mt-1 text-white/60 text-sm">
              {product ? "Update product details" : "Add a new product to your catalog"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-white/60 hover:text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="text-red-400 font-semibold text-sm">{error.code}</div>
            <div className="mt-1 text-red-300 text-sm">{error.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Brand *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="Nike / Adidas / Uniqlo"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Model / Description *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="Dri-FIT Tee / Air Zoom Pegasus"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Price (HKD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Badges <span className="text-white/40 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={badges}
              onChange={(e) => setBadges(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="現貨, 快乾, 透氣"
            />
            <p className="mt-1 text-white/40 text-xs">Enter badges separated by commas. Duplicates will be removed.</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Category <span className="text-white/40 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
              placeholder="sports / accessories / office"
            />
            <p className="mt-1 text-white/40 text-xs">Used for filtering and home rails later.</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Promotion Badges <span className="text-white/40 font-normal">(shown on product image)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PROMOTION_BADGE_OPTIONS.map((badge) => (
                <button
                  key={badge}
                  type="button"
                  onClick={() => togglePromotionBadge(badge)}
                  disabled={isPending}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors disabled:opacity-50 ${
                    promotionBadges.includes(badge)
                      ? "bg-olive-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>
            <p className="mt-2 text-white/40 text-xs">
              Note: "快將售罄" is auto-added when stock ≤ 5
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 accent-white disabled:opacity-50"
            />
            <label htmlFor="active" className="text-white/80 text-sm">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-black font-semibold hover:bg-white/90 disabled:opacity-50"
            >
              {isPending ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
