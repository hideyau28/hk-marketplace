export interface CoverTemplate {
  id: string;
  label: string;
  css: string;
}

export const COVER_TEMPLATES: CoverTemplate[] = [
  { id: "warm-gradient", label: "暖色漸層", css: "linear-gradient(135deg, #FF9500 0%, #FF5E3A 100%)" },
  { id: "ocean", label: "清新藍白", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { id: "blossom", label: "花卉粉彩", css: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { id: "minimal-dark", label: "極簡黑白", css: "linear-gradient(135deg, #1a1a1a 0%, #434343 100%)" },
  { id: "nature", label: "自然綠", css: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { id: "sunset", label: "日落橙", css: "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)" },
];

export function getCoverCSS(templateId: string | null | undefined, coverPhoto: string | null | undefined): string {
  if (coverPhoto) return `url(${coverPhoto}) center/cover`;
  const template = COVER_TEMPLATES.find((t) => t.id === templateId);
  return template?.css || COVER_TEMPLATES[0].css;
}
