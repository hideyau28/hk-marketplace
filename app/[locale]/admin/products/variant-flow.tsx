"use client";

import { useState, useMemo } from "react";
import {
  VARIANT_PRESETS,
  COLOR_OPTIONS,
  getColorHex,
  parseExistingVariant,
} from "@/lib/variant-presets";
import type { VariantPreset } from "@/lib/variant-presets";

type VariantStep =
  | "none"
  | "type"
  | "hasColor"
  | "colors"
  | "hasSizes"
  | "sizeType"
  | "sizes"
  | "stock"
  | "done";

type Props = {
  initialSizes: unknown;
  disabled: boolean;
  onChange: (sizes: unknown, totalStock: number) => void;
};

// ─── helpers ────────────────────────────────────────────────────

function sumStock(map: Record<string, number>): number {
  return Object.values(map).reduce((a, b) => a + (b || 0), 0);
}

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50";
const chipBase =
  "rounded-xl border px-3 py-2 text-sm transition-colors cursor-pointer select-none";
const chipOff = `${chipBase} border-white/10 bg-white/5 text-white/60 hover:border-white/20`;
const chipOn = `${chipBase} border-white/40 bg-white/15 text-white`;
const btnPrimary =
  "rounded-2xl bg-white px-4 py-3 text-sm text-black font-semibold hover:bg-white/90 disabled:opacity-50";
const btnSecondary =
  "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 disabled:opacity-50";
const btnSmall =
  "rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 hover:bg-white/10";

// ─── component ──────────────────────────────────────────────────

export function VariantFlow({ initialSizes, disabled, onChange }: Props) {
  const initData = useMemo(() => parseExistingVariant(initialSizes), [initialSizes]);
  const hasInitial = initData.sizeValues.length > 0 || initData.colors.length > 0;

  const [step, setStep] = useState<VariantStep>(hasInitial ? "done" : "none");
  const [selectedPreset, setSelectedPreset] = useState<VariantPreset | null>(null);
  const [secondaryPreset, setSecondaryPreset] = useState<VariantPreset | null>(null);
  const [hasColor, setHasColor] = useState(initData.hasColor);
  const [selectedColors, setSelectedColors] = useState<string[]>(initData.colors);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(initData.sizeValues);
  const [stockMap, setStockMap] = useState<Record<string, number>>(initData.stockMap);

  const [customInput, setCustomInput] = useState("");
  const [customPresetLabel, setCustomPresetLabel] = useState("");
  const [showCustomPreset, setShowCustomPreset] = useState(false);
  const [collapsedColors, setCollapsedColors] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState("");

  const isColorPreset = selectedPreset?.id === "color";
  const sizePreset = isColorPreset ? secondaryPreset : selectedPreset;
  const sizeLabel = sizePreset?.label || initData.presetLabel || "尺碼";

  // ─── flow mode (for stock + summary rendering) ──────────────
  // "sizeOnly"     = single-dim by sizes
  // "colorOnly"    = single-dim by colors (color preset, no sizes)
  // "colorAndSize" = two-dim (color × size)
  const flowMode = useMemo(() => {
    if (hasColor && selectedColors.length > 0 && selectedSizes.length > 0) return "colorAndSize";
    if (isColorPreset && selectedColors.length > 0 && selectedSizes.length === 0) return "colorOnly";
    // For initial data without hasColor, check if keys look like colors
    if (!hasColor && initData.sizeValues.length > 0 && initData.sizeValues.every((v) => COLOR_OPTIONS.some((c) => c.name === v))) {
      return "colorOnly";
    }
    return "sizeOnly";
  }, [hasColor, selectedColors, selectedSizes, isColorPreset, initData.sizeValues]);

  // ─── actions ────────────────────────────────────────────────

  function handleSelectPreset(preset: VariantPreset) {
    setSelectedPreset(preset);
    if (preset.id === "color") {
      setStep("colors");
    } else {
      setStep("hasColor");
    }
  }

  function handleCustomPreset() {
    const label = customPresetLabel.trim();
    if (!label) return;
    const custom: VariantPreset = { id: `custom_${label}`, emoji: "🏷️", label, values: [] };
    setSelectedPreset(custom);
    setShowCustomPreset(false);
    setCustomPresetLabel("");
    setStep("hasColor");
  }

  function handleHasColorAnswer(answer: boolean) {
    setHasColor(answer);
    setStep(answer ? "colors" : "sizes");
  }

  function handleColorsNext() {
    if (selectedColors.length === 0) return;
    if (isColorPreset) {
      setStep("hasSizes");
    } else {
      setStep("sizes");
    }
  }

  function handleHasSizesAnswer(answer: boolean) {
    if (answer) {
      setHasColor(true);
      setStep("sizeType");
    } else {
      // Color-only: no size dimension
      setHasColor(false);
      setStep("stock");
    }
  }

  function handleSelectSizeType(preset: VariantPreset) {
    setSecondaryPreset(preset);
    setStep("sizes");
  }

  function handleSizesNext() {
    if (selectedSizes.length === 0) return;
    setStep("stock");
  }

  function handleComplete() {
    const sizesData = buildOutput();
    const total = sumStock(stockMap);
    onChange(sizesData, total);
    setStep("done");
  }

  function handleReset() {
    setSelectedPreset(null);
    setSecondaryPreset(null);
    setHasColor(false);
    setSelectedColors([]);
    setSelectedSizes([]);
    setStockMap({});
    setCustomInput("");
    setBulkValue("");
    setCollapsedColors(new Set());
    setStep("none");
    onChange(null, 0);
  }

  // ─── data helpers ─────────────────────────────────────────────

  function toggleColor(name: string) {
    setSelectedColors((prev) => (prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]));
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function addCustomItem(target: "color" | "size") {
    const val = customInput.trim();
    if (!val) return;
    if (target === "color" && !selectedColors.includes(val)) {
      setSelectedColors((prev) => [...prev, val]);
    } else if (target === "size" && !selectedSizes.includes(val)) {
      setSelectedSizes((prev) => [...prev, val]);
    }
    setCustomInput("");
  }

  function updateStock(key: string, value: string) {
    const num = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    setStockMap((prev) => ({ ...prev, [key]: num }));
  }

  function applyBulk() {
    const val = parseInt(bulkValue, 10);
    if (isNaN(val) || val < 0) return;
    const next: Record<string, number> = {};
    if (flowMode === "colorAndSize") {
      for (const c of selectedColors) for (const s of selectedSizes) next[`${c}|${s}`] = val;
    } else if (flowMode === "colorOnly") {
      for (const c of selectedColors) next[c] = val;
    } else {
      for (const s of selectedSizes) next[s] = val;
    }
    setStockMap(next);
    setBulkValue("");
  }

  function toggleCollapse(color: string) {
    setCollapsedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  }

  function buildOutput(): unknown {
    if (flowMode === "colorAndSize") {
      return {
        dimensions: ["顏色", sizeLabel],
        options: { "顏色": selectedColors, [sizeLabel]: selectedSizes },
        combinations: Object.fromEntries(
          selectedColors.flatMap((c) => selectedSizes.map((s) => [`${c}|${s}`, stockMap[`${c}|${s}`] || 0])),
        ),
      };
    }
    // Single-dim (either by size or by color)
    const items = flowMode === "colorOnly" ? selectedColors : selectedSizes;
    const result: Record<string, number> = {};
    for (const item of items) result[item] = stockMap[item] || 0;
    return result;
  }

  // ─── step renders ─────────────────────────────────────────────

  if (step === "none") {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setStep("type")}
        className={btnSecondary}
      >
        + 加選項
      </button>
    );
  }

  if (step === "type") {
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">選擇選項類型</label>
        <div className="grid grid-cols-3 gap-2">
          {VARIANT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPreset(p)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <span className="text-base">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>

        {!showCustomPreset ? (
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowCustomPreset(true)} className={btnSmall}>
              ✏️ 自訂
            </button>
            <button type="button" onClick={() => setStep("none")} className={btnSmall}>
              取消
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={customPresetLabel}
              onChange={(e) => setCustomPresetLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCustomPreset())}
              placeholder="輸入選項名稱，如：尺寸"
              className={inputCls}
              autoFocus
            />
            <button type="button" onClick={handleCustomPreset} className={btnSmall}>
              確定
            </button>
          </div>
        )}
      </div>
    );
  }

  if (step === "hasColor") {
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">
          呢件商品有冇唔同顏色？
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleHasColorAnswer(false)}
            className={btnSecondary + " flex-1"}
          >
            冇（均色）
          </button>
          <button
            type="button"
            onClick={() => handleHasColorAnswer(true)}
            className={btnPrimary + " flex-1"}
          >
            有
          </button>
        </div>
      </div>
    );
  }

  if (step === "colors") {
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">揀顏色（可多選）</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_OPTIONS.map((c) => {
            const sel = selectedColors.includes(c.name);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleColor(c.name)}
                className={`flex flex-col items-center gap-1 rounded-2xl border p-2 transition-colors ${
                  sel ? "border-white/40 bg-white/10" : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <span
                  className="inline-block h-7 w-7 rounded-full border"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: c.hex === "#FFFFFF" || c.hex === "#F5F5DC" ? "rgba(255,255,255,0.3)" : c.hex,
                  }}
                />
                <span className="text-xs text-white/80">{c.name}</span>
                {sel && <span className="text-[10px] text-white">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomItem("color"))}
            placeholder="自訂顏色名稱"
            className={inputCls}
          />
          <button type="button" onClick={() => addCustomItem("color")} className={btnSmall}>
            +
          </button>
        </div>

        {selectedColors.length > 0 && (
          <p className="text-xs text-white/40">已選：{selectedColors.join("、")}</p>
        )}

        <button
          type="button"
          disabled={selectedColors.length === 0}
          onClick={handleColorsNext}
          className={btnPrimary + " w-full"}
        >
          下一步 →
        </button>
      </div>
    );
  }

  if (step === "hasSizes") {
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">
          有冇唔同尺碼？
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleHasSizesAnswer(false)}
            className={btnSecondary + " flex-1"}
          >
            冇（均碼）
          </button>
          <button
            type="button"
            onClick={() => handleHasSizesAnswer(true)}
            className={btnPrimary + " flex-1"}
          >
            有
          </button>
        </div>
      </div>
    );
  }

  if (step === "sizeType") {
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">選擇尺碼類型</label>
        <div className="grid grid-cols-3 gap-2">
          {VARIANT_PRESETS.filter((p) => p.id !== "color").map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectSizeType(p)}
              className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/80 hover:bg-white/10 transition-colors"
            >
              <span className="text-base">{p.emoji}</span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "sizes") {
    const presetValues = sizePreset?.values ?? [];
    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">
          揀{sizeLabel}（可多選）
        </label>

        {presetValues.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {presetValues.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => toggleSize(v)}
                className={selectedSizes.includes(v) ? chipOn : chipOff}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomItem("size"))}
            placeholder={`自訂${sizeLabel}`}
            className={inputCls}
          />
          <button type="button" onClick={() => addCustomItem("size")} className={btnSmall}>
            +
          </button>
        </div>

        {selectedSizes.length > 0 && (
          <p className="text-xs text-white/40">已選：{selectedSizes.join("、")}</p>
        )}

        <button
          type="button"
          disabled={selectedSizes.length === 0}
          onClick={handleSizesNext}
          className={btnPrimary + " w-full"}
        >
          下一步 →
        </button>
      </div>
    );
  }

  if (step === "stock") {
    const isTwoDim = flowMode === "colorAndSize";
    const singleItems = flowMode === "colorOnly" ? selectedColors : selectedSizes;

    return (
      <div className="space-y-3">
        <label className="block text-white/80 text-sm font-medium">填庫存</label>

        {/* Bulk set */}
        <div className="flex gap-2 items-center">
          <span className="text-xs text-white/40 shrink-0">全部設為</span>
          <input
            type="number"
            min={0}
            value={bulkValue}
            onChange={(e) => setBulkValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyBulk())}
            className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="0"
          />
          <button type="button" onClick={applyBulk} className={btnSmall}>
            套用
          </button>
        </div>

        {isTwoDim ? (
          /* Two-dim: grouped by color */
          <div className="space-y-2">
            {selectedColors.map((color) => {
              const collapsed = collapsedColors.has(color);
              const groupTotal = selectedSizes.reduce((sum, s) => sum + (stockMap[`${color}|${s}`] || 0), 0);
              const hex = getColorHex(color);
              return (
                <div key={color} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(color)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-sm text-white/80 hover:bg-white/5"
                  >
                    {hex && (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-white/20"
                        style={{ backgroundColor: hex }}
                      />
                    )}
                    <span className="font-medium">{color}</span>
                    <span className="text-white/40 text-xs">(共 {groupTotal} 件)</span>
                    <span className="ml-auto text-white/40">{collapsed ? "▶" : "▼"}</span>
                  </button>
                  {!collapsed && (
                    <div className="border-t border-white/10 px-4 py-2 space-y-2">
                      {selectedSizes.map((size) => {
                        const key = `${color}|${size}`;
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <span className="w-12 text-sm text-white/60">{size}</span>
                            <input
                              type="number"
                              min={0}
                              value={stockMap[key] || ""}
                              onChange={(e) => updateStock(key, e.target.value)}
                              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-white/20"
                              placeholder="0"
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
        ) : (
          /* Single-dim */
          <div className="space-y-2">
            {singleItems.map((item) => {
              const hex = getColorHex(item);
              return (
                <div key={item} className="flex items-center gap-3">
                  {hex && (
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-white/20"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="w-16 text-sm text-white/60">{item}</span>
                  <input
                    type="number"
                    min={0}
                    value={stockMap[item] || ""}
                    onChange={(e) => updateStock(item, e.target.value)}
                    className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
        )}

        <button type="button" onClick={handleComplete} className={btnPrimary + " w-full"}>
          完成 ✓
        </button>
      </div>
    );
  }

  // step === "done" — summary
  const totalStock = sumStock(stockMap);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="text-green-400">✅</span> 選項設定
        </div>

        {flowMode === "colorAndSize" ? (
          <>
            <p className="text-xs text-white/40">{sizeLabel} × 顏色 · 共 {totalStock} 件</p>
            {selectedColors.map((color) => {
              const hex = getColorHex(color);
              const parts = selectedSizes.map((s) => `${s}(${stockMap[`${color}|${s}`] || 0})`).join(" ");
              return (
                <div key={color} className="flex items-center gap-2 text-sm text-white/70">
                  {hex && (
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-white/20"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span>{color}：{parts}</span>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs text-white/40">共 {totalStock} 件</p>
            <p className="text-sm text-white/70">
              {(flowMode === "colorOnly" ? selectedColors : selectedSizes)
                .map((item) => {
                  const hex = getColorHex(item);
                  const prefix = hex ? "● " : "";
                  return `${prefix}${item}(${stockMap[item] || 0})`;
                })
                .join("  ")}
            </p>
          </>
        )}
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={handleReset} className={btnSecondary + " flex-1"}>
          重新設定
        </button>
        <button type="button" onClick={() => setStep("stock")} className={btnSecondary + " flex-1"}>
          ✏️ 改庫存
        </button>
      </div>
    </div>
  );
}
