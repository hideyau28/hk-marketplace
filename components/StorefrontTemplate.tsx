"use client";

import { useMemo, useEffect, type ReactNode } from "react";
import { getCoverTemplate } from "@/lib/cover-templates";
import { getFontVar } from "@/lib/fonts";
import { TemplateProvider } from "@/lib/template-context";

type Props = {
  templateId: string;
  children: ReactNode;
};

/**
 * Storefront template wrapper — sets template CSS variables.
 * Fonts are self-hosted via next/font (declared in app/layout.tsx).
 */
export default function StorefrontTemplate({ templateId, children }: Props) {
  const tmpl = useMemo(() => getCoverTemplate(templateId), [templateId]);

  // Set CSS variables for template design tokens
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tmpl-accent", tmpl.accent);
    root.style.setProperty(
      "--tmpl-heading-font",
      `${getFontVar(tmpl.headingFont)}, sans-serif`,
    );
    root.style.setProperty(
      "--tmpl-body-font",
      `${getFontVar(tmpl.bodyFont)}, sans-serif`,
    );
  }, [tmpl]);

  return <TemplateProvider value={tmpl}>{children}</TemplateProvider>;
}
