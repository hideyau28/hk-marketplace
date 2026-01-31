import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";
import { SidebarProvider } from "@/components/admin/SidebarContext";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-zinc-50">
        <AdminSidebar />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
