// Bio Link 主題系統

export type BioLinkTheme = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  background: string; // 主背景色
  darkZone: string; // Featured section 背景色
  lightZone: string; // Product grid 背景色
  gradient: string; // 過渡漸變
  textPrimary: string; // 主要文字
  textSecondary: string; // 次要文字
};

export const BIO_LINK_THEMES: BioLinkTheme[] = [
  {
    id: "minimal",
    name: "簡約",
    nameEn: "Minimal",
    description: "白底黑字，清爽簡潔",
    background: "#FFFFFF",
    darkZone: "#FFFFFF",
    lightZone: "#F5F5F0",
    gradient: "linear-gradient(180deg, #FFFFFF 0%, #F5F5F0 100%)",
    textPrimary: "#000000",
    textSecondary: "#52525B",
  },
  {
    id: "dark",
    name: "暗黑",
    nameEn: "Dark",
    description: "暗黑底白字，型格酷炫",
    background: "#0F0F0F",
    darkZone: "#0F0F0F",
    lightZone: "#1A1A1A",
    gradient: "linear-gradient(180deg, #0F0F0F 0%, #1A1A1A 100%)",
    textPrimary: "#FFFFFF",
    textSecondary: "#A1A1AA",
  },
  {
    id: "colorful",
    name: "繽紛",
    nameEn: "Colorful",
    description: "品牌色做背景，突顯個性",
    background: "var(--brand-color)", // 使用 brandColor
    darkZone: "var(--brand-color)",
    lightZone: "#F5F5F0",
    gradient: "linear-gradient(180deg, var(--brand-color) 0%, #F5F5F0 100%)",
    textPrimary: "#FFFFFF",
    textSecondary: "#F5F5F0",
  },
];

export const DEFAULT_THEME_ID = "dark";

export function getTheme(templateId: string | null): BioLinkTheme {
  const theme = BIO_LINK_THEMES.find((t) => t.id === templateId);
  return theme || BIO_LINK_THEMES.find((t) => t.id === DEFAULT_THEME_ID)!;
}
