"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  tenantName: string | null;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children, tenantName = null }: { children: ReactNode; tenantName?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggle, tenantName }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
