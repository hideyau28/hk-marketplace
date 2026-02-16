"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCart, removeFromCart, updateCartItemQty, getCartTotal, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { Trash2, Plus, Minus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCurrency } from "@/lib/currency";

type RecommendedProduct = {
  id: string;
  title: string;
  price: number;
  imageUrl: string | null;
  brand: string | null;
};

export default function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);
  const [hotProducts, setHotProducts] = useState<RecommendedProduct[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { format } = useCurrency();

  useEffect(() => {
    params.then(({ locale: l }) => {
      setLocale(l as Locale);
      setMounted(true);
      setCart(getCart());
    });
  }, [params]);

  // Fetch recommended products when cart is empty
  useEffect(() => {
    if (mounted && cart.length === 0) {
      fetch("/api/products?limit=12")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.products) {
            // Shuffle and pick 6 random products
            const shuffled = data.data.products.sort(() => Math.random() - 0.5);
            setRecommendedProducts(shuffled.slice(0, 6));
          }
        })
        .catch(() => {});
    }
  }, [mounted, cart.length]);

  // Fetch hot products for cart page
  useEffect(() => {
    if (mounted && cart.length > 0) {
      fetch("/api/products?limit=8&sort=stock")
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && data.data?.products) {
            setHotProducts(data.data.products.slice(0, 8));
          }
        })
        .catch(() => {});
    }
  }, [mounted, cart.length]);

  const scrollRecommendations = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

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
      <div className="px-4 py-6 pb-32">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t.cart.title}</h1>
          <div className="mt-8 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">{t.cart.empty}</p>
            <Link
              href={`/${locale}`}
              className="mt-4 inline-block rounded-2xl px-6 py-3 text-white font-semibold hover:brightness-90"
              style={{ backgroundColor: "var(--tmpl-accent, #2D6A4F)" }}
            >
              繼續購物
            </Link>
          </div>

          {/* Recommended Products Section */}
          {recommendedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">你可能鍾意</h2>
              <div className="relative">
                {/* Scroll buttons - hidden on mobile */}
                <button
                  onClick={() => scrollRecommendations("left")}
                  className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>
                <button
                  onClick={() => scrollRecommendations("right")}
                  className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white shadow-md border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </button>

                {/* Scrollable container */}
                <div
                  ref={scrollContainerRef}
                  className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4"
                  style={{ scrollSnapType: "x mandatory" }}
                >
                  {recommendedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.id}`}
                      className="flex-shrink-0 w-36 rounded-xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.title}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="144px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <span className="text-xs">No image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        {product.brand && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">{product.brand}</p>
                        )}
                        <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
                          {product.title}
                        </h3>
                        <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {format(product.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="80px" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                  {item.size && item.sizeSystem && (
                    <p className="mt-0.5 text-zinc-500 text-xs dark:text-zinc-400">
                      {item.sizeSystem === "US" && item.size.startsWith("US")
                        ? item.size
                        : `${item.sizeSystem}: ${item.size}`}
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
            className="block w-full rounded-2xl py-4 text-center text-white font-semibold hover:brightness-90"
            style={{ backgroundColor: "var(--tmpl-accent, #2D6A4F)" }}
          >
            {t.cart.checkout}
          </Link>
        </div>

        {hotProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              {locale === "en" ? "Hot Products" : "熱賣產品"}
            </h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4">
              {hotProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/${locale}/product/${product.id}`}
                  className="min-w-[160px] flex-shrink-0 snap-start rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        loading="lazy"
                        className="object-cover"
                        sizes="160px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    {product.brand && (
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight">
                      {product.title}
                    </h3>
                    <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {format(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
