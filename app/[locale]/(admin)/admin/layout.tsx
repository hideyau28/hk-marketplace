import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";
import { SidebarProvider } from "@/components/admin/SidebarContext";
import { prisma } from "@/lib/prisma";
import { getServerTenantId } from "@/lib/tenant";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const tenantId = await getServerTenantId();
  const productCount = await prisma.product.count({ where: { tenantId } });

  return (
    <SidebarProvider productCount={productCount}>
      <div className="min-h-screen bg-zinc-50">
        <AdminSidebar />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
