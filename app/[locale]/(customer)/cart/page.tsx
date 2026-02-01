"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItemQty, getCartTotal, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { Trash2, Plus, Minus } from "lucide-react";
import { useCurrency } from "@/lib/currency";

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { format } = useCurrency();

  useEffect(() => {
    params.then(({ locale: l }) => {
      setLocale(l as Locale);
      setMounted(true);
      setCart(getCart());
    });
  }, [params]);

  const handleRemove = (productId: string, size?: string, sizeSystem?: string) => {
    removeFromCart(productId, size, sizeSystem);
    setCart(getCart());
  };

  const handleUpdateQty = (productId: string, qty: number, size?: string, sizeSystem?: string) => {
    updateCartItemQty(productId, qty, size, sizeSystem);
    setCart(getCart());
  };

  const t = getDict(locale);

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Loading...</h1>
        </div>
      </div>
    );
  }
  const subtotal = getCartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t.cart.title}</h1>
          <div className="mt-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">{t.cart.empty}</p>
            <Link
              href={`/${locale}`}
              className="mt-4 inline-block rounded-2xl bg-olive-600 px-6 py-3 text-white font-semibold hover:bg-olive-700"
            >
              {t.cart.continueShopping}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t.cart.title}</h1>

        <div className="mt-6 space-y-4">
          {cart.map((item, index) => (
            <div key={`${item.productId}-${item.size || 'no-size'}-${index}`} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              {item.imageUrl && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  {item.size && item.sizeSystem && (
                    <p className="mt-0.5 text-zinc-500 text-xs dark:text-zinc-400">
                      {item.sizeSystem}: {item.size}
                    </p>
                  )}
                  <p className="mt-1 text-zinc-600 text-sm dark:text-zinc-400">{format(item.unitPrice)}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.qty - 1, item.size, item.sizeSystem)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center text-zinc-700 dark:text-zinc-200">{item.qty}</span>
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.qty + 1, item.size, item.sizeSystem)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item.productId, item.size, item.sizeSystem)}
                  className="text-zinc-500 hover:text-red-600 dark:text-zinc-400"
                  title={t.cart.remove}
                >
                  <Trash2 size={20} />
                </button>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{format(item.unitPrice * item.qty)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex justify-between text-lg">
            <span className="text-zinc-700 dark:text-zinc-300">{t.cart.subtotal}</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{format(subtotal)}</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/${locale}/checkout`}
            className="block w-full rounded-2xl bg-olive-600 py-4 text-center text-white font-semibold hover:bg-olive-700"
          >
            {t.cart.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}
