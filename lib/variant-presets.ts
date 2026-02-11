export const COLOR_PRESET_ID = "color";

export interface VariantPreset {
  id: string;
  icon: string;
  label: string;
  values: string[];
  colorHex?: Record<string, string>;
}

export const VARIANT_PRESETS: VariantPreset[] = [
  {
    id: "shirt-size",
    icon: "👕",
    label: "衫碼",
    values: ["XS", "S", "M", "L", "XL", "XXL", "均碼"],
  },
  {
    id: "pants-size",
    icon: "👖",
    label: "褲碼",
    values: ["26", "27", "28", "29", "30", "31", "32", "33", "34", "36"],
  },
  {
    id: "shoe-size-us",
    icon: "👟",
    label: "鞋碼 (US)",
    values: [
      "US 4", "US 4.5", "US 5", "US 5.5", "US 6", "US 6.5",
      "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5",
      "US 10", "US 10.5", "US 11", "US 11.5", "US 12", "US 13",
    ],
  },
  {
    id: "color",
    icon: "🎨",
    label: "顏色",
    values: [
      "黑色", "白色", "灰色", "米色", "粉紅", "紅色",
      "藍色", "綠色", "啡色", "紫色", "橙色", "黃色",
    ],
    colorHex: {
      "黑色": "#1a1a1a",
      "白色": "#f5f0eb",
      "灰色": "#9e9e9e",
      "米色": "#f5e6c8",
      "粉紅": "#e8a0b4",
      "紅色": "#d32f2f",
      "藍色": "#1976d2",
      "綠色": "#388e3c",
      "啡色": "#795548",
      "紫色": "#7b1fa2",
      "橙色": "#ff9800",
      "黃色": "#fdd835",
    },
  },
  {
    id: "volume",
    icon: "📐",
    label: "容量",
    values: ["30ml", "50ml", "100ml", "150ml", "200ml", "250ml", "500ml"],
  },
  {
    id: "flavor",
    icon: "🍰",
    label: "口味",
    values: [],
  },
  {
    id: "model",
    icon: "📱",
    label: "型號",
    values: [
      "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
      "iPhone 15", "Samsung S25", "Samsung S25 Ultra",
    ],
  },
  {
    id: "material",
    icon: "💍",
    label: "材質",
    values: ["金色", "銀色", "玫瑰金", "鉑金", "不鏽鋼", "925銀"],
  },
];

// 搜尋用
export const EXTENDED_PRESETS: VariantPreset[] = [
  { id: "shoe-size-eu", icon: "👟", label: "鞋碼 (EU)", values: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"] },
  { id: "kids-size", icon: "👶", label: "童裝碼", values: ["80", "90", "100", "110", "120", "130", "140", "150"] },
  { id: "ring-size", icon: "💍", label: "戒圍", values: ["5", "6", "7", "8", "9", "10", "11", "12", "13"] },
  { id: "weight", icon: "⚖️", label: "重量", values: ["50g", "100g", "200g", "250g", "500g", "1kg"] },
  { id: "length", icon: "📏", label: "長度", values: ["40cm", "45cm", "50cm", "55cm", "60cm"] },
  { id: "cake-size", icon: "🎂", label: "蛋糕尺寸", values: ["4吋", "6吋", "8吋", "10吋", "12吋"] },
  { id: "fragrance", icon: "🌸", label: "香味", values: [] },
  { id: "bundle", icon: "📦", label: "套裝", values: ["單件", "2件裝", "3件裝", "5件裝", "禮盒裝"] },
];
