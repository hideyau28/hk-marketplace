"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItemQty, getCartTotal, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

type RecommendedProduct = {
  id: string;
  title: string;
  brand?: string;
  price: number;
  imageUrl?: string;
};

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const router = useRouter();

  useEffect(() => {
    params.then(({ locale: l }) => {
      setLocale(l as Locale);
      setMounted(true);
      setCart(getCart());
    });
  }, [params]);

  // Fetch recommendations when cart is empty
  useEffect(() => {
    if (mounted && cart.length === 0) {
      fetch("/api/products?limit=12")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.products) {
            // Shuffle and pick 6 random products
            const shuffled = [...data.data.products].sort(() => Math.random() - 0.5);
            setRecommendations(shuffled.slice(0, 6));
          }
        })
        .catch(() => {});
    }
  }, [mounted, cart.length]);

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    updateCartItemQty(productId, qty);
    setCart(getCart());
  };

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">Loading...</h1>
        </div>
      </div>
    );
  }

  const t = getDict(locale);
  const subtotal = getCartTotal(cart);

  if (cart.length === 0) {
    return (
      <div className="px-4 py-6 pb-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold">{t.cart.title}</h1>

          {/* Empty state */}
          <div className="mt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <ShoppingBag className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="text-zinc-600">{t.cart.empty}</p>
          </div>

          {/* Recommendations section */}
          {recommendations.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">你可能鍾意</h2>
              <div className="overflow-x-auto -mx-4 px-4 pb-2">
                <div className="flex gap-3" style={{ minWidth: "max-content" }}>
                  {recommendations.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.id}`}
                      className="flex-shrink-0 w-36 group"
                    >
                      <div className="aspect-square rounded-xl bg-zinc-100 overflow-hidden mb-2">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-zinc-400">
                            <ShoppingBag size={24} />
                          </div>
                        )}
                      </div>
                      {product.brand && (
                        <p className="text-xs text-zinc-500 truncate">{product.brand}</p>
                      )}
                      <p className="text-sm font-medium text-zinc-900 line-clamp-2 leading-snug">
                        {product.title}
                      </p>
                      <p className="text-sm font-bold text-zinc-900 mt-1">
                        ${product.price.toLocaleString()}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Continue shopping button */}
          <div className="mt-8 text-center">
            <Link
              href={`/${locale}`}
              className="inline-block rounded-2xl bg-black px-8 py-3.5 text-white font-semibold hover:bg-zinc-900 transition-colors"
            >
              繼續購物
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">{t.cart.title}</h1>

        <div className="mt-6 space-y-4">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
              {item.imageUrl && (
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-zinc-600 text-sm">HK$ {item.unitPrice}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.qty - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{item.qty}</span>
                  <button
                    onClick={() => handleUpdateQty(item.productId, item.qty + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => handleRemove(item.productId)}
                  className="text-zinc-500 hover:text-red-600"
                  title={t.cart.remove}
                >
                  <Trash2 size={20} />
                </button>
                <p className="font-semibold">HK$ {(item.unitPrice * item.qty).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="flex justify-between text-lg">
            <span>{t.cart.subtotal}</span>
            <span className="font-semibold">HK$ {subtotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/${locale}/checkout`}
            className="block w-full rounded-2xl bg-black py-4 text-center text-white font-semibold hover:bg-zinc-900"
          >
            {t.cart.checkout}
          </Link>
        </div>
      </div>
    </div>
  );
}
