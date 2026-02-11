"use client";

import type { BioCartItem } from "@/lib/biolink-cart";
import { formatPrice } from "@/lib/biolink-helpers";

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
        className="relative w-full max-w-[480px] max-h-[80vh] bg-[#1a1a1a] rounded-t-3xl overflow-y-auto"
        style={{ animation: "slideUp 0.3s ease-out" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1a1a] px-5 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-base">
              購物車（{cartCount} 件）
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center text-sm hover:bg-white/20 transition"
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
                className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  {item.variant && (
                    <p className="text-white/50 text-xs">
                      {item.variantLabel || item.variant.replace(/\|/g, " · ")}
                    </p>
                  )}
                  <p className="text-white/70 text-xs mt-0.5">
                    {formatPrice(item.price, currency)}
                  </p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => onUpdateQty(item.productId, item.variant, -1)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-sm font-bold hover:bg-white/20 active:scale-95 transition"
                    >
                      −
                    </button>
                    <span className="text-white text-sm font-medium tabular-nums w-5 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.productId, item.variant, 1)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-sm font-bold hover:bg-white/20 active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-white text-sm font-bold">
                    {formatPrice(item.price * item.qty, currency)}
                  </p>
                  <button
                    onClick={() => onRemoveItem(item.productId, item.variant)}
                    className="w-6 h-6 rounded-full bg-white/10 text-white/40 flex items-center justify-center text-xs hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition"
                    title="移除"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subtotal */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-sm">小計</span>
              <span className="text-white text-lg font-bold">
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
                  <p className="text-sm text-white/50">
                    仲差 {formatPrice(freeShippingDiff, currency)} 就免運費
                  </p>
                )
              )}
            </div>
          )}

          {/* Checkout button */}
          <button
            onClick={onCheckout}
            className="mt-5 w-full py-4 rounded-2xl bg-[#FF9500] text-white font-bold text-base active:scale-[0.98] transition-transform"
          >
            去結帳　{formatPrice(cartTotal, currency)}
          </button>

          {/* Clear cart */}
          <button
            onClick={onClearCart}
            className="mt-3 w-full py-2.5 text-white/40 text-sm font-medium hover:text-white/60 transition-colors"
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
