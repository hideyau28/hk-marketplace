"use client";

import { ReactNode } from "react";
import BioLinkAdminShell from "./BioLinkAdminShell";

export default function BioLinkAdminShellWrapper({ children }: { children: ReactNode }) {
  return <BioLinkAdminShell>{children}</BioLinkAdminShell>;
}
