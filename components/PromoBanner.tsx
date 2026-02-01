"use client";

import { useEffect, useState } from "react";

type PromoBarProps = {
  promoKey: string;
  message: string;
};

export default function PromoBanner({ promoKey, message }: PromoBarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissedKey = `promo-dismissed-${promoKey}`;
    const isDismissed = localStorage.getItem(dismissedKey);
    setOpen(!isDismissed);
  }, [promoKey]);

  const handleClose = () => {
    const dismissedKey = `promo-dismissed-${promoKey}`;
    localStorage.setItem(dismissedKey, "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-olive-600 px-4 py-2.5 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <p className="text-sm font-semibold text-center flex-1">{message}</p>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close promotion banner"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
