"use client";

import Image from "next/image";
import type { BioCartItem } from "@/lib/biolink-cart";
import { formatPrice } from "@/lib/biolink-helpers";

type Props = {
  open: boolean;
  onClose: () => void;
  items: BioCartItem[];
  currency: string;
  languages?: string[];
  freeShippingThreshold: number | null;
  onUpdateQty: (
    productId: string,
    variant: string | undefined,
    delta: number,
  ) => void;
  onRemoveItem: (productId: string, variant: string | undefined) => void;
  onClearCart: () => void;
  onCheckout: () => void;
};

export default function StudioCartSheet({
  open,
  onClose,
  items,
  currency,
  languages,
  freeShippingThreshold,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
}: Props) {
  const isZh = (languages || ["zh-HK"]).includes("zh-HK");

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
      <button
        type="button"
        aria-label={isZh ? "關閉" : "Close"}
        onClick={onClose}
        className="absolute inset-0 bg-wlx-ink/40"
        style={{ animation: "studioBackdropFade 240ms var(--wlx-ease)" }}
      />

      {/* Sheet */}
      <div
        className="relative w-full max-w-[640px] max-h-[88vh] overflow-y-auto bg-wlx-paper text-wlx-ink"
        style={{ animation: "studioSheetSlide 320ms var(--wlx-ease)" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-wlx-mist bg-wlx-paper px-5 py-4 sm:px-8">
          <h2 className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
            {isZh ? `購物車 · ${cartCount} 件` : `Cart · ${cartCount}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={isZh ? "關閉購物車" : "Close cart"}
            className="text-[11px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
            style={{ transitionTimingFunction: "var(--wlx-ease)" }}
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-20 text-center sm:px-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-wlx-stone">
              {isZh ? "購物車仲係空" : "Your cart is empty"}
            </p>
          </div>
        ) : (
          <div className="px-5 pb-32 pt-2 sm:px-8 sm:pb-36">
            {/* Items — list with thin dividers, no card backgrounds */}
            <ul className="divide-y divide-wlx-mist">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.variant || "default"}`}
                  className="flex gap-4 py-5"
                >
                  {item.image ? (
                    <div className="relative size-20 sm:size-24 shrink-0 bg-wlx-cream overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-20 sm:size-24 shrink-0 bg-wlx-cream" />
                  )}

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-wlx-ink line-clamp-2">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-wlx-stone">
                            {item.variantLabel ||
                              item.variant.replace(/\|/g, " · ")}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 text-sm tabular-nums text-wlx-ink">
                        {formatPrice(item.price * item.qty, currency)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3">
                      {/* Qty stepper — minimal, no rounded buttons */}
                      <div className="inline-flex items-stretch border border-wlx-mist">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.productId, item.variant, -1)
                          }
                          aria-label={isZh ? "減少數量" : "Decrease"}
                          className="px-3 py-1.5 text-sm text-wlx-stone hover:text-wlx-ink hover:bg-wlx-cream transition-colors duration-200"
                          style={{ transitionTimingFunction: "var(--wlx-ease)" }}
                        >
                          −
                        </button>
                        <span className="px-3 py-1.5 text-sm tabular-nums text-wlx-ink min-w-[2.5rem] text-center border-x border-wlx-mist">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateQty(item.productId, item.variant, 1)
                          }
                          aria-label={isZh ? "增加數量" : "Increase"}
                          className="px-3 py-1.5 text-sm text-wlx-stone hover:text-wlx-ink hover:bg-wlx-cream transition-colors duration-200"
                          style={{ transitionTimingFunction: "var(--wlx-ease)" }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemoveItem(item.productId, item.variant)
                        }
                        aria-label={`${isZh ? "移除" : "Remove"} ${item.name}`}
                        className="text-[11px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
                        style={{ transitionTimingFunction: "var(--wlx-ease)" }}
                      >
                        {isZh ? "移除" : "Remove"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Free shipping copy — quiet, no emoji */}
            {freeShippingThreshold != null && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-wlx-stone">
                {freeShippingReached
                  ? isZh
                    ? "已達免運門檻"
                    : "Free shipping unlocked"
                  : freeShippingDiff != null && freeShippingDiff > 0
                    ? isZh
                      ? `仲差 ${formatPrice(freeShippingDiff, currency)} 免運費`
                      : `${formatPrice(freeShippingDiff, currency)} away from free shipping`
                    : null}
              </p>
            )}

            {/* Subtotal row */}
            <div className="mt-6 flex items-baseline justify-between border-t border-wlx-mist pt-5">
              <span className="text-[11px] uppercase tracking-[0.22em] text-wlx-stone">
                {isZh ? "小計" : "Subtotal"}
              </span>
              <span className="text-base tabular-nums text-wlx-ink">
                {formatPrice(cartTotal, currency)}
              </span>
            </div>

            {/* Sticky bottom — checkout + clear */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-wlx-mist bg-wlx-paper px-5 py-4 sm:px-8">
              <div className="mx-auto max-w-[640px] flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onCheckout}
                  className="w-full bg-wlx-ink py-4 text-[12px] uppercase tracking-[0.22em] text-wlx-paper hover:bg-wlx-ink/90 transition-colors duration-200"
                  style={{ transitionTimingFunction: "var(--wlx-ease)" }}
                >
                  {isZh ? "去結帳" : "Checkout"} · {formatPrice(cartTotal, currency)}
                </button>
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] uppercase tracking-[0.18em] text-wlx-stone hover:text-wlx-ink transition-colors duration-200"
                  style={{ transitionTimingFunction: "var(--wlx-ease)" }}
                >
                  {isZh ? "清空購物車" : "Clear cart"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes studioSheetSlide {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes studioBackdropFade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
