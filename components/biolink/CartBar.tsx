"use client";

import { formatPrice } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";

type Props = {
  count: number;
  total: number;
  currency?: string;
  whatsapp: string | null;
  onCheckout?: () => void;
};

export default function CartBar({ count, total, currency = "HKD", whatsapp, onCheckout }: Props) {
  const tmpl = useTemplate();

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
      return;
    }
    if (!whatsapp) return;
    const phone = whatsapp.replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(`Hi! 我想落單，購物車有 ${count} 件商品，總計 ${formatPrice(total, currency)}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-[480px] mx-auto">
        <div
          className="mx-3 mb-3 flex items-center justify-between px-4 py-3 rounded-2xl border shadow-2xl shadow-black/50"
          style={{ backgroundColor: tmpl.card, borderColor: tmpl.subtext + "20" }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <svg className="w-5 h-5" style={{ color: tmpl.text }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                style={{ backgroundColor: tmpl.accent, color: tmpl.text }}
              >
                {count > 9 ? "9+" : count}
              </span>
            </div>
            <span className="font-bold text-sm" style={{ color: tmpl.text }}>{formatPrice(total, currency)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="px-5 py-2 rounded-xl text-sm font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: tmpl.accent, color: tmpl.text }}
          >
            結帳
          </button>
        </div>
      </div>
    </div>
  );
}
