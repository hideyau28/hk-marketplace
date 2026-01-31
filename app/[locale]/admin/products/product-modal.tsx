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
  const [category, setCategory] = useState(product?.category || "");
  const [active, setActive] = useState(product?.active ?? true);

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
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">{product ? "Edit Product" : "Create Product"}</h2>
            <p className="mt-1 text-zinc-500 text-sm">
              {product ? "Update product details" : "Add a new product to your catalog"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="text-zinc-400 hover:text-zinc-600 disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-red-600 font-semibold text-sm">{error.code}</div>
            <div className="mt-1 text-red-600 text-sm">{error.message}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">Brand *</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="Nike / Adidas / Uniqlo"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">Model / Description *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="Dri-FIT Tee / Air Zoom Pegasus"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">Price (HKD) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">
              Badges <span className="text-zinc-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={badges}
              onChange={(e) => setBadges(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="現貨, 快乾, 透氣"
            />
            <p className="mt-1 text-zinc-400 text-xs">Enter badges separated by commas. Duplicates will be removed.</p>
          </div>

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">
              Category <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="sports / accessories / office"
            />
            <p className="mt-1 text-zinc-400 text-xs">Used for filtering and home rails later.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              disabled={isPending}
              className="h-4 w-4 accent-olive-600 disabled:opacity-50"
            />
            <label htmlFor="active" className="text-zinc-700 text-sm">
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-2xl bg-olive-600 px-4 py-3 text-sm text-white font-semibold hover:bg-olive-700 disabled:opacity-50"
            >
              {isPending ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
