import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <AdminSidebar />
      <main className="min-h-screen">
        {children}
      </main>
    </div>
  );
}
