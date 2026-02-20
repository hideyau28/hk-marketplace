"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type TenantBranding = {
  name: string;
  slug: string;
  themeColor: string;
  logoUrl: string | null;
  currency: string;
  languages: string[];
  mode: string;
};

type TenantBrandingContextValue = {
  branding: TenantBranding;
  loading: boolean;
};

const DEFAULT_BRANDING: TenantBranding = {
  name: "May's Shop",
  slug: "maysshop",
  themeColor: "#FF9500",
  logoUrl: null,
  currency: "HKD",
  languages: ["zh-HK", "en"],
  mode: "biolink",
};

const TenantBrandingContext = createContext<TenantBrandingContextValue>({
  branding: DEFAULT_BRANDING,
  loading: true,
});

export function TenantBrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

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
            mode: res.data.mode || DEFAULT_BRANDING.mode,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Apply theme color as CSS variable on <html>
  useEffect(() => {
    document.documentElement.style.setProperty("--tenant-primary", branding.themeColor);
  }, [branding.themeColor]);

  return (
    <TenantBrandingContext.Provider value={{ branding, loading }}>
      {children}
    </TenantBrandingContext.Provider>
  );
}

export function useTenantBranding() {
  return useContext(TenantBrandingContext);
}
