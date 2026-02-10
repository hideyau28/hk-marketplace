export type VariantPreset = {
  id: string;
  emoji: string;
  label: string;
  values: string[];
};

export const VARIANT_PRESETS: VariantPreset[] = [
  { id: "shirt_size", emoji: "👕", label: "衫碼", values: ["XS", "S", "M", "L", "XL", "XXL", "均碼"] },
  { id: "pants_size", emoji: "👖", label: "褲碼", values: ["26", "28", "29", "30", "31", "32", "33", "34", "36", "38"] },
  { id: "shoe_size", emoji: "👟", label: "鞋碼", values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"] },
  { id: "color", emoji: "🎨", label: "顏色", values: [] },
  { id: "capacity", emoji: "📐", label: "容量", values: ["250ml", "500ml", "750ml", "1L", "1.5L", "2L"] },
  { id: "flavor", emoji: "🍰", label: "口味", values: [] },
  { id: "model", emoji: "📱", label: "型號", values: [] },
  { id: "material", emoji: "💍", label: "材質", values: ["925銀", "14K金", "18K金", "鉑金", "不鏽鋼", "鈦金屬"] },
];

export type ColorOption = {
  name: string;
  hex: string;
};

export const COLOR_OPTIONS: ColorOption[] = [
  { name: "黑色", hex: "#000000" },
  { name: "白色", hex: "#FFFFFF" },
  { name: "米色", hex: "#F5F5DC" },
  { name: "啡色", hex: "#8B4513" },
  { name: "粉紅", hex: "#FFB6C1" },
  { name: "紅色", hex: "#DC143C" },
  { name: "藍色", hex: "#1E90FF" },
  { name: "綠色", hex: "#228B22" },
  { name: "紫色", hex: "#8B008B" },
  { name: "橙色", hex: "#FF8C00" },
  { name: "黃色", hex: "#FFD700" },
  { name: "灰色", hex: "#808080" },
];

/** Get hex color for a color name, returns null for custom colors */
export function getColorHex(name: string): string | null {
  return COLOR_OPTIONS.find((c) => c.name === name)?.hex ?? null;
}

/** Parse existing sizes JSON from DB into variant flow state */
export function parseExistingVariant(sizes: unknown): {
  hasColor: boolean;
  colors: string[];
  sizeValues: string[];
  stockMap: Record<string, number>;
  presetLabel?: string;
} {
  if (!sizes || typeof sizes !== "object") {
    return { hasColor: false, colors: [], sizeValues: [], stockMap: {} };
  }

  const s = sizes as Record<string, unknown>;

  if (s.dimensions && Array.isArray(s.dimensions)) {
    // Two-dimensional format
    const dims = s.dimensions as string[];
    const opts = (s.options ?? {}) as Record<string, string[]>;
    const combos = (s.combinations ?? {}) as Record<string, unknown>;

    const colors = opts[dims[0]] ?? [];
    const sizeValues = opts[dims[1]] ?? [];
    const stockMap: Record<string, number> = {};
    for (const [key, val] of Object.entries(combos)) {
      stockMap[key] = typeof val === "number" ? val : 0;
    }
    return { hasColor: true, colors, sizeValues, stockMap, presetLabel: dims[1] };
  }

  // Single-dimensional: Record<string, number>
  const sizeValues = Object.keys(s);
  const stockMap: Record<string, number> = {};
  for (const [key, val] of Object.entries(s)) {
    stockMap[key] =
      typeof val === "number"
        ? val
        : typeof val === "object" && val !== null
          ? ((val as Record<string, unknown>).qty as number) || 0
          : 0;
  }
  return { hasColor: false, colors: [], sizeValues, stockMap };
}
