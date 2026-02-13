// Template definitions for storefront themes
// 4 templates: noir, linen, mochi (default), petal

export interface CoverTemplate {
  id: string;
  label: string;        // zh-HK name
  labelEn: string;      // English name
  descZh: string;       // zh-HK description
  descEn: string;       // English description
  // Design tokens
  bg: string;           // page background color
  card: string;         // card background color
  text: string;         // primary text color
  subtext: string;      // secondary text color
  accent: string;       // accent / price color
  headerGradient: string; // CSS linear-gradient for header band
  borderRadius: { card: number; button: number; image: number };
  buttonStyle: "filled" | "outline";
  shadow: string;       // CSS box-shadow (or "none")
  // Font tokens
  headingFont: string;  // Google Fonts family name for headings
  bodyFont: string;     // Google Fonts family name for body text
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "noir",
    label: "暗黑",
    labelEn: "Noir",
    descZh: "型格街頭",
    descEn: "Bold & edgy",
    bg: "#0D0D0D",
    card: "#1A1A1A",
    text: "#FFFFFF",
    subtext: "#A0A0A0",
    accent: "#FF9500",
    headerGradient: "linear-gradient(135deg, #1A1A1A, #0D0D0D)",
    borderRadius: { card: 4, button: 4, image: 2 },
    buttonStyle: "filled",
    shadow: "none",
    headingFont: "Bebas Neue",
    bodyFont: "Inter",
  },
  {
    id: "linen",
    label: "棉麻",
    labelEn: "Linen",
    descZh: "溫暖精緻",
    descEn: "Warm & elegant",
    bg: "#FAF7F2",
    card: "#FFFFFF",
    text: "#3D3229",
    subtext: "#8C7B6B",
    accent: "#C49A6C",
    headerGradient: "linear-gradient(135deg, #FAF7F2, #F0E8DA)",
    borderRadius: { card: 16, button: 24, image: 12 },
    buttonStyle: "outline",
    shadow: "0 2px 8px rgba(0,0,0,0.06)",
    headingFont: "Playfair Display",
    bodyFont: "Lato",
  },
  {
    id: "mochi",
    label: "抹茶",
    labelEn: "Mochi",
    descZh: "清新專業",
    descEn: "Clean & fresh",
    bg: "#FFFFFF",
    card: "#F8FAF7",
    text: "#1A1A1A",
    subtext: "#6B7280",
    accent: "#2D6A4F",
    headerGradient: "linear-gradient(135deg, #FFFFFF, #F0F5EE)",
    borderRadius: { card: 12, button: 12, image: 8 },
    buttonStyle: "filled",
    shadow: "0 1px 3px rgba(0,0,0,0.08)",
    headingFont: "Montserrat",
    bodyFont: "Inter",
  },
  {
    id: "petal",
    label: "花瓣",
    labelEn: "Petal",
    descZh: "優雅奢華",
    descEn: "Soft & luxe",
    bg: "#FDF2F4",
    card: "#FFFFFF",
    text: "#4A2040",
    subtext: "#8E6B7F",
    accent: "#C77D91",
    headerGradient: "linear-gradient(135deg, #FDF2F4, #F8E4E8)",
    borderRadius: { card: 20, button: 999, image: 16 },
    buttonStyle: "filled",
    shadow: "0 2px 12px rgba(199,125,145,0.12)",
    headingFont: "Cormorant Garamond",
    bodyFont: "Lato",
  },
];

// 所有舊 template ID → mochi（backward compat）
const LEGACY_MAP: Record<string, string> = {
  "warm-gradient": "mochi",
  "ocean-blue": "mochi",
  "pastel-pink": "mochi",
  monochrome: "mochi",
  "nature-green": "mochi",
  sunset: "mochi",
  warm: "mochi",
  ocean: "mochi",
  pastel: "mochi",
  mono: "mochi",
  blue: "mochi",
  pink: "mochi",
  green: "mochi",
  purple: "mochi",
  default: "mochi",
};

const VALID_IDS = new Set(COVER_TEMPLATES.map((t) => t.id));

/** Resolve any template ID (including legacy) to a canonical ID */
export function resolveTemplateId(id: string | null | undefined): string {
  if (!id) return "mochi";
  if (VALID_IDS.has(id)) return id;
  return LEGACY_MAP[id] || "mochi";
}

/** Convert hex (#RRGGBB) to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Get template by ID (handles legacy IDs). Always returns a valid template. */
export function getCoverTemplate(id: string | null | undefined): CoverTemplate {
  const canonicalId = resolveTemplateId(id);
  return COVER_TEMPLATES.find((t) => t.id === canonicalId) || COVER_TEMPLATES[2]; // mochi fallback
}
