"use client";

import { useState, useEffect } from "react";
import { useTemplate } from "@/lib/template-context";

export default function ScrollToTopFAB() {
  const tmpl = useTemplate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="返回頂部"
      className="fixed bottom-20 left-4 z-40 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-opacity hover:opacity-80 active:opacity-60"
      style={{ backgroundColor: tmpl.accent }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
}
