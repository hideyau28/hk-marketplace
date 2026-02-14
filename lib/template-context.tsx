"use client";

import { createContext, useContext } from "react";
import { COVER_TEMPLATES, type CoverTemplate } from "./cover-templates";

// Default: mochi (index 2)
const TemplateContext = createContext<CoverTemplate>(COVER_TEMPLATES[2]);

export const TemplateProvider = TemplateContext.Provider;

export function useTemplate(): CoverTemplate {
  return useContext(TemplateContext);
}
