"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors shadow-sm"
      aria-label="Toggle sidebar"
    >
      <Menu size={20} />
    </button>
  );
}
