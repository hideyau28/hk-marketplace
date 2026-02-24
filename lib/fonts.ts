// Font utilities for storefront templates.
// next/font self-hosting: all template fonts are declared in app/layout.tsx with CSS variables.
// getFontVar() maps font family names to their CSS variable references.

import type { CoverTemplate } from "./cover-templates";

/** CSS variable names for each template font (declared in app/layout.tsx) */
const FONT_VARS: Record<string, string> = {
  "Bebas Neue": "var(--font-bebas-neue)",
  "Playfair Display": "var(--font-playfair)",
  Montserrat: "var(--font-montserrat)",
  "Cormorant Garamond": "var(--font-cormorant)",
  Inter: "var(--font-inter)",
  Lato: "var(--font-lato)",
};

/** Return the CSS font-family value for a template font name.
 *  Uses next/font CSS variable when available, falls back to quoted family name. */
export function getFontVar(fontName: string): string {
  return FONT_VARS[fontName] ?? `'${fontName}'`;
}

/** 生成 Google Fonts <link> href for a specific template */
export function getGoogleFontsUrl(tmpl: CoverTemplate): string {
  const families: string[] = [];

  // heading font
  const headingWeights = getWeights(tmpl.headingFont);
  families.push(
    `family=${encodeFont(tmpl.headingFont)}:wght@${headingWeights}`,
  );

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
