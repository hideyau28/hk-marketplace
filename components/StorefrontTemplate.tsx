"use client";

import { useMemo, useEffect, type ReactNode } from "react";
import { getCoverTemplate } from "@/lib/cover-templates";
import { getGoogleFontsUrl } from "@/lib/fonts";
import { TemplateProvider } from "@/lib/template-context";

type Props = {
  templateId: string;
  children: ReactNode;
};

/**
 * Storefront template wrapper — sets template CSS variables + Google Fonts
 * for customer-facing pages. Mirrors what BioLinkPage does for biolink routes.
 */
export default function StorefrontTemplate({ templateId, children }: Props) {
  const tmpl = useMemo(() => getCoverTemplate(templateId), [templateId]);
  const fontsUrl = useMemo(() => getGoogleFontsUrl(tmpl), [tmpl]);

  // Set CSS variables for template design tokens
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--tmpl-accent", tmpl.accent);
    root.style.setProperty("--tmpl-heading-font", `'${tmpl.headingFont}', sans-serif`);
    root.style.setProperty("--tmpl-body-font", `'${tmpl.bodyFont}', sans-serif`);
  }, [tmpl]);

  return (
    <TemplateProvider value={tmpl}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsUrl} />
      {children}
    </TemplateProvider>
  );
}
