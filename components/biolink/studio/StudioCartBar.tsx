"use client";

import { formatPrice } from "@/lib/biolink-helpers";

type Props = {
  count: number;
  total: number;
  currency?: string;
  whatsapp: string | null;
  onCheckout?: () => void;
};

export default function StudioCartBar({
  count,
  total,
  currency = "HKD",
  whatsapp,
  onCheckout,
}: Props) {
  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }
    if (!whatsapp) return;
    const phone = whatsapp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      `Hi! 我想落單，購物車有 ${count} 件商品，總計 ${formatPrice(total, currency)}`,
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-wlx-mist bg-wlx-paper/95 backdrop-blur-sm"
      style={{ animation: "studioCartBarIn 300ms var(--wlx-ease)" }}
    >
      <div className="mx-auto flex max-w-[640px] items-center justify-between gap-4 px-5 py-3 sm:px-8 sm:py-4">
        <div className="flex items-baseline gap-3 text-wlx-ink">
          <span className="text-[11px] uppercase tracking-[0.18em] text-wlx-stone">
            {count === 1 ? "1 item" : `${count} items`}
          </span>
          <span className="text-sm tabular-nums">
            {formatPrice(total, currency)}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          className="px-5 py-2.5 sm:px-7 sm:py-3 text-[12px] sm:text-[13px] uppercase tracking-[0.18em] bg-wlx-ink text-wlx-paper hover:bg-wlx-ink/90 transition-colors duration-200"
          style={{ transitionTimingFunction: "var(--wlx-ease)" }}
        >
          Checkout
        </button>
      </div>

      <style jsx>{`
        @keyframes studioCartBarIn {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
