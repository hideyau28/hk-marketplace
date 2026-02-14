"use client";

import Image from "next/image";
import type { BioCartItem } from "@/lib/biolink-cart";
import { formatPrice } from "@/lib/biolink-helpers";
import { useTemplate } from "@/lib/template-context";

type Props = {
  open: boolean;
  onClose: () => void;
  items: BioCartItem[];
  currency: string;
  freeShippingThreshold: number | null;
  onUpdateQty: (productId: string, variant: string | undefined, delta: number) => void;
  onRemoveItem: (productId: string, variant: string | undefined) => void;
  onClearCart: () => void;
  onCheckout: () => void;
};

export default function CartSheet({
  open,
  onClose,
  items,
  currency,
  freeShippingThreshold,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: Props) {
  const tmpl = useTemplate();

  if (!open) return null;

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  const freeShippingReached =
    freeShippingThreshold != null && cartTotal >= freeShippingThreshold;
  const freeShippingDiff =
    freeShippingThreshold != null ? freeShippingThreshold - cartTotal : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[480px] max-h-[80vh] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: tmpl.bg, animation: "slideUp 0.3s ease-out" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: tmpl.subtext + "40" }} />
        </div>

        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 pb-3 border-b"
          style={{ backgroundColor: tmpl.bg, borderColor: tmpl.subtext + "20" }}
        >
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-base" style={{ color: tmpl.text }}>
              購物車（{cartCount} 件）
            </h2>
            <button
              onClick={onClose}
              aria-label="關閉購物車"
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm hover:opacity-80 transition"
              style={{ backgroundColor: tmpl.subtext + "20", color: tmpl.subtext }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="px-5 pb-8">
          {/* Cart items */}
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variant || "default"}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ backgroundColor: tmpl.card }}
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: tmpl.text }}>{item.name}</p>
                  {item.variant && (
                    <p className="text-xs" style={{ color: tmpl.subtext }}>
                      {item.variantLabel || item.variant.replace(/\|/g, " · ")}
                    </p>
                  )}
                  <p className="text-xs mt-0.5" style={{ color: tmpl.subtext }}>
                    {formatPrice(item.price, currency)}
                  </p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => onUpdateQty(item.productId, item.variant, -1)}
                      aria-label="減少數量"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold hover:opacity-80 active:scale-95 transition"
                      style={{ backgroundColor: tmpl.subtext + "20", color: tmpl.subtext }}
                    >
                      −
                    </button>
                    <span className="text-sm font-medium tabular-nums w-5 text-center" style={{ color: tmpl.text }}>
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.productId, item.variant, 1)}
                      aria-label="增加數量"
                      className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold hover:opacity-80 active:scale-95 transition"
                      style={{ backgroundColor: tmpl.subtext + "20", color: tmpl.subtext }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-sm font-bold" style={{ color: tmpl.text }}>
                    {formatPrice(item.price * item.qty, currency)}
                  </p>
                  <button
                    onClick={() => onRemoveItem(item.productId, item.variant)}
                    aria-label={`移除 ${item.name}`}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition"
                    style={{ backgroundColor: tmpl.subtext + "20", color: tmpl.subtext }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: tmpl.subtext + "20" }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: tmpl.subtext }}>小計</span>
              <span className="text-lg font-bold" style={{ color: tmpl.text }}>
                {formatPrice(cartTotal, currency)}
              </span>
            </div>
          </div>

          {/* Free shipping message */}
          {freeShippingThreshold != null && (
            <div className="mt-3">
              {freeShippingReached ? (
                <p className="text-sm text-green-400 font-medium">
                  🎉 滿 {formatPrice(freeShippingThreshold, currency)} 免運費！
                </p>
              ) : (
                freeShippingDiff != null &&
                freeShippingDiff > 0 && (
                  <p className="text-sm" style={{ color: tmpl.subtext }}>
                    仲差 {formatPrice(freeShippingDiff, currency)} 就免運費
                  </p>
                )
              )}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={onCheckout}
            className="mt-5 w-full py-4 rounded-2xl font-bold text-base active:scale-[0.98] transition-transform"
            style={{ backgroundColor: tmpl.accent, color: tmpl.text }}
          >
            去結帳　{formatPrice(cartTotal, currency)}
          </button>

          {/* Clear cart */}
          <button
            onClick={onClearCart}
            className="mt-3 w-full py-2.5 text-sm font-medium hover:opacity-70 transition-colors"
            style={{ color: tmpl.subtext }}
          >
            🗑️ 清空購物車
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
