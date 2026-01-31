"use client";

import { useState } from "react";

export default function PromoBanner() {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <div className="mt-4 rounded-2xl bg-olive-600 px-4 py-3 text-white">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold">🎉 Free Shipping on orders over HK$500!</p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close promotion banner"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
