import { ReactNode } from "react";

export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {children}
    </div>
  );
}
