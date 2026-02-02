"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useCurrency } from "@/lib/currency";

type FulfillmentType = "pickup" | "delivery";

const DELIVERY_FEE = 30; // HK$30 delivery fee

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Validation state
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("pickup");
  const [addressLine1, setAddressLine1] = useState("");
  const [district, setDistrict] = useState("");
  const [notes, setNotes] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const { format } = useCurrency();

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

  // Validation functions
  const validateName = (value: string): string | null => {
    if (value.trim().length < 2) {
      return "請輸入姓名（至少2個字）";
    }
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length !== 8) {
      return "請輸入有效嘅8位電話號碼";
    }
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return null; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return "請輸入有效嘅電郵地址";
    }
    return null;
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    setNameError(validateName(customerName));
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    setPhoneError(validatePhone(phone));
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const nameValid = validateName(customerName) === null;
    const phoneValid = validatePhone(phone) === null;
    const emailValid = validateEmail(email) === null;
    const addressValid = fulfillmentType === "pickup" || addressLine1.trim().length > 0;
    return nameValid && phoneValid && emailValid && addressValid;
  };

  const applyCoupon = async (code?: string) => {
    const finalCode = (code ?? couponCode).trim();
    if (!finalCode) {
      setCouponError(t.checkout.enterCoupon);
      return;
    }

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      const subtotal = getCartTotal(cart);
      const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: finalCode, subtotal, deliveryFee }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setCouponError(json?.error?.message || t.checkout.invalidCoupon);
        setDiscount(0);
        setCouponApplied(false);
      } else {
        setDiscount(json.data.discount || 0);
        setCouponApplied(true);
      }
    } catch {
      setCouponError(t.checkout.validateFailed);
      setDiscount(0);
      setCouponApplied(false);
    } finally {
      setApplyingCoupon(false);
    }
  };

  useEffect(() => {
    if (!couponApplied) return;
    void applyCoupon();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fulfillmentType, cart]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    setProcessing(true);

    try {
      const subtotal = getCartTotal(cart);
      const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
      const total = Math.max(0, subtotal + deliveryFee - discount);

      const payload = {
        customerName,
        phone,
        email: email || undefined,
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.title,
          unitPrice: item.unitPrice,
          quantity: item.qty,
          size: item.size,
          sizeSystem: item.sizeSystem,
          imageUrl: item.imageUrl,
        })),
        amounts: {
          subtotal,
          discount: discount > 0 ? discount : undefined,
          deliveryFee: deliveryFee > 0 ? deliveryFee : undefined,
          total,
          currency: "HKD",
          couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
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
        showToast(t.checkout.orderPlaced);

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
        alert(`${t.common.error}: ${result.error?.code || "ERROR"}: ${result.error?.message || t.common.unknownError}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(t.checkout.orderFailed);
      setProcessing(false);
    }
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
  const deliveryFee = fulfillmentType === "delivery" ? DELIVERY_FEE : 0;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.title}</h1>

        <form onSubmit={handleSubmit} className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left column: Form */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.customerInfo}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.customerName} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (nameTouched) setNameError(validateName(e.target.value));
                      }}
                      onBlur={handleNameBlur}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                        nameTouched && nameError
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                    {nameTouched && nameError && (
                      <p className="mt-1 text-xs text-red-500">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.phone} <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneTouched) setPhoneError(validatePhone(e.target.value));
                      }}
                      onBlur={handlePhoneBlur}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                        phoneTouched && phoneError
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                    {phoneTouched && phoneError && (
                      <p className="mt-1 text-xs text-red-500">{phoneError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.email}</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailTouched) setEmailError(validateEmail(e.target.value));
                      }}
                      onBlur={handleEmailBlur}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 ${
                        emailTouched && emailError
                          ? "border-red-500 focus:border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                    {emailTouched && emailError && (
                      <p className="mt-1 text-xs text-red-500">{emailError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Fulfillment */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.fulfillment}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.fulfillmentType}</label>
                    <div className="mt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType("pickup")}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${
                          fulfillmentType === "pickup"
                            ? "border-olive-600 bg-olive-600 text-white"
                            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {t.checkout.pickup}
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentType("delivery")}
                        className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${
                          fulfillmentType === "delivery"
                            ? "border-olive-600 bg-olive-600 text-white"
                            : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {t.checkout.delivery}
                      </button>
                    </div>
                  </div>

                  {fulfillmentType === "delivery" && (
                    <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{t.checkout.deliveryAddress}</h3>
                      <div>
                        <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.addressLine1}</label>
                        <input
                          type="text"
                          required
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.district}</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.notes}</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.orderNote}</label>
                    <textarea
                      value={orderNote}
                      onChange={(e) => setOrderNote(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Order Summary */}
            <div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold text-zinc-900">{t.checkout.orderSummary}</h2>
                <div className="mt-4 space-y-3">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-zinc-600">
                        {item.title} × {item.qty}
                      </span>
                      <span className="text-zinc-900">{format(item.unitPrice * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-zinc-200 pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={t.checkout.couponCode}
                      className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() => applyCoupon()}
                      disabled={applyingCoupon}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                    >
                      {applyingCoupon ? t.checkout.applying : t.checkout.apply}
                    </button>
                  </div>
                  {couponError && (
                    <div className="mt-2 text-xs text-red-600">{couponError}</div>
                  )}
                  {couponApplied && discount > 0 && (
                    <div className="mt-2 text-xs text-olive-700">Coupon applied</div>
                  )}
                </div>
                <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">{t.cart.subtotal}</span>
                    <span className="text-zinc-900">{format(subtotal)}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">{t.cart.deliveryFee}</span>
                      <span className="text-zinc-900">{format(deliveryFee)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-olive-700">
                      <span>Discount</span>
                      <span>-{format(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-lg font-semibold">
                    <span className="text-zinc-900">{t.cart.total}</span>
                    <span className="text-zinc-900">{format(total)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={processing || !isFormValid()}
                  className="mt-6 w-full rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
