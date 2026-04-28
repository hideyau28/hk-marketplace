"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
  const sidebar = useSidebar();

  // Don't render if not in a SidebarProvider context (e.g., biolink mode)
  if (!sidebar) {
    return null;
  }

  return (
    <button
      onClick={sidebar.toggle}
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-wlx-mist text-wlx-stone hover:bg-wlx-cream hover:text-wlx-ink transition-colors shadow-sm"
      aria-label="Toggle sidebar"
    >
      <Menu size={20} />
    </button>
  );
}
