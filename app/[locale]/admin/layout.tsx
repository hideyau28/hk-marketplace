import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
