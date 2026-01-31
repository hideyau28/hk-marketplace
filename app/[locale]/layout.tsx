import { ReactNode } from "react";
import { ToastProvider } from "@/components/Toast";

export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
