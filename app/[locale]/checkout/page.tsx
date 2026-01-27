"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";

type FulfillmentType = "pickup" | "delivery";

const DELIVERY_FEE = 30; // HK$30 delivery fee

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup");
  const [addressLine1, setAddressLine1] = useState("");
  const [district, setDistrict] = useState("");
  const [notes, setNotes] = useState("");
  const [orderNote, setOrderNote] = useState("");

  useEffect(() => {
    params.then(({ locale: l }) => {
      setLocale(l as Locale);
      setMounted(true);
      const cartItems = getCart();
      if (cartItems.length === 0) {
        router.push(`/${l}/cart`);
      } else {
        setCart(cartItems);
      }
    });
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    setProcessing(true);

    try {
      const subtotal = getCartTotal(cart);
      const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
      const total = subtotal + deliveryFee;

      const payload = {
        customerName,
        phone,
        email: email || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.title,
          unitPrice: item.unitPrice,
          quantity: item.qty,
        })),
        amounts: {
          subtotal,
          deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
          total,
          currency: "HKD",
        },
        fulfillment: {
          type: fulfillmentType,
          address:
            fulfillmentType === "delivery"
              ? {
                  line1: addressLine1,
                  district: district || undefined,
                  notes: notes || undefined,
                }
              : undefined,
        },
        note: orderNote || undefined,
      };

      // Generate idempotency key
      const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        const orderId = result.data.id as string;

        // Create Stripe Checkout session
        const res2 = await fetch("/api/checkout/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, locale }),
        });
        const json2 = await res2.json();

        if (json2.ok && json2.data?.url) {
          clearCart();
          window.location.href = json2.data.url;
          return;
        }

        // Fallback to order page
        clearCart();
        router.push(`/${locale}/orders/${orderId}`);
      } else {
        alert(`Error: ${result.error?.code || "ERROR"}: ${result.error?.message || "Unknown error"}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert("Failed to create order. Please try again.");
      setProcessing(false);
    }
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
  const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">{t.checkout.title}</h1>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: Form */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold">{t.checkout.customerInfo}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm">{t.checkout.customerName}</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm">{t.checkout.phone}</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm">{t.checkout.email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Fulfillment */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-lg font-semibold">{t.checkout.fulfillment}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-white/80 text-sm">{t.checkout.fulfillmentType}</label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType("pickup")}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${
                          fulfillmentType === "pickup"
                            ? "border-white bg-white text-black"
                            : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {t.checkout.pickup}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentType("delivery")}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${
                          fulfillmentType === "delivery"
                            ? "border-white bg-white text-black"
                            : "border-white/15 bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {t.checkout.delivery}
                      </button>
                    </div>
                  </div>

                  {fulfillmentType === "delivery" && (
                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <h3 className="font-semibold text-sm">{t.checkout.deliveryAddress}</h3>
                      <div>
                        <label className="block text-white/80 text-sm">{t.checkout.addressLine1}</label>
                        <input
                          type="text"
                          required
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm">{t.checkout.district}</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm">{t.checkout.notes}</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-white/80 text-sm">{t.checkout.orderNote}</label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Order Summary */}
            <div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold">{t.checkout.orderSummary}</h2>
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-white/80">
                        {item.title} × {item.qty}
                      </span>
                      <span>HK$ {(item.unitPrice * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-white/80">{t.cart.subtotal}</span>
                    <span>HK$ {subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/80">{t.cart.deliveryFee}</span>
                      <span>HK$ {deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-semibold">
                    <span>{t.cart.total}</span>
                    <span>HK$ {total.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={processing}
                  className="mt-6 w-full rounded-2xl bg-white py-4 text-black font-semibold hover:bg-white/90 disabled:opacity-50"
                >
                  {processing ? t.checkout.processing : t.checkout.placeOrder}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
