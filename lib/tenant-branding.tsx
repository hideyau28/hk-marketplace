"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TenantBranding = {
  name: string;
  slug: string;
  themeColor: string;
  logoUrl: string | null;
  currency: string;
  languages: string[];
};

const DEFAULT_BRANDING: TenantBranding = {
  name: "HK•Market",
  slug: "hk-marketplace",
  themeColor: "#6B7B3A",
  logoUrl: null,
  currency: "HKD",
  languages: ["zh-HK", "en"],
};

const TenantBrandingContext = createContext<TenantBranding>(DEFAULT_BRANDING);

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);

  useEffect(() => {
    fetch("/api/tenant/branding")
      .then((r) => r.json())
      .then((res) => {
        if (res?.ok && res.data) {
          setBranding({
            name: res.data.name || DEFAULT_BRANDING.name,
            slug: res.data.slug || DEFAULT_BRANDING.slug,
            themeColor: res.data.themeColor || DEFAULT_BRANDING.themeColor,
            logoUrl: res.data.logoUrl ?? null,
            currency: res.data.currency || DEFAULT_BRANDING.currency,
            languages: res.data.languages || DEFAULT_BRANDING.languages,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Apply theme color as CSS variable on <html>
  useEffect(() => {
    document.documentElement.style.setProperty("--tenant-primary", branding.themeColor);
  }, [branding.themeColor]);

  return (
    <TenantBrandingContext.Provider value={branding}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  return useContext(TenantBrandingContext);
}
