/**
 * 顏色名 → hex 對照表
 * 用於雙維 variant 嘅顏色 dot 顯示
 */
const COLOR_HEX: Record<string, string> = {
  // 中文
  "黑色": "#1a1a1a",
  "白色": "#f5f0eb",
  "米色": "#f5e6c8",
  "粉紅": "#e8a0b4",
  "紅色": "#d32f2f",
  "藍色": "#1976d2",
  "天藍": "#7eb8d0",
  "深藍": "#1a237e",
  "綠色": "#388e3c",
  "軍綠": "#556b2f",
  "灰色": "#9e9e9e",
  "啡色": "#795548",
  "卡其": "#c4a97d",
  "紫色": "#7b1fa2",
  "橙色": "#ff9800",
  "黃色": "#fdd835",
  "杏色": "#f0d5b8",
  // English
  "Black": "#1a1a1a",
  "White": "#f5f0eb",
  "Beige": "#f5e6c8",
  "Pink": "#e8a0b4",
  "Red": "#d32f2f",
  "Blue": "#1976d2",
  "Navy": "#1a237e",
  "Green": "#388e3c",
  "Grey": "#9e9e9e",
  "Gray": "#9e9e9e",
  "Brown": "#795548",
  "Khaki": "#c4a97d",
  "Purple": "#7b1fa2",
  "Orange": "#ff9800",
  "Yellow": "#fdd835",
};

export function getColorHex(colorName: string): string {
  return COLOR_HEX[colorName] || "#888";
}
