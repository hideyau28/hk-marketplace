import { ReactNode } from "react";
import AdminSidebar from "./admin-sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-zinc-50 flex">
          <AdminSidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
