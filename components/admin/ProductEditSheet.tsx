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
  sizes: Record<string, unknown> | null;
  sizeSystem: string | null;
  featured?: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
  isNew: boolean;
  locale: string;
};

// --- Variant data types ---
type SingleVariantValue = { name: string; qty: number };
type DualVariantData = {
  dimensions: string[];
  options: Record<string, string[]>;
  combinations: Record<string, { qty: number; status: string }>;
};

/** Parse existing sizes JSON into editor state */
function parseExistingSizes(sizes: Record<string, unknown> | null, sizeSystem: string | null) {
  if (!sizes || typeof sizes !== "object") {
    return { mode: "none" as const, optionName1: "", values1: [] as SingleVariantValue[], optionName2: "", values2: [] as string[], grid: {} as Record<string, number> };
  }

  // DualVariantData format
  if ("dimensions" in sizes && "combinations" in sizes) {
    const dual = sizes as unknown as DualVariantData;
    const dim1 = dual.dimensions[0] || "";
    const dim2 = dual.dimensions[1] || "";
    const opts1 = dual.options[dim1] || [];
    const opts2 = dual.options[dim2] || [];
    const grid: Record<string, number> = {};
    for (const [key, combo] of Object.entries(dual.combinations)) {
      grid[key] = combo.qty;
    }
    return {
      mode: "dual" as const,
      optionName1: dim1,
      values1: opts1.map((n) => ({ name: n, qty: 0 })),
      optionName2: dim2,
      values2: opts2,
      grid,
    };
  }

  const entries = Object.entries(sizes);
  if (entries.length === 0) {
    return { mode: "none" as const, optionName1: "", values1: [] as SingleVariantValue[], optionName2: "", values2: [] as string[], grid: {} as Record<string, number> };
  }

  // New single format: {"S": {"qty": 5, "status": "available"}}
  const firstVal = entries[0][1];
  if (typeof firstVal === "object" && firstVal !== null && "qty" in (firstVal as Record<string, unknown>)) {
    const values1 = entries.map(([name, val]) => ({
      name,
      qty: (val as { qty: number }).qty,
    }));
    return {
      mode: "single" as const,
      optionName1: sizeSystem || "",
      values1,
      optionName2: "",
      values2: [] as string[],
      grid: {} as Record<string, number>,
    };
  }

  // Legacy format: {"S": 5}
  const values1 = entries.map(([name, val]) => ({
    name,
    qty: typeof val === "number" ? val : 0,
  }));
  return {
    mode: "single" as const,
    optionName1: sizeSystem || "",
    values1,
    optionName2: "",
    values2: [] as string[],
    grid: {} as Record<string, number>,
  };
}

export default function ProductEditSheet({ isOpen, onClose, onSave, product, isNew, locale }: Props) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // --- Variant state ---
  const [variantMode, setVariantMode] = useState<"none" | "single" | "dual">("none");
  const [optionName1, setOptionName1] = useState("");
  const [values1, setValues1] = useState<SingleVariantValue[]>([]);
  const [newVal1Name, setNewVal1Name] = useState("");
  const [newVal1Qty, setNewVal1Qty] = useState("");
  const [optionName2, setOptionName2] = useState("");
  const [values2, setValues2] = useState<string[]>([]);
  const [newVal2Name, setNewVal2Name] = useState("");
  const [grid, setGrid] = useState<Record<string, number>>({});

  const isZh = locale === "zh-HK";

  useEffect(() => {
    if (isOpen) {
      if (product && !isNew) {
        setTitle(product.title);
        setPrice(String(product.price));
        setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
        setImages(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []);
        setVideoUrl("");
        setFeatured(product.featured || false);

        // Load existing variant data
        const parsed = parseExistingSizes(product.sizes, product.sizeSystem);
        setVariantMode(parsed.mode);
        setOptionName1(parsed.optionName1);
        setValues1(parsed.values1);
        setOptionName2(parsed.optionName2);
        setValues2(parsed.values2);
        setGrid(parsed.grid);
      } else {
        setTitle("");
        setPrice("");
        setOriginalPrice("");
        setImages([]);
        setVideoUrl("");
        setFeatured(false);
        setVariantMode("none");
        setOptionName1("");
        setValues1([]);
        setOptionName2("");
        setValues2([]);
        setGrid({});
      }
      setError("");
      setConfirmDelete(false);
      setNewVal1Name("");
      setNewVal1Qty("");
      setNewVal2Name("");
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

  // --- Variant helpers ---
  const handleAddValue1 = () => {
    const name = newVal1Name.trim();
    if (!name) return;
    if (values1.some((v) => v.name === name)) return;
    const qty = parseInt(newVal1Qty) || 0;
    setValues1((prev) => [...prev, { name, qty }]);
    setNewVal1Name("");
    setNewVal1Qty("");

    // If dual mode, initialize grid for new value1 × all values2
    if (variantMode === "dual") {
      setGrid((prev) => {
        const next = { ...prev };
        for (const v2 of values2) {
          const key = `${name}|${v2}`;
          if (!(key in next)) next[key] = 0;
        }
        return next;
      });
    }
  };

  const handleRemoveValue1 = (idx: number) => {
    const removed = values1[idx];
    setValues1((prev) => prev.filter((_, i) => i !== idx));

    // Clean up grid entries
    if (variantMode === "dual" && removed) {
      setGrid((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (key.startsWith(`${removed.name}|`)) delete next[key];
        }
        return next;
      });
    }
  };

  const handleAddValue2 = () => {
    const name = newVal2Name.trim();
    if (!name) return;
    if (values2.includes(name)) return;
    setValues2((prev) => [...prev, name]);
    setNewVal2Name("");

    // Initialize grid entries for all values1 × new value2
    setGrid((prev) => {
      const next = { ...prev };
      for (const v1 of values1) {
        const key = `${v1.name}|${name}`;
        if (!(key in next)) next[key] = 0;
      }
      return next;
    });
  };

  const handleRemoveValue2 = (idx: number) => {
    const removed = values2[idx];
    setValues2((prev) => prev.filter((_, i) => i !== idx));

    // Clean up grid entries
    setGrid((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (key.endsWith(`|${removed}`)) delete next[key];
      }
      return next;
    });
  };

  const handleGridChange = (key: string, value: string) => {
    setGrid((prev) => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleEnableSingleOption = () => {
    setVariantMode("single");
  };

  const handleEnableDualOption = () => {
    setVariantMode("dual");
    // Convert existing single values1 qty to grid is not needed — grid starts fresh
    // Keep values1 as is but clear their qty (will use grid instead)
  };

  const handleRemoveOptions = () => {
    setVariantMode("none");
    setOptionName1("");
    setValues1([]);
    setOptionName2("");
    setValues2([]);
    setGrid({});
  };

  // --- Build sizes data for API ---
  const buildSizesPayload = (): { sizes: Record<string, unknown> | null; sizeSystem: string | null } => {
    if (variantMode === "none" || values1.length === 0) {
      return { sizes: null, sizeSystem: null };
    }

    if (variantMode === "single") {
      // Single variant format: {"S": {"qty": 5, "status": "available"}, ...}
      const sizes: Record<string, { qty: number; status: string }> = {};
      for (const v of values1) {
        sizes[v.name] = { qty: v.qty, status: v.qty > 0 ? "available" : "available" };
      }
      return { sizes, sizeSystem: optionName1.trim() || null };
    }

    // Dual variant format
    const combinations: Record<string, { qty: number; status: string }> = {};
    for (const v1 of values1) {
      for (const v2 of values2) {
        const key = `${v1.name}|${v2}`;
        const qty = grid[key] || 0;
        combinations[key] = { qty, status: "available" };
      }
    }

    const dualData: DualVariantData = {
      dimensions: [optionName1.trim() || (isZh ? "選項1" : "Option 1"), optionName2.trim() || (isZh ? "選項2" : "Option 2")],
      options: {
        [optionName1.trim() || (isZh ? "選項1" : "Option 1")]: values1.map((v) => v.name),
        [optionName2.trim() || (isZh ? "選項2" : "Option 2")]: values2,
      },
      combinations,
    };

    return { sizes: dualData as unknown as Record<string, unknown>, sizeSystem: null };
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
      const { sizes, sizeSystem } = buildSizesPayload();

      const body: Record<string, unknown> = {
        title: title.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        imageUrl: images[0] || null,
        images,
        videoUrl: videoUrl || null,
        active: true,
        featured,
      };

      if (isNew) {
        body.sortOrder = 0;
      }

      // Always send sizes/sizeSystem so clearing variants works
      if (sizes) {
        body.sizes = sizes;
        if (sizeSystem) body.sizeSystem = sizeSystem;
      }

      const url = isNew
        ? "/api/admin/products"
        : `/api/admin/products/${product!.id}`;
      const method = isNew ? "POST" : "PATCH";

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

          {/* --- Variant Options Section --- */}
          <div>
            {variantMode === "none" ? (
              /* 均碼 — show add option button */
              <button
                type="button"
                onClick={handleEnableSingleOption}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 text-zinc-600 hover:border-[#FF9500] hover:text-[#FF9500] transition-colors text-sm font-medium w-full justify-center"
              >
                <Plus size={16} />
                {isZh ? "加選項（尺碼 / 口味等）" : "Add options (size / flavor etc.)"}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Option 1 header */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    {isZh ? "選項名稱" : "Option name"}
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveOptions}
                    className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    {isZh ? "移除選項" : "Remove options"}
                  </button>
                </div>

                <input
                  type="text"
                  value={optionName1}
                  onChange={(e) => setOptionName1(e.target.value)}
                  placeholder={isZh ? "尺碼 / 口味 / 容量" : "Size / Flavor / Volume"}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                />

                {/* Add value for option 1 */}
                <div>
                  <label className="block text-xs text-zinc-500 mb-1.5">
                    {isZh ? "加選項值：" : "Add option value:"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newVal1Name}
                      onChange={(e) => setNewVal1Name(e.target.value)}
                      placeholder={isZh ? "例如 S" : "e.g. S"}
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue1())}
                    />
                    {variantMode === "single" && (
                      <input
                        type="number"
                        value={newVal1Qty}
                        onChange={(e) => setNewVal1Qty(e.target.value)}
                        placeholder={isZh ? "庫存" : "Stock"}
                        min="0"
                        className="w-20 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue1())}
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleAddValue1}
                      className="px-3 py-2 rounded-xl bg-[#FF9500] text-white hover:bg-[#E68600] transition-colors text-sm font-medium flex-shrink-0"
                    >
                      {isZh ? "加入" : "Add"}
                    </button>
                  </div>
                </div>

                {/* Values1 list */}
                {values1.length > 0 && (
                  <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
                    {values1.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-white">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-zinc-900">{v.name}</span>
                          {variantMode === "single" && (
                            <span className="text-xs text-zinc-500">
                              {isZh ? `庫存: ${v.qty}` : `Stock: ${v.qty}`}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveValue1(idx)}
                          className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Second option toggle / section */}
                {variantMode === "single" && values1.length > 0 && (
                  <button
                    type="button"
                    onClick={handleEnableDualOption}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 text-zinc-600 hover:border-[#FF9500] hover:text-[#FF9500] transition-colors text-sm font-medium w-full justify-center"
                  >
                    <Plus size={16} />
                    {isZh ? "加第二個選項" : "Add second option"}
                  </button>
                )}

                {variantMode === "dual" && (
                  <div className="space-y-4 pt-2 border-t border-zinc-200">
                    {/* Option 2 name */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-zinc-700">
                        {isZh ? "第二個選項名稱" : "Second option name"}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setVariantMode("single");
                          setOptionName2("");
                          setValues2([]);
                          setGrid({});
                        }}
                        className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        {isZh ? "移除" : "Remove"}
                      </button>
                    </div>

                    <input
                      type="text"
                      value={optionName2}
                      onChange={(e) => setOptionName2(e.target.value)}
                      placeholder={isZh ? "例如：顏色" : "e.g. Color"}
                      className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                    />

                    {/* Add value for option 2 */}
                    <div>
                      <label className="block text-xs text-zinc-500 mb-1.5">
                        {isZh ? "加選項值：" : "Add option value:"}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newVal2Name}
                          onChange={(e) => setNewVal2Name(e.target.value)}
                          placeholder={isZh ? "例如：黑色" : "e.g. Black"}
                          className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue2())}
                        />
                        <button
                          type="button"
                          onClick={handleAddValue2}
                          className="px-3 py-2 rounded-xl bg-[#FF9500] text-white hover:bg-[#E68600] transition-colors text-sm font-medium flex-shrink-0"
                        >
                          {isZh ? "加入" : "Add"}
                        </button>
                      </div>
                    </div>

                    {/* Values2 tags */}
                    {values2.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {values2.map((v, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-700 text-sm px-3 py-1.5 rounded-full"
                          >
                            {v}
                            <button
                              type="button"
                              onClick={() => handleRemoveValue2(idx)}
                              className="text-zinc-400 hover:text-red-500"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Combination stock grid */}
                    {values1.length > 0 && values2.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-xs font-medium text-zinc-600">
                          {isZh ? "每個組合庫存" : "Stock per combination"}
                        </label>
                        <div className="rounded-xl border border-zinc-200 overflow-hidden">
                          {/* Header row */}
                          <div className="flex bg-zinc-50 border-b border-zinc-200">
                            <div className="w-20 flex-shrink-0 px-3 py-2 text-xs font-medium text-zinc-500" />
                            {values1.map((v1) => (
                              <div key={v1.name} className="flex-1 min-w-[60px] px-2 py-2 text-xs font-medium text-zinc-600 text-center">
                                {v1.name}
                              </div>
                            ))}
                          </div>
                          {/* Data rows */}
                          {values2.map((v2) => (
                            <div key={v2} className="flex border-b border-zinc-100 last:border-b-0">
                              <div className="w-20 flex-shrink-0 px-3 py-2 text-xs font-medium text-zinc-700 bg-zinc-50 flex items-center">
                                {v2}
                              </div>
                              {values1.map((v1) => {
                                const key = `${v1.name}|${v2}`;
                                return (
                                  <div key={key} className="flex-1 min-w-[60px] px-1.5 py-1.5">
                                    <input
                                      type="number"
                                      min="0"
                                      value={grid[key] ?? 0}
                                      onChange={(e) => handleGridChange(key, e.target.value)}
                                      className="w-full px-2 py-1.5 rounded-lg border border-zinc-200 text-center text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#FF9500]/30 focus:border-[#FF9500]"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-zinc-400">
                          {isZh ? "填 0 = 冇貨" : "0 = out of stock"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Featured toggle */}
          <div className="border-t border-zinc-100 pt-4">
            <p className="text-sm font-medium text-zinc-700 mb-3">
              {isZh ? "其他設定" : "Other Settings"}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-zinc-900 font-medium">
                  {isZh ? "⭐ 精選推介" : "⭐ Featured"}
                </span>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isZh ? "開啟後商品會出現喺商店頂部精選區" : "Product will appear in the featured section at the top of your store"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={featured}
                onClick={() => setFeatured((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  featured ? "bg-[#FF9500]" : "bg-zinc-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform ${
                    featured ? "translate-x-5" : "translate-x-0"
                  }`}
                />
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
