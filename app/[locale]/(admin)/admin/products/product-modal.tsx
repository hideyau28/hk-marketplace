"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import type { Product } from "@prisma/client";
import type { Locale } from "@/lib/i18n";
import { createProduct, updateProduct } from "./actions";
import ImageUpload from "@/components/admin/ImageUpload";
import { GripVertical, X, Plus, Trash2 } from "lucide-react";

// Shoe size systems with default sizes
const SIZE_SYSTEMS: Record<string, { label: string; sizes: string[] }> = {
  mens_us: { label: "Men's US", sizes: ["US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11", "US 11.5", "US 12", "US 13", "US 14"] },
  womens_us: { label: "Women's US", sizes: ["US 5", "US 5.5", "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 10.5", "US 11"] },
  gs_youth: { label: "GS Youth", sizes: ["3.5Y", "4Y", "4.5Y", "5Y", "5.5Y", "6Y", "6.5Y", "7Y"] },
  ps_kids: { label: "PS Kids", sizes: ["10.5C", "11C", "11.5C", "12C", "12.5C", "13C", "13.5C", "1Y", "1.5Y", "2Y", "2.5Y", "3Y"] },
  td_toddler: { label: "TD Toddler", sizes: ["2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C"] },
  eu: { label: "EU", sizes: ["EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46", "EU 47"] },
};

// Category options (dropdown)
const CATEGORIES = [
  "Air Jordan",
  "Dunk/SB",
  "Air Max",
  "Air Force",
  "Running",
  "Basketball",
  "Lifestyle",
  "Training",
  "Sandals",
];

// Shoe type options (dropdown)
const SHOE_TYPES = [
  { value: "adult", label: "男裝" },
  { value: "womens", label: "女裝" },
  { value: "grade_school", label: "GS 大童" },
  { value: "preschool", label: "PS 小童" },
  { value: "toddler", label: "TD 幼童" },
];

// Promotion badges options (checkbox pills)
const PROMOTION_BADGES = [
  { value: "店長推介", label: "店長推介" },
  { value: "今期熱賣", label: "今期熱賣" },
  { value: "新品上架", label: "新品上架" },
  { value: "限時優惠", label: "限時優惠" },
  { value: "人氣之選", label: "人氣之選" },
];

type BadgeOption = {
  id: string;
  nameZh: string;
  nameEn: string;
  color: string;
};

function isCuid(value: string) {
  return value.startsWith("c") && value.length >= 25;
}

function extractBadgeIds(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.filter((item): item is string => typeof item === "string" && isCuid(item));
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item && isCuid(item));
  }
  return [];
}

// Auto-detect size system from existing keys
function detectSizeSystem(sizeInventory: Record<string, number>): string {
  const keys = Object.keys(sizeInventory);
  if (keys.length === 0) return "";

  // Check for EU sizes
  if (keys.some(k => k.startsWith("EU "))) return "eu";
  // Check for toddler sizes (C suffix without Y)
  if (keys.some(k => /^\d+C$/.test(k) || /^US \d+C$/.test(k))) return "td_toddler";
  // Check for PS kids sizes (Y suffix with small numbers or C suffix)
  if (keys.some(k => /^(1|2|3)(\.5)?Y$/.test(k))) return "ps_kids";
  // Check for GS youth sizes (Y suffix with larger numbers)
  if (keys.some(k => /^(3\.5|[4-7])(\.5)?Y$/.test(k))) return "gs_youth";
  // Check for women's US sizes (smaller US numbers)
  if (keys.some(k => k.match(/^US (5|5\.5|6|6\.5)$/))) return "womens_us";
  // Default to men's US
  if (keys.some(k => k.startsWith("US "))) return "mens_us";

  return "";
}

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  locale: Locale;
};

export function ProductModal({ product, onClose, locale }: ProductModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Parse existing sizeInventory
  const existingSizeInventory = (() => {
    const sizes = (product as any)?.sizes;
    if (sizes && typeof sizes === "object" && !Array.isArray(sizes)) {
      return sizes as Record<string, number>;
    }
    return {};
  })();

  // Auto-detect size system from existing inventory
  const detectedSizeSystem = detectSizeSystem(existingSizeInventory);

  const [brand, setBrand] = useState(product?.brand || "Nike");
  const [title, setTitle] = useState(product?.title || "");
  const [sku, setSku] = useState((product as any)?.sku || "");
  const [price, setPrice] = useState(product?.price.toString() || "");
  const [originalPrice, setOriginalPrice] = useState(
    product?.originalPrice?.toString() || ""
  );
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  // Multi-image support
  const [images, setImages] = useState<string[]>(
    (product as any)?.images && Array.isArray((product as any).images)
      ? ((product as any).images as string[])
      : []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [category, setCategory] = useState(product?.category || "");
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState((product as any)?.featured ?? false);
  // shoeType
  const [shoeType, setShoeType] = useState((product as any)?.shoeType || "");
  // Size system - auto-detect from existing inventory
  const [sizeSystem, setSizeSystem] = useState(detectedSizeSystem);

  // Size inventory: { "US 7": 5, "US 8": 10, ... }
  const [sizeInventory, setSizeInventory] = useState<Record<string, number>>(existingSizeInventory);

  // Custom sizes added by user (sizes in inventory that aren't in the current system)
  const [customSizes, setCustomSizes] = useState<string[]>(() => {
    if (!detectedSizeSystem) return [];
    const systemSizes = SIZE_SYSTEMS[detectedSizeSystem]?.sizes || [];
    const existingKeys = Object.keys(existingSizeInventory);
    return existingKeys.filter(k => !systemSizes.includes(k));
  });
  const [newCustomSize, setNewCustomSize] = useState("");

  // Promotion badges as checkboxes
  const [promotionBadges, setPromotionBadges] = useState<string[]>(
    (product as any)?.promotionBadges && Array.isArray((product as any).promotionBadges)
      ? ((product as any).promotionBadges as string[])
      : []
  );
  // Pre-order fields
  const [preorderEnabled, setPreorderEnabled] = useState(
    !!(product as any)?.preorderDate
  );
  const [preorderDate, setPreorderDate] = useState(() => {
    const d = (product as any)?.preorderDate;
    if (!d) return "";
    return new Date(d).toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [preorderNote, setPreorderNote] = useState(
    (product as any)?.preorderNote || ""
  );
  const [badgeOptions, setBadgeOptions] = useState<BadgeOption[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(false);
  const [badgeError, setBadgeError] = useState<string | null>(null);
  const [selectedBadgeIds, setSelectedBadgeIds] = useState<string[]>(
    extractBadgeIds((product as any)?.badges)
  );
  const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
  // Drag state for image reordering
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Calculate total stock from size inventory
  const totalStock = Object.values(sizeInventory).reduce((sum, qty) => sum + qty, 0);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPending) {
      onClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isPending, onClose]);

  useEffect(() => {
    setSelectedBadgeIds(extractBadgeIds((product as any)?.badges));
  }, [product?.id]);

  useEffect(() => {
    let isActive = true;
    const loadBadges = async () => {
      setBadgeLoading(true);
      setBadgeError(null);
      try {
        const res = await fetch("/api/admin/badges");
        const json = await res.json();
        if (!res.ok || !json.ok) {
          if (isActive) setBadgeError(json?.error?.message || "Failed to load badges.");
          return;
        }
        if (isActive) setBadgeOptions(json.badges || []);
      } catch (error) {
        console.error("Failed to load badges:", error);
        if (isActive) setBadgeError("Failed to load badges.");
      } finally {
        if (isActive) setBadgeLoading(false);
      }
    };
    loadBadges();
    return () => {
      isActive = false;
    };
  }, []);

  // Image management
  const handleAddImage = () => {
    if (newImageUrl.trim() && images.length < 10) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Swap an extra image to become the main image
  const handleSetAsMainImage = (index: number) => {
    const newMainImage = images[index];
    const oldMainImage = imageUrl;

    // Set the selected image as main
    setImageUrl(newMainImage);

    // Remove the selected image from extras and add old main if it exists
    const newImages = images.filter((_, i) => i !== index);
    if (oldMainImage) {
      newImages.unshift(oldMainImage); // Add old main to beginning of extras
    }
    setImages(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Toggle promotion badge
  const togglePromotionBadge = (badge: string) => {
    if (promotionBadges.includes(badge)) {
      setPromotionBadges(promotionBadges.filter((b) => b !== badge));
    } else {
      setPromotionBadges([...promotionBadges, badge]);
    }
  };

  const toggleProductBadge = (badgeId: string) => {
    setSelectedBadgeIds((prev) =>
      prev.includes(badgeId) ? prev.filter((id) => id !== badgeId) : [...prev, badgeId]
    );
  };

  // Size inventory handlers
  const handleSizeCheck = (size: string, checked: boolean) => {
    if (checked) {
      setSizeInventory((prev) => ({ ...prev, [size]: prev[size] || 0 }));
    } else {
      setSizeInventory((prev) => {
        const next = { ...prev };
        delete next[size];
        return next;
      });
    }
  };

  const handleSizeStockChange = (size: string, stock: number) => {
    setSizeInventory((prev) => ({ ...prev, [size]: Math.max(0, stock) }));
  };

  const handleAddCustomSize = () => {
    if (newCustomSize.trim() && !customSizes.includes(newCustomSize.trim())) {
      setCustomSizes([...customSizes, newCustomSize.trim()]);
      setNewCustomSize("");
    }
  };

  const handleRemoveCustomSize = (size: string) => {
    setCustomSizes(customSizes.filter((s) => s !== size));
    setSizeInventory((prev) => {
      const next = { ...prev };
      delete next[size];
      return next;
    });
  };

  // When size system changes, preserve existing inventory if switching to a compatible system
  const handleSizeSystemChange = (newSystem: string) => {
    setSizeSystem(newSystem);
    if (!newSystem) {
      // Don't clear inventory, just change display
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError({ code: "VALIDATION_ERROR", message: "Price must be a non-negative number" });
      return;
    }

    // Parse originalPrice (optional)
    let originalPriceNum: number | null = null;
    if (originalPrice.trim()) {
      originalPriceNum = parseFloat(originalPrice);
      if (isNaN(originalPriceNum) || originalPriceNum < 0) {
        setError({ code: "VALIDATION_ERROR", message: "Original price must be a non-negative number" });
        return;
      }
    }

    if (!brand.trim()) {
      setError({ code: "VALIDATION_ERROR", message: "Brand is required" });
      return;
    }

    if (!title.trim()) {
      setError({ code: "VALIDATION_ERROR", message: "Title is required" });
      return;
    }

    if (!category) {
      setError({ code: "VALIDATION_ERROR", message: "Category is required" });
      return;
    }

    if (!shoeType) {
      setError({ code: "VALIDATION_ERROR", message: "Shoe Type is required" });
      return;
    }

    // Filter size inventory to only include sizes with stock > 0
    const filteredSizeInventory: Record<string, number> = {};
    Object.entries(sizeInventory).forEach(([size, stock]) => {
      if (stock > 0) {
        filteredSizeInventory[size] = stock;
      }
    });

    startTransition(async () => {
      let result;
      const productData = {
        brand: brand.trim(),
        title: title.trim(),
        sku: sku.trim() || undefined,
        price: priceNum,
        originalPrice: originalPriceNum,
        imageUrl: imageUrl.trim() || null,
        images: images.length > 0 ? images : undefined,
        category: category || null,
        badges: selectedBadgeIds,
        active,
        featured,
        shoeType: shoeType || null,
        sizeSystem: sizeSystem || null,
        sizes: Object.keys(filteredSizeInventory).length > 0 ? filteredSizeInventory : null,
        stock: totalStock,
        promotionBadges: promotionBadges.length > 0 ? promotionBadges : undefined,
        preorderDate: preorderEnabled && preorderDate
          ? new Date(preorderDate).toISOString()
          : null,
        preorderNote: preorderEnabled && preorderNote.trim()
          ? preorderNote.trim()
          : null,
      };

      if (product) {
        result = await updateProduct(product.id, productData, locale);
      } else {
        result = await createProduct(productData as any, locale);
      }

      if (result.ok) {
        onClose();
        window.location.reload();
      } else {
        setError({ code: result.code, message: result.message });
      }
    });
  };

  // Calculate discount percentage
  const priceNum = parseFloat(price) || 0;
  const originalPriceNum = parseFloat(originalPrice) || 0;
  const isOnSale = originalPriceNum > priceNum && priceNum > 0;
  const discountPercent = isOnSale ? Math.round((1 - priceNum / originalPriceNum) * 100) : 0;

  // Get all available sizes (system sizes + custom sizes)
  const systemSizes = sizeSystem ? SIZE_SYSTEMS[sizeSystem]?.sizes || [] : [];
  const allAvailableSizes = [...systemSizes, ...customSizes];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-zinc-200 bg-white"
      >
        {/* Sticky header with X button */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-3xl border-b border-zinc-100 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-900">
            {product ? "Edit Product" : "Create Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="text-red-600 font-semibold text-sm">{error.code}</div>
              <div className="mt-1 text-red-600 text-sm">{error.message}</div>
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit}>
            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN - Images */}
              <div className="space-y-4">
                {/* Main Product Image */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-3">主圖 (Main Image)</label>
                  <ImageUpload
                    currentUrl={imageUrl}
                    onUpload={(url) => setImageUrl(url)}
                    disabled={isPending}
                  />
                  {imageUrl && (
                    <div className="mt-3 relative">
                      <img src={imageUrl} alt="Main" className="w-full h-48 object-contain rounded-xl border border-zinc-200 bg-zinc-50" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute top-2 right-2 p-1 rounded-full bg-white/90 text-zinc-500 hover:text-red-500 hover:bg-white shadow-sm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={isPending}
                    className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                    placeholder="Or paste image URL here"
                  />
                </div>

                {/* Additional Images (max 10) */}
                <div className="rounded-2xl border border-zinc-200 p-4">
                  <label className="block text-zinc-700 text-sm font-medium mb-3">
                    額外圖片 <span className="text-zinc-400 font-normal">({images.length}/10)</span>
                  </label>

                  {/* Image thumbnails grid */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {images.map((img, index) => (
                        <div
                          key={index}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          className={`group relative aspect-square rounded-xl overflow-hidden border cursor-move transition-all ${
                            draggedIndex === index ? "border-olive-500 ring-2 ring-olive-200" : "border-zinc-200"
                          }`}
                        >
                          <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          {/* Set as main image button - shows on hover */}
                          <button
                            type="button"
                            onClick={() => handleSetAsMainImage(index)}
                            disabled={isPending}
                            className="absolute inset-x-1 bottom-6 py-1 px-1 text-[10px] font-medium text-white bg-[#6B7A2F]/90 hover:bg-[#6B7A2F] rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            ⭐ 設為主圖
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            disabled={isPending}
                            className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-zinc-500 hover:text-red-500 hover:bg-white shadow-sm disabled:opacity-50"
                          >
                            <X size={12} />
                          </button>
                          <div className="absolute bottom-1 left-1 p-0.5 rounded bg-white/80">
                            <GripVertical size={10} className="text-zinc-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new image */}
                  {images.length < 10 && (
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        disabled={isPending}
                        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                        placeholder="Paste additional image URL"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        disabled={isPending || !newImageUrl.trim()}
                        className="rounded-xl bg-zinc-100 px-3 py-2 text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Form Fields */}
              <div className="space-y-4">
                {/* Brand */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">Brand *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                    placeholder="Nike"
                    required
                  />
                </div>

                {/* Model / Description */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">Model / Description *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                    placeholder="Air Jordan 1 Retro High OG"
                    required
                  />
                </div>

                {/* SKU / Model Number */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">SKU / Model Number</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    disabled={isPending}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                    placeholder="553558-067"
                  />
                </div>

                {/* Price section */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-700 text-sm font-medium mb-2">售價 HKD *</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        disabled={isPending}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                        placeholder="899"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-700 text-sm font-medium mb-2">原價 HKD</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        disabled={isPending}
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                        placeholder="1299"
                      />
                    </div>
                  </div>

                  {/* Discount preview */}
                  {isOnSale ? (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 line-through text-sm">${Math.round(originalPriceNum)}</span>
                        <span className="text-lg font-bold text-red-600">${Math.round(priceNum)}</span>
                        <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">-{discountPercent}%</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-zinc-400 text-xs">設定原價高於售價，會顯示為減價產品</p>
                  )}
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isPending}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                  >
                    <option value="">-- 選擇類別 --</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Shoe Type Dropdown */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">鞋類 / Shoe Type *</label>
                  <select
                    value={shoeType}
                    onChange={(e) => setShoeType(e.target.value)}
                    disabled={isPending}
                    required
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                  >
                    <option value="">-- 選擇鞋類 --</option>
                    {SHOE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Product Badges */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">產品標籤</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBadgeDropdownOpen((prev) => !prev)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left text-sm text-zinc-900 flex items-center justify-between"
                    >
                      <span>
                        {selectedBadgeIds.length > 0
                          ? `${selectedBadgeIds.length} badges selected`
                          : "Select badges"}
                      </span>
                      <span className="text-xs text-zinc-400">▼</span>
                    </button>

                    {isBadgeDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                        {badgeLoading ? (
                          <div className="px-3 py-3 text-sm text-zinc-500">Loading badges...</div>
                        ) : badgeOptions.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-zinc-500">No badges available</div>
                        ) : (
                          badgeOptions.map((badge) => {
                            const isSelected = selectedBadgeIds.includes(badge.id);
                            return (
                              <button
                                key={badge.id}
                                type="button"
                                onClick={() => toggleProductBadge(badge.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 ${
                                  isSelected ? "bg-olive-50" : ""
                                }`}
                              >
                                <span
                                  className="h-3 w-3 rounded-full"
                                  style={{ backgroundColor: badge.color }}
                                />
                                <span className="text-zinc-800">
                                  {badge.nameZh} / {badge.nameEn}
                                </span>
                                {isSelected && <span className="ml-auto text-olive-600">✓</span>}
                              </button>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  {badgeError && (
                    <p className="mt-2 text-xs text-red-600">{badgeError}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedBadgeIds.map((id) => {
                      const badge = badgeOptions.find((option) => option.id === id);
                      const label = badge ? `${badge.nameZh} / ${badge.nameEn}` : id;
                      const color = badge?.color || "#6B7A2F";
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleProductBadge(id)}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-white"
                          style={{ backgroundColor: color }}
                        >
                          <span>{label}</span>
                          <span className="text-white/80">✕</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Promotion Badges */}
                <div>
                  <label className="block text-zinc-700 text-sm font-medium mb-2">推廣標籤</label>
                  <div className="flex flex-wrap gap-2">
                    {PROMOTION_BADGES.map((badge) => {
                      const isSelected = promotionBadges.includes(badge.value);
                      return (
                        <button
                          key={badge.value}
                          type="button"
                          onClick={() => togglePromotionBadge(badge.value)}
                          disabled={isPending}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors border disabled:opacity-50 ${
                            isSelected
                              ? "bg-[#6B7A2F] text-white border-[#6B7A2F]"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {badge.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1.5">「快將售罄」會在庫存 ≤ 5 時自動顯示</p>
                </div>

                {/* Active & Featured toggles */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="active"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      disabled={isPending}
                      className="h-4 w-4 accent-[#6B7A2F] disabled:opacity-50"
                    />
                    <label htmlFor="active" className="text-zinc-700 text-sm">Active</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      disabled={isPending}
                      className="h-4 w-4 accent-yellow-500 disabled:opacity-50"
                    />
                    <label htmlFor="featured" className="text-zinc-700 text-sm">⭐ Featured</label>
                  </div>
                </div>

                {/* Pre-order settings */}
                <div className="rounded-xl border border-zinc-200 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="preorder-enabled"
                      checked={preorderEnabled}
                      onChange={(e) => setPreorderEnabled(e.target.checked)}
                      disabled={isPending}
                      className="h-4 w-4 accent-[#FF9500] disabled:opacity-50"
                    />
                    <label htmlFor="preorder-enabled" className="text-zinc-700 text-sm font-medium">
                      📦 啟用預購模式
                    </label>
                  </div>

                  {preorderEnabled && (
                    <div className="space-y-3 pl-6">
                      <div>
                        <label className="block text-zinc-700 text-sm font-medium mb-2">預計到貨日期</label>
                        <input
                          type="date"
                          value={preorderDate}
                          onChange={(e) => setPreorderDate(e.target.value)}
                          disabled={isPending}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-700 text-sm font-medium mb-2">預購備註</label>
                        <input
                          type="text"
                          value={preorderNote}
                          onChange={(e) => setPreorderNote(e.target.value)}
                          disabled={isPending}
                          placeholder="韓國直送，約 7-14 工作天"
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FULL WIDTH - Size System Table */}
            <div className="mt-6 rounded-2xl border border-zinc-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-700 text-sm font-medium">尺碼系統</label>
                <div className="flex items-center gap-3">
                  <select
                    value={sizeSystem}
                    onChange={(e) => handleSizeSystemChange(e.target.value)}
                    disabled={isPending}
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-300 disabled:opacity-50"
                  >
                    <option value="">No sizes</option>
                    {Object.entries(SIZE_SYSTEMS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                  <div className="text-sm text-zinc-600">
                    總庫存: <span className="font-semibold text-zinc-900">{totalStock}</span>
                  </div>
                </div>
              </div>

              {sizeSystem && (
                <>
                  {/* Size inventory table */}
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto border border-zinc-100 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-zinc-50">
                        <tr className="text-zinc-500 border-b border-zinc-200">
                          <th className="py-2 px-3 text-center font-medium w-12">✓</th>
                          <th className="py-2 px-3 text-left font-medium">Size</th>
                          <th className="py-2 px-3 text-right font-medium w-24">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allAvailableSizes.map((size) => {
                          const isChecked = size in sizeInventory;
                          const stock = sizeInventory[size] || 0;
                          const isCustom = customSizes.includes(size);
                          return (
                            <tr key={size} className="border-b border-zinc-100 hover:bg-zinc-50">
                              <td className="py-2 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleSizeCheck(size, e.target.checked)}
                                  disabled={isPending}
                                  className="h-4 w-4 accent-[#6B7A2F] disabled:opacity-50"
                                />
                              </td>
                              <td className="py-2 px-3 text-zinc-900">
                                <div className="flex items-center gap-2">
                                  {size}
                                  {isCustom && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveCustomSize(size)}
                                      className="text-zinc-400 hover:text-red-500"
                                    >
                                      <X size={12} />
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <input
                                  type="number"
                                  min="0"
                                  value={isChecked ? stock : ""}
                                  onChange={(e) => handleSizeStockChange(size, parseInt(e.target.value) || 0)}
                                  disabled={isPending || !isChecked}
                                  className="w-20 rounded-lg border border-zinc-200 px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-[#6B7A2F] disabled:opacity-50 disabled:bg-zinc-50"
                                  placeholder="0"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add custom size */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newCustomSize}
                      onChange={(e) => setNewCustomSize(e.target.value)}
                      disabled={isPending}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#6B7A2F] disabled:opacity-50"
                      placeholder="自訂尺碼 (e.g. US 14)"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomSize();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      disabled={isPending || !newCustomSize.trim()}
                      className="rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
                    >
                      ＋ 自訂尺碼
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Sticky footer with buttons */}
        <div className="sticky bottom-0 rounded-b-3xl border-t border-zinc-100 bg-white px-6 py-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm text-zinc-700 hover:bg-zinc-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={isPending}
              className="flex-1 rounded-xl bg-[#6B7A2F] px-4 py-3 text-sm text-white font-semibold hover:bg-[#5a6827] disabled:opacity-50"
            >
              {isPending ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
