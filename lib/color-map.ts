/**
 * 顏色名 → hex 對照表
 * 用於雙維 variant 嘅顏色 dot 顯示
 */
const COLOR_HEX: Record<string, string> = {
  // 中文
  "黑色": "#212121",
  "白色": "#FAFAFA",
  "米色": "#f5e6c8",
  "粉紅": "#EC407A",
  "紅色": "#E53935",
  "藍色": "#1E88E5",
  "天藍": "#7eb8d0",
  "深藍": "#1a237e",
  "綠色": "#43A047",
  "軍綠": "#556b2f",
  "灰色": "#9e9e9e",
  "啡色": "#795548",
  "卡其": "#c4a97d",
  "紫色": "#7b1fa2",
  "橙色": "#FF9500",
  "黃色": "#FDD835",
  "杏色": "#f0d5b8",
  // English
  "Black": "#212121",
  "White": "#FAFAFA",
  "Beige": "#f5e6c8",
  "Pink": "#EC407A",
  "Red": "#E53935",
  "Blue": "#1E88E5",
  "Navy": "#1a237e",
  "Green": "#43A047",
  "Grey": "#9e9e9e",
  "Gray": "#9e9e9e",
  "Brown": "#795548",
  "Khaki": "#c4a97d",
  "Purple": "#7b1fa2",
  "Orange": "#FF9500",
  "Yellow": "#FDD835",
};

export function getColorHex(colorName: string): string {
  return COLOR_HEX[colorName] || "#888";
}
