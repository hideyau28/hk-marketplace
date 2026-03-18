"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-24 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-white shadow-lg backdrop-blur hover:bg-zinc-700 transition-all animate-fade-in"
    >
      <ChevronUp size={20} />
    </button>
  );
}
