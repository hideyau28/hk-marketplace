"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import {
  getCart,
  removeFromCart,
  updateCartItemQty,
  getCartTotal,
  getCartItemCount,
  type CartItem,
} from "@/lib/cart";
import { useCurrency } from "@/lib/currency";
import type { Locale } from "@/lib/i18n";

export default function CartDrawer({
  locale,
  isOpen,
  onClose,
}: {
  locale: Locale;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [cart, setCartState] = useState<CartItem[]>([]);
  const { format } = useCurrency();

  const refreshCart = useCallback(() => {
    setCartState(getCart());
  }, []);

  useEffect(() => {
    if (isOpen) refreshCart();
  }, [isOpen, refreshCart]);

  // Listen for cart updates
  useEffect(() => {
    window.addEventListener("cartUpdated", refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      window.removeEventListener("cartUpdated", refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, [refreshCart]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleRemove = (item: CartItem) => {
    removeFromCart(item.productId, item.size, item.sizeSystem, item.variantId);
    refreshCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleQty = (item: CartItem, delta: number) => {
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      handleRemove(item);
      return;
    }
    updateCartItemQty(item.productId, newQty, item.size, item.sizeSystem, item.variantId);
    refreshCart();
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const isZh = locale.startsWith("zh");
  const subtotal = getCartTotal(cart);
  const itemCount = getCartItemCount(cart);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-950 shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {isZh ? "購物車" : "Cart"}
            {itemCount > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                ({itemCount})
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {cart.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-[calc(100%-56px)] px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <ShoppingBag size={28} className="text-zinc-400" />
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              {isZh ? "購物車空空如也" : "Your cart is empty"}
            </p>
            <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">
              {isZh ? "去逛逛，搵啲心水好物！" : "Browse products and add something you like!"}
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white hover:brightness-90 transition"
              style={{ backgroundColor: "var(--tmpl-accent, #2D6A4F)" }}
            >
              {isZh ? "繼續購物" : "Continue Shopping"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-56px)]">
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size || "no-size"}-${item.variantId || index}`}
                  className="flex gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3"
                >
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex flex-1 flex-col min-w-0">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {item.title}
                    </h3>
                    {item.size && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {item.sizeSystem ? `${item.sizeSystem}: ${item.size}` : item.size}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                      {format(item.unitPrice)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQty(item, -1)}
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm text-zinc-700 dark:text-zinc-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleQty(item, 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Remove + line total */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemove(item)}
                      className="h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-red-500 transition"
                      aria-label={isZh ? "移除" : "Remove"}
                    >
                      <Trash2 size={16} />
                    </button>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {format(item.unitPrice * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">
                  {isZh ? "小計" : "Subtotal"}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {format(subtotal)}
                </span>
              </div>
              <Link
                href={`/${locale}/checkout`}
                onClick={onClose}
                className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-white hover:brightness-90 transition"
                style={{ backgroundColor: "var(--tmpl-accent, #2D6A4F)" }}
              >
                {isZh ? "去結帳" : "Checkout"}
              </Link>
              <Link
                href={`/${locale}/cart`}
                onClick={onClose}
                className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
              >
                {isZh ? "查看完整購物車" : "View full cart"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
