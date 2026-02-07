import { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";
import { TenantBrandingProvider } from "@/lib/tenant-branding";

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <TenantBrandingProvider>
      <ToastProvider>{children}</ToastProvider>
    </TenantBrandingProvider>
  );
}
