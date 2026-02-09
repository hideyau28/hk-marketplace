"use client";

import { useState, useEffect, useRef } from "react";
import { X, Camera, Loader2, Trash2, Plus } from "lucide-react";

type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
  isNew: boolean;
  locale: string;
};

export default function ProductEditSheet({ isOpen, onClose, onSave, product, isNew, locale }: Props) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [variants, setVariants] = useState<{ name: string; stock: number }[]>([]);
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantStock, setNewVariantStock] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const isZh = locale === "zh-HK";

  useEffect(() => {
    if (isOpen) {
      if (product && !isNew) {
        setTitle(product.title);
        setPrice(String(product.price));
        setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
        setImages(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []);
        setVideoUrl("");
        setVariants([]);
      } else {
        setTitle("");
        setPrice("");
        setOriginalPrice("");
        setImages([]);
        setVideoUrl("");
        setVariants([]);
      }
      setError("");
      setConfirmDelete(false);
      setNewVariantName("");
      setNewVariantStock("");
    }
  }, [isOpen, product, isNew]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 5 * 1024 * 1024) {
        setError(isZh ? "圖片唔可以大過 5MB" : "Image must be less than 5MB");
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.ok && data.data?.url) {
          setImages((prev) => [...prev, data.data.url]);
        } else {
          setError(data.error?.message || "Upload failed");
        }
      } catch {
        setError(isZh ? "上傳失敗" : "Upload failed");
      }
    }

    setUploading(false);
  };

  const handleRemoveImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariant = () => {
    if (!newVariantName.trim()) return;
    setVariants((prev) => [
      ...prev,
      { name: newVariantName.trim(), stock: parseInt(newVariantStock) || 0 },
    ]);
    setNewVariantName("");
    setNewVariantStock("");
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setError("");

    if (!title.trim()) {
      setError(isZh ? "請輸入商品名稱" : "Product name is required");
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError(isZh ? "請輸入有效價錢" : "Please enter a valid price");
      return;
    }

    setSaving(true);

    try {
      const body: any = {
        title: title.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        imageUrl: images[0] || null,
        images,
        videoUrl: videoUrl || null,
        active: true,
        sortOrder: isNew ? 0 : undefined,
      };

      // 加 variants 如果有
      if (variants.length > 0) {
        body.sizes = Object.fromEntries(variants.map((v) => [v.name, v.stock]));
      }

      const url = isNew
        ? "/api/admin/products"
        : `/api/admin/products/${product!.id}`;
      const method = isNew ? "POST" : "PUT";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (isNew) {
        headers["x-idempotency-key"] = crypto.randomUUID();
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error?.message || "Failed to save");
        setSaving(false);
        return;
      }

      onSave();
    } catch {
      setError(isZh ? "儲存失敗" : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product || isNew) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onSave();
      } else {
        setError(isZh ? "刪除失敗" : "Failed to delete");
      }
    } catch {
      setError(isZh ? "刪除失敗" : "Failed to delete");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-zinc-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900">
            {isNew
              ? (isZh ? "新增商品" : "New Product")
              : (isZh ? "編輯商品" : "Edit Product")}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              {isZh ? "商品圖片" : "Product Images"}
            </label>
            <div className="flex gap-2 flex-wrap">
              {images.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {uploading && (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center">
                  <Loader2 size={20} className="text-zinc-400 animate-spin" />
                </div>
              )}

              <div className="flex gap-2">
                {/* Camera button (mobile) */}
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center hover:border-[#FF9500] transition-colors"
                >
                  <Camera size={18} className="text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 mt-0.5">{isZh ? "影相" : "Camera"}</span>
                </button>
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center hover:border-[#FF9500] transition-colors"
                >
                  <Plus size={18} className="text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 mt-0.5">{isZh ? "上傳" : "Upload"}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {isZh ? "商品名稱 *" : "Product Name *"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isZh ? "例如：棉麻襯衫" : "e.g. Cotton Shirt"}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {isZh ? "價錢 (HK$) *" : "Price (HK$) *"}
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Original Price */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {isZh ? "原價（可選，劃線價）" : "Original Price (optional, strikethrough)"}
            </label>
            <input
              type="number"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder={isZh ? "留空表示冇折扣" : "Leave empty for no discount"}
              min="0"
              step="1"
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
            />
          </div>

          {/* Variants / Sizes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {isZh ? "尺碼 / 款式（可選）" : "Sizes / Variants (optional)"}
            </label>
            {variants.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {variants.map((v, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-sm px-3 py-1 rounded-full"
                  >
                    {v.name}({v.stock})
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-zinc-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                placeholder={isZh ? "名稱 (如 S, M, L)" : "Name (e.g. S, M, L)"}
                className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddVariant())}
              />
              <input
                type="number"
                value={newVariantStock}
                onChange={(e) => setNewVariantStock(e.target.value)}
                placeholder={isZh ? "庫存" : "Stock"}
                min="0"
                className="w-20 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
              />
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-2 rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors text-sm font-medium"
              >
                +
              </button>
            </div>
          </div>

          {/* Video URL */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              {isZh ? "影片連結（可選）" : "Video URL (optional)"}
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
          {!isNew && product && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                confirmDelete
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-zinc-100 text-zinc-600 hover:bg-red-50 hover:text-red-600"
              } disabled:opacity-50`}
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : confirmDelete ? (
                isZh ? "確定刪除？" : "Confirm Delete?"
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-[#FF9500] text-white font-semibold hover:bg-[#E68600] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {isZh ? "儲存" : "Save"}
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
