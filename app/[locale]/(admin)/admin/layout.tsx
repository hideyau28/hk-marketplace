import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";
import { SidebarProvider } from "@/components/admin/SidebarContext";
import { getAdminTenant } from "@/lib/admin/get-admin-tenant";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const tenant = await getAdminTenant();

  return (
    <SidebarProvider tenantName={tenant?.name ?? null}>
      <div className="min-h-screen bg-zinc-50">
        <AdminSidebar />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
