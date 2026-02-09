import { ReactNode } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import AdminSidebar from "./admin-sidebar";
import { SidebarProvider } from "@/components/admin/SidebarContext";
import BioLinkAdminShellWrapper from "@/components/admin/BioLinkAdminShellWrapper";

async function getTenantMode(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("tenant-admin-token");
    if (tokenCookie?.value) {
      const payload = verifyToken(tokenCookie.value);
      if (payload?.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: payload.tenantId },
          select: { mode: true },
        });
        return tenant?.mode || "biolink";
      }
    }
  } catch {
    // fallback
  }
  return "biolink";
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const mode = await getTenantMode();

  if (mode === "biolink") {
    return <BioLinkAdminShellWrapper>{children}</BioLinkAdminShellWrapper>;
  }

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
