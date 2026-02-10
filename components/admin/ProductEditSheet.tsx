"use client";

import { useState, useEffect, useRef } from "react";
import { X, Camera, Loader2, Trash2, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";
import { VARIANT_PRESETS, EXTENDED_PRESETS, type VariantPreset } from "@/lib/variant-presets";

type Product = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  images: string[];
  videoUrl?: string | null;
  sizes: Record<string, unknown> | null;
  sizeSystem: string | null;
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

// localStorage key for variant memory
const VARIANT_MEMORY_KEY = "wowlix-variant-last";

type VariantMemory = {
  presetId: string;
  selectedValues: string[];
  label: string;
};

function getVariantMemory(): VariantMemory | null {
  try {
    const raw = localStorage.getItem(VARIANT_MEMORY_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveVariantMemory(presetId: string, selectedValues: string[], label: string) {
  try {
    localStorage.setItem(VARIANT_MEMORY_KEY, JSON.stringify({ presetId, selectedValues, label }));
  } catch {
    // ignore
  }
}

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

// Find preset by matching values
function findPresetForValues(values: string[]): VariantPreset | null {
  const all = [...VARIANT_PRESETS, ...EXTENDED_PRESETS];
  for (const preset of all) {
    if (preset.values.length === 0) continue;
    const overlap = values.filter((v) => preset.values.includes(v));
    if (overlap.length >= Math.min(2, values.length)) return preset;
  }
  return null;
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
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // --- Variant state ---
  const [variantMode, setVariantMode] = useState<"none" | "single" | "dual">("none");
  const [optionName1, setOptionName1] = useState("");
  const [values1, setValues1] = useState<SingleVariantValue[]>([]);
  const [optionName2, setOptionName2] = useState("");
  const [values2, setValues2] = useState<string[]>([]);
  const [grid, setGrid] = useState<Record<string, number>>({});

  // Preset picker state
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [showPresetPicker2, setShowPresetPicker2] = useState(false);
  const [presetSearch, setPresetSearch] = useState("");
  const [activePreset1, setActivePreset1] = useState<VariantPreset | null>(null);
  const [activePreset2, setActivePreset2] = useState<VariantPreset | null>(null);
  const [newCustomValue, setNewCustomValue] = useState("");
  const [newCustomValue2, setNewCustomValue2] = useState("");
  const [bulkQty, setBulkQty] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [variantMemory, setVariantMemory] = useState<VariantMemory | null>(null);
  const [memoryDismissed, setMemoryDismissed] = useState(false);

  const isZh = locale === "zh-HK";

  useEffect(() => {
    if (isOpen) {
      if (product && !isNew) {
        setTitle(product.title);
        setPrice(String(product.price));
        setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
        setImages(product.images?.length ? product.images : product.imageUrl ? [product.imageUrl] : []);
        setVideoUrl(product.videoUrl || "");

        // Load existing variant data
        const parsed = parseExistingSizes(product.sizes, product.sizeSystem);
        setVariantMode(parsed.mode);
        setOptionName1(parsed.optionName1);
        setValues1(parsed.values1);
        setOptionName2(parsed.optionName2);
        setValues2(parsed.values2);
        setGrid(parsed.grid);

        // Try to find matching preset for existing values
        if (parsed.mode !== "none" && parsed.values1.length > 0) {
          const matched = findPresetForValues(parsed.values1.map((v) => v.name));
          setActivePreset1(matched);
        }
        if (parsed.mode === "dual" && parsed.values2.length > 0) {
          const matched = findPresetForValues(parsed.values2);
          setActivePreset2(matched);
        }
      } else {
        setTitle("");
        setPrice("");
        setOriginalPrice("");
        setImages([]);
        setVideoUrl("");
        setVariantMode("none");
        setOptionName1("");
        setValues1([]);
        setOptionName2("");
        setValues2([]);
        setGrid({});
        setActivePreset1(null);
        setActivePreset2(null);
      }
      setError("");
      setConfirmDelete(false);
      setShowPresetPicker(false);
      setShowPresetPicker2(false);
      setPresetSearch("");
      setNewCustomValue("");
      setNewCustomValue2("");
      setBulkQty("");
      setCollapsedGroups(new Set());
      setMemoryDismissed(false);

      // Load variant memory for new products
      if (isNew) {
        setVariantMemory(getVariantMemory());
      } else {
        setVariantMemory(null);
      }
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

  // --- Preset selection ---
  const handleSelectPreset = (preset: VariantPreset, isSecond: boolean) => {
    if (isSecond) {
      setActivePreset2(preset);
      setOptionName2(preset.label);
      // Pre-select all values if preset has values
      if (preset.values.length > 0) {
        const newVals = preset.values;
        setValues2(newVals);
        // Initialize grid
        const newGrid: Record<string, number> = {};
        for (const v1 of values1) {
          for (const v2 of newVals) {
            newGrid[`${v1.name}|${v2}`] = 0;
          }
        }
        setGrid(newGrid);
      } else {
        setValues2([]);
      }
      setShowPresetPicker2(false);
    } else {
      setActivePreset1(preset);
      setVariantMode("single");
      setOptionName1(preset.label);
      // Pre-select all values if preset has values
      if (preset.values.length > 0) {
        setValues1(preset.values.map((v) => ({ name: v, qty: 0 })));
      } else {
        setValues1([]);
      }
      setShowPresetPicker(false);
    }
    setPresetSearch("");
  };

  const handleSelectCustom = (isSecond: boolean) => {
    if (isSecond) {
      setActivePreset2(null);
      setOptionName2("");
      setValues2([]);
      setShowPresetPicker2(false);
    } else {
      setActivePreset1(null);
      setVariantMode("single");
      setOptionName1("");
      setValues1([]);
      setShowPresetPicker(false);
    }
    setPresetSearch("");
  };

  // Toggle a value on/off (checkbox chips)
  const handleToggleValue1 = (valueName: string) => {
    const exists = values1.some((v) => v.name === valueName);
    if (exists) {
      const removed = values1.find((v) => v.name === valueName);
      setValues1((prev) => prev.filter((v) => v.name !== valueName));
      // Clean up grid if dual mode
      if (variantMode === "dual" && removed) {
        setGrid((prev) => {
          const next = { ...prev };
          for (const key of Object.keys(next)) {
            if (key.startsWith(`${removed.name}|`)) delete next[key];
          }
          return next;
        });
      }
    } else {
      setValues1((prev) => [...prev, { name: valueName, qty: 0 }]);
      // If dual mode, initialize grid entries
      if (variantMode === "dual") {
        setGrid((prev) => {
          const next = { ...prev };
          for (const v2 of values2) {
            next[`${valueName}|${v2}`] = 0;
          }
          return next;
        });
      }
    }
  };

  const handleToggleValue2 = (valueName: string) => {
    const exists = values2.includes(valueName);
    if (exists) {
      setValues2((prev) => prev.filter((v) => v !== valueName));
      // Clean up grid
      setGrid((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          if (key.endsWith(`|${valueName}`)) delete next[key];
        }
        return next;
      });
    } else {
      setValues2((prev) => [...prev, valueName]);
      // Initialize grid entries
      setGrid((prev) => {
        const next = { ...prev };
        for (const v1 of values1) {
          next[`${v1.name}|${valueName}`] = 0;
        }
        return next;
      });
    }
  };

  // Add custom value
  const handleAddCustomValue1 = () => {
    const name = newCustomValue.trim();
    if (!name || values1.some((v) => v.name === name)) return;
    setValues1((prev) => [...prev, { name, qty: 0 }]);
    setNewCustomValue("");
    if (variantMode === "dual") {
      setGrid((prev) => {
        const next = { ...prev };
        for (const v2 of values2) {
          next[`${name}|${v2}`] = 0;
        }
        return next;
      });
    }
  };

  const handleAddCustomValue2 = () => {
    const name = newCustomValue2.trim();
    if (!name || values2.includes(name)) return;
    setValues2((prev) => [...prev, name]);
    setNewCustomValue2("");
    setGrid((prev) => {
      const next = { ...prev };
      for (const v1 of values1) {
        next[`${v1.name}|${name}`] = 0;
      }
      return next;
    });
  };

  // Stock changes for single variant
  const handleStockChange = (valueName: string, qty: string) => {
    setValues1((prev) => prev.map((v) => v.name === valueName ? { ...v, qty: parseInt(qty) || 0 } : v));
  };

  const handleGridChange = (key: string, value: string) => {
    setGrid((prev) => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  // Bulk set all stock
  const handleBulkSetAll = () => {
    const qty = parseInt(bulkQty) || 0;
    if (variantMode === "single") {
      setValues1((prev) => prev.map((v) => ({ ...v, qty })));
    } else if (variantMode === "dual") {
      setGrid((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = qty;
        }
        return next;
      });
    }
    setBulkQty("");
  };

  // Enable dual mode
  const handleEnableDualOption = () => {
    setVariantMode("dual");
    setShowPresetPicker2(true);
  };

  // Remove all options
  const handleRemoveOptions = () => {
    setVariantMode("none");
    setOptionName1("");
    setValues1([]);
    setOptionName2("");
    setValues2([]);
    setGrid({});
    setActivePreset1(null);
    setActivePreset2(null);
    setShowPresetPicker(false);
    setShowPresetPicker2(false);
  };

  // Remove second option
  const handleRemoveOption2 = () => {
    setVariantMode("single");
    setOptionName2("");
    setValues2([]);
    setGrid({});
    setActivePreset2(null);
    setShowPresetPicker2(false);
  };

  // Collapsible groups toggle
  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // Apply variant memory
  const handleApplyMemory = () => {
    if (!variantMemory) return;
    const allPresets = [...VARIANT_PRESETS, ...EXTENDED_PRESETS];
    const preset = allPresets.find((p) => p.id === variantMemory.presetId);
    setVariantMode("single");
    setOptionName1(variantMemory.label);
    setActivePreset1(preset || null);
    setValues1(variantMemory.selectedValues.map((v) => ({ name: v, qty: 0 })));
    setMemoryDismissed(true);
  };

  // --- Build sizes data for API ---
  const buildSizesPayload = (): { sizes: Record<string, unknown> | null; sizeSystem: string | null } => {
    if (variantMode === "none" || values1.length === 0) {
      return { sizes: null, sizeSystem: null };
    }

    if (variantMode === "single") {
      const sizes: Record<string, { qty: number; status: string }> = {};
      for (const v of values1) {
        sizes[v.name] = { qty: v.qty, status: "available" };
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

      // Save variant memory
      if (variantMode !== "none" && values1.length > 0) {
        saveVariantMemory(
          activePreset1?.id || "custom",
          values1.map((v) => v.name),
          optionName1.trim() || "custom"
        );
      }

      const body: Record<string, unknown> = {
        title: title.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        imageUrl: images[0] || null,
        images,
        videoUrl: videoUrl || null,
        active: true,
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

  // --- Preset picker rendering ---
  const allPresets = [...VARIANT_PRESETS, ...EXTENDED_PRESETS];
  const filteredPresets = presetSearch
    ? allPresets.filter((p) => p.label.includes(presetSearch) || p.id.includes(presetSearch.toLowerCase()))
    : VARIANT_PRESETS;

  const getColorHex = (valueName: string): string | undefined => {
    const preset = activePreset1?.colorHex?.[valueName] || activePreset2?.colorHex?.[valueName];
    if (preset) return preset;
    // Check all color presets
    const colorPreset = [...VARIANT_PRESETS, ...EXTENDED_PRESETS].find((p) => p.colorHex?.[valueName]);
    return colorPreset?.colorHex?.[valueName];
  };

  const renderPresetPicker = (isSecond: boolean) => {
    const showSearch = presetSearch.length > 0;
    const presets = showSearch ? filteredPresets : VARIANT_PRESETS;

    return (
      <div className="space-y-3 bg-zinc-50 rounded-xl p-4">
        <div className="text-sm font-medium text-zinc-700">
          {isZh ? "選擇選項類型" : "Select option type"}
        </div>

        {/* Preset list */}
        <div className="space-y-1">
          {(showSearch ? presets : VARIANT_PRESETS).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset, isSecond)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white transition-colors text-left"
            >
              <span className="text-lg">{preset.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-zinc-800">{preset.label}</span>
                {preset.values.length > 0 && (
                  <span className="text-xs text-zinc-400 ml-2">
                    ({preset.values.slice(0, 4).join("/")}{preset.values.length > 4 ? "..." : ""})
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Search more */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={presetSearch}
              onChange={(e) => setPresetSearch(e.target.value)}
              placeholder={isZh ? "搜尋更多..." : "Search more..."}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Custom option */}
        <button
          type="button"
          onClick={() => handleSelectCustom(isSecond)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-zinc-300 hover:border-[#FF9500] hover:bg-white transition-colors text-sm text-zinc-600"
        >
          <span>✏️</span>
          <span>{isZh ? "自訂" : "Custom"}</span>
        </button>

        {/* Cancel */}
        <button
          type="button"
          onClick={() => {
            if (isSecond) {
              setShowPresetPicker2(false);
            } else {
              setShowPresetPicker(false);
            }
            setPresetSearch("");
          }}
          className="w-full text-center text-xs text-zinc-400 hover:text-zinc-600 py-1"
        >
          {isZh ? "取消" : "Cancel"}
        </button>
      </div>
    );
  };

  // Render checkbox chips for option values
  const renderValueChips = (
    presetValues: string[],
    selectedValues: string[],
    onToggle: (name: string) => void,
    colorHexMap?: Record<string, string>
  ) => (
    <div className="flex flex-wrap gap-2">
      {presetValues.map((val) => {
        const isSelected = selectedValues.includes(val);
        const hex = colorHexMap?.[val] || getColorHex(val);
        return (
          <button
            key={val}
            type="button"
            onClick={() => onToggle(val)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors border ${
              isSelected
                ? "bg-[#FF9500]/10 border-[#FF9500] text-[#FF9500] font-medium"
                : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            {hex && (
              <span
                className="w-4 h-4 rounded-full border border-zinc-200 flex-shrink-0"
                style={{ backgroundColor: hex }}
              />
            )}
            {val}
          </button>
        );
      })}
    </div>
  );

  // Render single variant stock list
  const renderSingleStockList = () => {
    const selectedValues = values1;
    if (selectedValues.length === 0) return null;

    return (
      <div className="space-y-3">
        <label className="block text-xs font-medium text-zinc-600">
          {isZh ? "庫存" : "Stock"}
        </label>
        <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden">
          {selectedValues.map((v) => {
            const hex = getColorHex(v.name);
            return (
              <div key={v.name} className="flex items-center justify-between px-4 py-2.5 bg-white">
                <div className="flex items-center gap-2">
                  {hex && (
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-200 flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="text-sm font-medium text-zinc-900">{v.name}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={v.qty}
                  onChange={(e) => handleStockChange(v.name, e.target.value)}
                  className="w-20 px-2 py-1.5 rounded-lg border border-zinc-200 text-center text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#FF9500]/30 focus:border-[#FF9500]"
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render dual variant collapsible stock groups
  const renderDualStockGroups = () => {
    if (values1.length === 0 || values2.length === 0) return null;

    return (
      <div className="space-y-3">
        <label className="block text-xs font-medium text-zinc-600">
          {isZh ? "每個組合庫存" : "Stock per combination"}
        </label>
        <div className="space-y-2">
          {values1.map((v1) => {
            const isCollapsed = collapsedGroups.has(v1.name);
            const totalQty = values2.reduce((sum, v2) => sum + (grid[`${v1.name}|${v2}`] || 0), 0);
            const hex = getColorHex(v1.name);

            return (
              <div key={v1.name} className="rounded-xl border border-zinc-200 overflow-hidden">
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroupCollapse(v1.name)}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
                >
                  {isCollapsed ? <ChevronRight size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                  {hex && (
                    <span
                      className="w-4 h-4 rounded-full border border-zinc-200 flex-shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="text-sm font-medium text-zinc-900">{v1.name}</span>
                  <span className="text-xs text-zinc-400 ml-auto">
                    ({isZh ? `共${totalQty}件` : `${totalQty} total`})
                  </span>
                </button>

                {/* Group body */}
                {!isCollapsed && (
                  <div className="divide-y divide-zinc-100">
                    {values2.map((v2) => {
                      const key = `${v1.name}|${v2}`;
                      const hex2 = getColorHex(v2);
                      return (
                        <div key={key} className="flex items-center justify-between px-4 py-2 bg-white">
                          <div className="flex items-center gap-2">
                            {hex2 && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-zinc-200 flex-shrink-0"
                                style={{ backgroundColor: hex2 }}
                              />
                            )}
                            <span className="text-sm text-zinc-700">{v2}</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            value={grid[key] ?? 0}
                            onChange={(e) => handleGridChange(key, e.target.value)}
                            className="w-20 px-2 py-1.5 rounded-lg border border-zinc-200 text-center text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#FF9500]/30 focus:border-[#FF9500]"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-zinc-400">
          {isZh ? "填 0 = 冇貨" : "0 = out of stock"}
        </p>
      </div>
    );
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
            {variantMode === "none" && !showPresetPicker ? (
              <div className="space-y-3">
                {/* Variant memory suggestion */}
                {isNew && variantMemory && !memoryDismissed && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-amber-800">
                        {isZh ? "上次設定：" : "Last config: "}
                        {variantMemory.label} ({variantMemory.selectedValues.slice(0, 3).join("/")}{variantMemory.selectedValues.length > 3 ? "..." : ""})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyMemory}
                      className="px-3 py-1 rounded-lg bg-[#FF9500] text-white text-xs font-medium hover:bg-[#E68600] transition-colors flex-shrink-0"
                    >
                      {isZh ? "套用" : "Apply"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemoryDismissed(true)}
                      className="text-amber-400 hover:text-amber-600 flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Add option button */}
                <button
                  type="button"
                  onClick={() => setShowPresetPicker(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-300 text-zinc-600 hover:border-[#FF9500] hover:text-[#FF9500] transition-colors text-sm font-medium w-full justify-center"
                >
                  <Plus size={16} />
                  {isZh ? "加選項" : "Add options"}
                </button>
              </div>
            ) : variantMode === "none" && showPresetPicker ? (
              /* Preset picker for first option */
              renderPresetPicker(false)
            ) : (
              /* Active variant editing */
              <div className="space-y-4">
                {/* Option 1 header */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-zinc-700">
                    {activePreset1 && <span className="mr-1">{activePreset1.icon}</span>}
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

                {/* Option 1 name input */}
                <input
                  type="text"
                  value={optionName1}
                  onChange={(e) => setOptionName1(e.target.value)}
                  placeholder={isZh ? "尺碼 / 口味 / 容量" : "Size / Flavor / Volume"}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                />

                {/* Checkbox chips for preset values */}
                {activePreset1 && activePreset1.values.length > 0 && (
                  renderValueChips(
                    activePreset1.values,
                    values1.map((v) => v.name),
                    handleToggleValue1,
                    activePreset1.colorHex
                  )
                )}

                {/* Custom value input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomValue}
                    onChange={(e) => setNewCustomValue(e.target.value)}
                    placeholder={isZh ? "自訂值" : "Custom value"}
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomValue1())}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomValue1}
                    className="px-3 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors text-sm font-medium flex-shrink-0"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Show non-preset selected values as removable tags */}
                {values1.filter((v) => !activePreset1?.values.includes(v.name)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {values1
                      .filter((v) => !activePreset1?.values.includes(v.name))
                      .map((v) => (
                        <span
                          key={v.name}
                          className="inline-flex items-center gap-1 bg-[#FF9500]/10 border border-[#FF9500] text-[#FF9500] text-sm px-3 py-1.5 rounded-full font-medium"
                        >
                          {v.name}
                          <button
                            type="button"
                            onClick={() => handleToggleValue1(v.name)}
                            className="text-[#FF9500]/60 hover:text-[#FF9500]"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                  </div>
                )}

                {/* Stock section (single mode) */}
                {variantMode === "single" && renderSingleStockList()}

                {/* Bulk set all */}
                {values1.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{isZh ? "全部設為" : "Set all to"}</span>
                    <input
                      type="number"
                      min="0"
                      value={bulkQty}
                      onChange={(e) => setBulkQty(e.target.value)}
                      placeholder="0"
                      className="w-20 px-2 py-1.5 rounded-lg border border-zinc-200 text-center text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-[#FF9500]/30 focus:border-[#FF9500]"
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleBulkSetAll())}
                    />
                    <button
                      type="button"
                      onClick={handleBulkSetAll}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors text-xs font-medium"
                    >
                      {isZh ? "套用" : "Apply"}
                    </button>
                  </div>
                )}

                {/* Second option section */}
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

                {/* Dual mode - second option */}
                {variantMode === "dual" && (
                  <div className="space-y-4 pt-2 border-t border-zinc-200">
                    {showPresetPicker2 ? (
                      renderPresetPicker(true)
                    ) : (
                      <>
                        {/* Option 2 header */}
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-zinc-700">
                            {activePreset2 && <span className="mr-1">{activePreset2.icon}</span>}
                            {isZh ? "第二個選項名稱" : "Second option name"}
                          </label>
                          <button
                            type="button"
                            onClick={handleRemoveOption2}
                            className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
                          >
                            {isZh ? "移除" : "Remove"}
                          </button>
                        </div>

                        {/* Option 2 name input */}
                        <input
                          type="text"
                          value={optionName2}
                          onChange={(e) => setOptionName2(e.target.value)}
                          placeholder={isZh ? "例如：顏色" : "e.g. Color"}
                          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                        />

                        {/* Checkbox chips for preset 2 values */}
                        {activePreset2 && activePreset2.values.length > 0 && (
                          renderValueChips(
                            activePreset2.values,
                            values2,
                            handleToggleValue2,
                            activePreset2.colorHex
                          )
                        )}

                        {/* Custom value input for option 2 */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCustomValue2}
                            onChange={(e) => setNewCustomValue2(e.target.value)}
                            placeholder={isZh ? "自訂值" : "Custom value"}
                            className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustomValue2())}
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomValue2}
                            className="px-3 py-2 rounded-xl bg-zinc-100 text-zinc-700 hover:bg-zinc-200 transition-colors text-sm font-medium flex-shrink-0"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Show non-preset selected values2 as removable tags */}
                        {values2.filter((v) => !activePreset2?.values.includes(v)).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {values2
                              .filter((v) => !activePreset2?.values.includes(v))
                              .map((v) => (
                                <span
                                  key={v}
                                  className="inline-flex items-center gap-1 bg-[#FF9500]/10 border border-[#FF9500] text-[#FF9500] text-sm px-3 py-1.5 rounded-full font-medium"
                                >
                                  {v}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleValue2(v)}
                                    className="text-[#FF9500]/60 hover:text-[#FF9500]"
                                  >
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                          </div>
                        )}

                        {/* Dual variant stock groups */}
                        {renderDualStockGroups()}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
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
