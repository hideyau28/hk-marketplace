"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useCurrency } from "@/lib/currency";

type FulfillmentType = "pickup" | "delivery";
type CheckoutStep = "info" | "payment" | "confirm";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  qrImage: string | null;
  accountInfo: string | null;
}

const DELIVERY_FEE = 30;

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { format } = useCurrency();

  // Checkout step state
  const [step, setStep] = useState<CheckoutStep>("info");

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

  // Payment state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch payment methods
  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setPaymentMethods(data.data.methods);
          if (data.data.methods.length > 0) {
            setSelectedPaymentMethod(data.data.methods[0].type);
          }
        }
      })
      .catch(console.error);
  }, []);

  const validateName = (value: string): string | null => {
    if (value.trim().length < 2) return "請輸入姓名（至少2個字）";
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length !== 8) return "請輸入有效嘅8位電話號碼";
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) return "請輸入有效嘅電郵地址";
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

  const isStep1Valid = () => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("只接受圖片檔案");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("檔案太大，最大 5MB");
      return;
    }

    setPaymentProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPaymentProofPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (processing || !selectedPaymentMethod || !paymentProofFile) return;

    setProcessing(true);
    setUploadingProof(true);

    try {
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      formData.append("folder", "payments");

      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.ok) throw new Error(uploadData.error?.message || "上傳失敗");
      setUploadingProof(false);

      const paymentProofUrl = uploadData.data.url;
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
          address: fulfillmentType === "delivery" ? { line1: addressLine1, district: district || undefined, notes: notes || undefined } : undefined,
        },
        note: orderNote || undefined,
        paymentMethod: selectedPaymentMethod,
        paymentProof: paymentProofUrl,
      };

      const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-idempotency-key": idempotencyKey },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.ok) {
        clearCart();
        showToast("訂單已提交！我們會盡快確認您的付款。");
        router.push(`/${locale}/orders/${result.data.id}`);
      } else {
        alert(`${t.common.error}: ${result.error?.code || "ERROR"}: ${result.error?.message || t.common.unknownError}`);
        setProcessing(false);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      showToast(error instanceof Error ? error.message : "訂單創建失敗");
      setProcessing(false);
      setUploadingProof(false);
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
  const selectedMethod = paymentMethods.find((m) => m.type === selectedPaymentMethod);

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "info" ? "bg-olive-600 text-white" : "bg-olive-100 text-olive-600"}`}>1</div>
      <div className={`w-8 h-1 ${step !== "info" ? "bg-olive-600" : "bg-zinc-200"}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "payment" ? "bg-olive-600 text-white" : step === "confirm" ? "bg-olive-100 text-olive-600" : "bg-zinc-200 text-zinc-400"}`}>2</div>
      <div className={`w-8 h-1 ${step === "confirm" ? "bg-olive-600" : "bg-zinc-200"}`} />
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step === "confirm" ? "bg-olive-600 text-white" : "bg-zinc-200 text-zinc-400"}`}>3</div>
    </div>
  );

  const OrderSummary = ({ compact = false }: { compact?: boolean }) => (
    <div className={`rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 ${!compact ? "lg:sticky lg:top-6" : ""}`}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.orderSummary}</h2>
      <div className="mt-4 space-y-3">
        {cart.map((item) => (
          <div key={`${item.productId}-${item.size || "default"}`} className="flex gap-3">
            <div className="w-10 h-10 rounded-md bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
              {item.imageUrl ? <img src={item.imageUrl} alt="" className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">{item.title.split(" - ")[0]}</div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mt-0.5">
                <span>{item.size ? `${item.size} × ${item.qty}` : `× ${item.qty}`}</span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">{format(item.unitPrice * item.qty)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!compact && (
        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <div className="flex items-center gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder={t.checkout.couponCode} className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100" />
            <button type="button" onClick={() => applyCoupon()} disabled={applyingCoupon} className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{applyingCoupon ? t.checkout.applying : t.checkout.apply}</button>
          </div>
          {couponError && <div className="mt-2 text-xs text-red-600">{couponError}</div>}
          {couponApplied && discount > 0 && <div className="mt-2 text-xs text-olive-700">Coupon applied</div>}
        </div>
      )}
      <div className={`${!compact ? "mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4" : "mt-4"} space-y-2`}>
        <div className="flex justify-between"><span className="text-zinc-600 dark:text-zinc-400">{t.cart.subtotal}</span><span className="text-zinc-900 dark:text-zinc-100">{format(subtotal)}</span></div>
        {deliveryFee > 0 && <div className="flex justify-between"><span className="text-zinc-600 dark:text-zinc-400">{t.cart.deliveryFee}</span><span className="text-zinc-900 dark:text-zinc-100">{format(deliveryFee)}</span></div>}
        {discount > 0 && <div className="flex justify-between text-olive-700"><span>Discount</span><span>-{format(discount)}</span></div>}
        <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 text-lg font-semibold"><span className="text-zinc-900 dark:text-zinc-100">{t.cart.total}</span><span className="text-zinc-900 dark:text-zinc-100">{format(total)}</span></div>
      </div>
    </div>
  );

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.checkout.title}</h1>
        <StepIndicator />

        {step === "info" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.customerInfo}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.customerName} <span className="text-red-500">*</span></label>
                    <input type="text" required value={customerName} onChange={(e) => { setCustomerName(e.target.value); if (nameTouched) setNameError(validateName(e.target.value)); }} onBlur={handleNameBlur} className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${nameTouched && nameError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"}`} />
                    {nameTouched && nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
                  </div>
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.phone} <span className="text-red-500">*</span></label>
                    <input type="tel" required value={phone} onChange={(e) => { setPhone(e.target.value); if (phoneTouched) setPhoneError(validatePhone(e.target.value)); }} onBlur={handlePhoneBlur} className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${phoneTouched && phoneError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"}`} />
                    {phoneTouched && phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                  </div>
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.email}</label>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (emailTouched) setEmailError(validateEmail(e.target.value)); }} onBlur={handleEmailBlur} className={`mt-1 w-full rounded-xl border bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${emailTouched && emailError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"}`} />
                    {emailTouched && emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.fulfillment}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.fulfillmentType}</label>
                    <div className="mt-2 flex gap-3">
                      <button type="button" onClick={() => setFulfillmentType("pickup")} className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${fulfillmentType === "pickup" ? "border-olive-600 bg-olive-600 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"}`}>{t.checkout.pickup}</button>
                      <button type="button" onClick={() => setFulfillmentType("delivery")} className={`flex-1 rounded-xl border px-4 py-3 font-semibold ${fulfillmentType === "delivery" ? "border-olive-600 bg-olive-600 text-white" : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"}`}>{t.checkout.delivery}</button>
                    </div>
                  </div>
                  {fulfillmentType === "delivery" && (
                    <div className="space-y-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{t.checkout.deliveryAddress}</h3>
                      <div><label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.addressLine1}</label><input type="text" required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
                      <div><label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.district}</label><input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
                      <div><label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.notes}</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
                    </div>
                  )}
                  <div><label className="block text-zinc-700 text-sm dark:text-zinc-300">{t.checkout.orderNote}</label><textarea value={orderNote} onChange={(e) => setOrderNote(e.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" /></div>
                </div>
              </div>
              <button type="button" onClick={() => setStep("payment")} disabled={!isStep1Valid()} className="w-full rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed">下一步：選擇付款方式</button>
            </div>
            <div><OrderSummary /></div>
          </div>
        )}

        {step === "payment" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">選擇付款方式</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button key={method.id} type="button" onClick={() => setSelectedPaymentMethod(method.type)} className={`rounded-xl border-2 p-3 text-center transition-all ${selectedPaymentMethod === method.type ? "border-olive-600 bg-olive-50 dark:bg-olive-900/20" : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"}`}>
                      <div className="text-2xl mb-1">{method.type === "fps" && "💳"}{method.type === "payme" && "📱"}{method.type === "alipay" && "🔵"}</div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{method.name}</div>
                    </button>
                  ))}
                </div>
                {selectedMethod && (
                  <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
                    <div className="text-center">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{selectedMethod.name}</h3>
                      {selectedMethod.qrImage && <div className="mx-auto w-48 h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white"><img src={selectedMethod.qrImage} alt={selectedMethod.name} className="w-full h-full object-contain" /></div>}
                      {selectedMethod.accountInfo && <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{selectedMethod.accountInfo}</p>}
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">請使用以上方式付款 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{format(total)}</span></p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("info")} className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 text-zinc-700 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">返回</button>
                <button type="button" onClick={() => setStep("confirm")} disabled={!selectedPaymentMethod} className="flex-1 rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50">下一步：上傳付款證明</button>
              </div>
            </div>
            <div><OrderSummary compact /></div>
          </div>
        )}

        {step === "confirm" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">上傳付款截圖</h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">完成付款後，請上傳付款截圖以確認您的訂單</p>
                <div className="mt-6">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {paymentProofPreview ? (
                    <div className="relative">
                      <img src={paymentProofPreview} alt="Payment proof" className="w-full max-h-64 object-contain rounded-xl border border-zinc-200 dark:border-zinc-700" />
                      <button type="button" onClick={() => { setPaymentProofFile(null); setPaymentProofPreview(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">✕</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center hover:border-olive-500 hover:bg-olive-50 dark:border-zinc-600 dark:bg-zinc-800">
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">點擊上傳付款截圖</div>
                      <div className="text-xs text-zinc-500 mt-1">支持 JPG, PNG, HEIC (最大 5MB)</div>
                    </button>
                  )}
                </div>
                {selectedMethod && (
                  <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{selectedMethod.type === "fps" && "💳"}{selectedMethod.type === "payme" && "📱"}{selectedMethod.type === "alipay" && "🔵"}</div>
                      <div><div className="font-medium text-zinc-900 dark:text-zinc-100">{selectedMethod.name}</div><div className="text-sm text-zinc-500">{selectedMethod.accountInfo}</div></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("payment")} className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 text-zinc-700 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">返回</button>
                <button type="button" onClick={handleSubmit} disabled={processing || !paymentProofFile} className="flex-1 rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed">{uploadingProof ? "上傳中..." : processing ? "處理中..." : "確認訂單"}</button>
              </div>
            </div>
            <div><OrderSummary compact /></div>
          </div>
        )}
      </div>
    </div>
  );
}
