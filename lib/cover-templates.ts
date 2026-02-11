export interface CoverTemplate {
  id: string;
  label: string;
  labelEn: string;
  /** Tailwind gradient classes for preview */
  gradient: string;
  /** CSS background for actual cover */
  css: string;
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    id: "warm-gradient",
    label: "暖橙",
    labelEn: "Warm",
    gradient: "bg-gradient-to-br from-orange-300 to-amber-400",
    css: "linear-gradient(135deg, #fdba74, #fbbf24)",
  },
  {
    id: "ocean-blue",
    label: "藍白",
    labelEn: "Ocean",
    gradient: "bg-gradient-to-br from-sky-300 to-blue-400",
    css: "linear-gradient(135deg, #7dd3fc, #60a5fa)",
  },
  {
    id: "pastel-pink",
    label: "粉彩",
    labelEn: "Pastel",
    gradient: "bg-gradient-to-br from-pink-200 to-purple-300",
    css: "linear-gradient(135deg, #fbcfe8, #d8b4fe)",
  },
  {
    id: "monochrome",
    label: "黑白",
    labelEn: "Mono",
    gradient: "bg-gradient-to-br from-zinc-700 to-zinc-900",
    css: "linear-gradient(135deg, #3f3f46, #18181b)",
  },
  {
    id: "nature-green",
    label: "自然",
    labelEn: "Nature",
    gradient: "bg-gradient-to-br from-emerald-300 to-green-500",
    css: "linear-gradient(135deg, #6ee7b7, #22c55e)",
  },
  {
    id: "sunset",
    label: "日落",
    labelEn: "Sunset",
    gradient: "bg-gradient-to-br from-rose-400 to-orange-400",
    css: "linear-gradient(135deg, #fb7185, #fb923c)",
  },
];

export function getCoverTemplate(id: string): CoverTemplate | undefined {
  return COVER_TEMPLATES.find((t) => t.id === id);
}
