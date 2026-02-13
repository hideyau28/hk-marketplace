// Google Fonts URL 生成 — 根據 template 嘅 heading + body font
// 預載所有 template 用到嘅字體，避免切換時閃爍

import type { CoverTemplate } from "./cover-templates";

/** 生成 Google Fonts <link> href for a specific template */
export function getGoogleFontsUrl(tmpl: CoverTemplate): string {
  const families: string[] = [];

  // heading font
  const headingWeights = getWeights(tmpl.headingFont);
  families.push(`family=${encodeFont(tmpl.headingFont)}:wght@${headingWeights}`);

  // body font（如果同 heading 唔同）
  if (tmpl.bodyFont !== tmpl.headingFont) {
    const bodyWeights = getWeights(tmpl.bodyFont);
    families.push(`family=${encodeFont(tmpl.bodyFont)}:wght@${bodyWeights}`);
  }

  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}

function encodeFont(name: string): string {
  return name.replace(/ /g, "+");
}

// 每個字體需要嘅 weight
function getWeights(fontName: string): string {
  switch (fontName) {
    case "Bebas Neue":
      return "400";
    case "Playfair Display":
      return "400;700";
    case "Montserrat":
      return "400;600;700";
    case "Cormorant Garamond":
      return "400;600";
    case "Inter":
      return "400;500;600;700";
    case "Lato":
      return "400;700";
    default:
      return "400;700";
  }
}
