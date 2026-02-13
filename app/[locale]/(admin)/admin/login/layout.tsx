import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | WoWlix",
  description: "Log in to your WoWlix store admin panel",
};

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">{children}</div>;
}
