"use client";

import { useState, useTransition } from "react";
import type { Product } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { createProduct, updateProduct } from "./actions";
import ImageUpload from "@/components/admin/ImageUpload";

const SIZE_DEFAULTS: Record<string, string[]> = {
  shoes: ["38", "39", "40", "41", "42", "43", "44"],
  tops: ["S", "M", "L", "XL"],
  pants: ["28", "30", "32", "34", "36"],
  socks: ["S", "M", "L"],
  accessories: ["One Size"],
};

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
  const [featured, setFeatured] = useState((product as any)?.featured ?? false);
  const [sizeSystem, setSizeSystem] = useState((product as any)?.sizeSystem || "");
  const [sizes, setSizes] = useState(
    (product as any)?.sizes && Array.isArray((product as any).sizes)
      ? ((product as any).sizes as string[]).join(", ")
      : ""
  );
  const [stock, setStock] = useState((product as any)?.stock?.toString() || "0");

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

    const stockNum = Number(stock);
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setError({ code: "VALIDATION_ERROR", message: "Stock must be a non-negative integer" });
      return;
    }

    // Parse sizes array
    const sizesArray = sizes.trim() ? sizes.split(",").map((s) => s.trim()).filter(Boolean) : [];
    if (sizeSystem.trim() && sizesArray.length === 0) {
      setError({ code: "VALIDATION_ERROR", message: "Sizes are required when size system is selected" });
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
            featured,
            sizeSystem: sizeSystem.trim() || null,
            sizes: sizesArray.length > 0 ? sizesArray : null,
            stock: stockNum,
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
            featured,
            sizeSystem: sizeSystem.trim() || undefined,
            sizes: sizesArray.length > 0 ? sizesArray : undefined,
            stock: stockNum,
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
            <label className="block text-zinc-700 text-sm font-medium mb-2">Product Image</label>
            <ImageUpload
              currentUrl={imageUrl}
              onUpload={(url) => setImageUrl(url)}
              disabled={isPending}
            />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isPending}
              className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="Or paste image URL here"
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
              placeholder="Shoes / Tops / Pants / Accessories"
            />
            <p className="mt-1 text-zinc-400 text-xs">Used for filtering and home rails.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">
                Size System <span className="text-zinc-400 font-normal">(optional)</span>
              </label>
              <select
                value={sizeSystem}
                onChange={(e) => {
                  const next = e.target.value;
                  setSizeSystem(next);
                  if (!next) {
                    setSizes("");
                  } else {
                    setSizes(SIZE_DEFAULTS[next]?.join(", ") || "");
                  }
                }}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              >
                <option value="">No sizes</option>
                <option value="shoes">Shoes (38-44)</option>
                <option value="tops">Tops (S-XL)</option>
                <option value="pants">Pants (28-36)</option>
                <option value="socks">Socks (S-L)</option>
                <option value="accessories">Accessories (One Size)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                placeholder="0"
              />
            </div>
          </div>

          {sizeSystem && (
            <div>
              <label className="block text-zinc-700 text-sm font-medium mb-2">Sizes</label>
              <input
                type="text"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                disabled={isPending}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                placeholder="Comma-separated sizes"
              />
              <p className="mt-1 text-zinc-400 text-xs">You can customize sizes by editing this list.</p>
            </div>
          )}

          <div>
            <label className="block text-zinc-700 text-sm font-medium mb-2">
              Sizes <span className="text-zinc-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={sizes}
              onChange={(e) => setSizes(e.target.value)}
              disabled={isPending}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
              placeholder="38, 39, 40, 41, 42"
            />
            <p className="mt-1 text-zinc-400 text-xs">Available sizes for this product. Leave empty if no size selection needed.</p>
          </div>

          <div className="flex items-center gap-6">
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
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                disabled={isPending}
                className="h-4 w-4 accent-yellow-500 disabled:opacity-50"
              />
              <label htmlFor="featured" className="text-zinc-700 text-sm">
                ⭐ Featured (為你推薦)
              </label>
            </div>
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
