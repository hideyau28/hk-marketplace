"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";
import CheckoutPaymentSelector, { type PaymentProviderOption } from "@/components/CheckoutPaymentSelector";
import ManualPaymentFlow from "@/components/ManualPaymentFlow";

type FulfillmentType = "delivery" | "sf-locker" | "pickup";

type CheckoutFulfillment =
  | {
      type: "delivery";
      address: {
        line1: string;
        district?: string;
        region?: string;
        unit?: string;
        notes?: string;
        building?: string;
        floor?: string;
      };
    }
  | { type: "pickup" };

const DEFAULT_HOME_DELIVERY_FEE = 40;
const DEFAULT_HOME_DELIVERY_FREE_ABOVE = 600;
const DEFAULT_HOME_DELIVERY_ISLAND_EXTRA = 20;
const DEFAULT_SF_LOCKER_FEE = 35;
const DEFAULT_SF_LOCKER_FREE_ABOVE = 600;

const DISTRICTS_ZH = ["香港島", "九龍", "新界", "離島"] as const;
const DISTRICTS_EN = ["Hong Kong Island", "Kowloon", "New Territories", "Outlying Islands"] as const;

type District = (typeof DISTRICTS_ZH)[number] | (typeof DISTRICTS_EN)[number] | "";

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { format } = useCurrency();
  const { user } = useAuth();

  const [storeSettings, setStoreSettings] = useState<any>(null);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [sameAsContact, setSameAsContact] = useState(true);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery");
  const [district, setDistrict] = useState<District>("");
  const [addressLine, setAddressLine] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [unit, setUnit] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [sfLockerCode, setSfLockerCode] = useState("");

  const [orderNote, setOrderNote] = useState("");

  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [receiverNameTouched, setReceiverNameTouched] = useState(false);
  const [receiverPhoneTouched, setReceiverPhoneTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);

  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [receiverNameError, setReceiverNameError] = useState<string | null>(null);
  const [receiverPhoneError, setReceiverPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplied, setCouponApplied] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponFeatureEnabled, setCouponFeatureEnabled] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderOption | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const t = getDict(locale);

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

  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setStoreSettings(data.data);
      })
      .catch(() => {});
    fetch("/api/features/coupon")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.enabled) setCouponFeatureEnabled(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    if (user.name) setCustomerName(user.name);
    if (user.phone) setPhone(user.phone.replace("+852", ""));
    if (user.email) setEmail(user.email);
  }, [user]);


  const validateName = (value: string): string | null => {
    if (value.trim().length < 2) {
      return locale === "zh-HK" ? "請輸入姓名（至少2個字）" : "Please enter a name (min 2 chars)";
    }
    return null;
  };

  const validatePhone = (value: string): string | null => {
    const digitsOnly = value.replace(/\D/g, "");
    if (digitsOnly.length !== 8) {
      return locale === "zh-HK" ? "請輸入有效嘅8位電話號碼" : "Please enter a valid 8-digit phone number";
    }
    return null;
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return locale === "zh-HK" ? "請輸入有效嘅電郵地址" : "Please enter a valid email";
    }
    return null;
  };

  const validateAddress = (): string | null => {
    if (fulfillmentType === "delivery") {
      if (!district || !addressLine.trim()) {
        return locale === "zh-HK" ? "請輸入送貨地址" : "Please enter the delivery address";
      }
    }
    if (fulfillmentType === "sf-locker") {
      if (!sfLockerCode.trim()) {
        return locale === "zh-HK" ? "請輸入順豐智能櫃/站編號" : "Please enter the SF Locker/Station code";
      }
    }
    return null;
  };

  const handlePaymentFileChange = (file: File | null, preview: string | null) => {
    setPaymentProofFile(file);
    setPaymentProofPreview(preview);
  };

  const homeDeliveryFee = storeSettings?.homeDeliveryFee ?? DEFAULT_HOME_DELIVERY_FEE;
  const homeDeliveryFreeAbove = storeSettings?.homeDeliveryFreeAbove ?? DEFAULT_HOME_DELIVERY_FREE_ABOVE;
  const homeDeliveryIslandExtra = storeSettings?.homeDeliveryIslandExtra ?? DEFAULT_HOME_DELIVERY_ISLAND_EXTRA;
  const sfLockerFee = storeSettings?.sfLockerFee ?? DEFAULT_SF_LOCKER_FEE;
  const sfLockerFreeAbove = storeSettings?.sfLockerFreeAbove ?? DEFAULT_SF_LOCKER_FREE_ABOVE;

  const subtotal = getCartTotal(cart);
  const isOutlyingIslands = district === "離島" || district === "Outlying Islands";
  const qualifiesHomeFree = subtotal >= homeDeliveryFreeAbove;
  const qualifiesSfFree = subtotal >= sfLockerFreeAbove;

  const baseHomeFee = qualifiesHomeFree ? 0 : homeDeliveryFee;
  const islandSurcharge = fulfillmentType === "delivery" && isOutlyingIslands ? homeDeliveryIslandExtra : 0;
  const calculatedHomeFee = baseHomeFee + islandSurcharge;

  const calculatedSfFee = qualifiesSfFree ? 0 : sfLockerFee;

  const calculatedShipping =
    fulfillmentType === "pickup" ? 0 : fulfillmentType === "sf-locker" ? calculatedSfFee : calculatedHomeFee;

  const total = Math.max(0, subtotal + calculatedShipping - discount);

  const deliveryMethodLabel = () => {
    if (fulfillmentType === "pickup") return locale === "zh-HK" ? "自取" : "Pickup";
    if (fulfillmentType === "sf-locker") return locale === "zh-HK" ? "順豐智能櫃" : "SF Locker";
    return locale === "zh-HK" ? "送貨上門" : "Home Delivery";
  };

  const formatFeeLabel = (fee: number) => {
    if (fee === 0) return locale === "zh-HK" ? "免費" : "Free";
    return format(fee);
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
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: finalCode, subtotal, deliveryFee: calculatedShipping }),
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
  }, [fulfillmentType, district, subtotal]);

  const isFormValid = () => {
    const nameValid = validateName(customerName) === null;
    const phoneValid = validatePhone(phone) === null;
    const emailValid = validateEmail(email) === null;
    const receiverNameValid = sameAsContact ? true : validateName(receiverName) === null;
    const receiverPhoneValid = sameAsContact ? true : validatePhone(receiverPhone) === null;
    const addressValid = validateAddress() === null;
    // Online payments don't need proof; manual payments do
    const paymentValid = selectedProvider
      ? selectedProvider.type === "online" || Boolean(paymentProofFile)
      : false;
    return nameValid && phoneValid && emailValid && receiverNameValid && receiverPhoneValid && addressValid && paymentValid;
  };

  const buildOrderPayload = (paymentProofUrl?: string) => {
    const recipientName = sameAsContact ? customerName : receiverName;
    const recipientPhone = sameAsContact ? phone : receiverPhone;

    const fulfillment: CheckoutFulfillment = (() => {
      if (fulfillmentType === "pickup") return { type: "pickup" };
      if (fulfillmentType === "sf-locker") {
        return {
          type: "delivery",
          address: {
            line1: `SF Locker: ${sfLockerCode}`,
            district: locale === "zh-HK" ? "順豐智能櫃" : "SF Locker",
          },
        };
      }
      return {
        type: "delivery",
        address: {
          line1: addressLine,
          district: district || undefined,
          unit: unit || undefined,
          notes: deliveryNote || undefined,
          building: building || undefined,
          floor: floor || undefined,
        },
      };
    })();

    return {
      customerName: recipientName,
      phone: recipientPhone,
      email: email || undefined,
      userId: user?.id,
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
        deliveryFee: calculatedShipping > 0 ? calculatedShipping : undefined,
        total,
        currency: "HKD",
        couponCode: couponApplied ? couponCode.trim().toUpperCase() : undefined,
      },
      fulfillment,
      note: orderNote || undefined,
      paymentMethod: selectedProvider?.providerId,
      paymentProof: paymentProofUrl,
    };
  };

  const handleSubmit = async () => {
    if (processing) return;

    setNameTouched(true);
    setPhoneTouched(true);
    setEmailTouched(true);
    setReceiverNameTouched(true);
    setReceiverPhoneTouched(true);
    setAddressTouched(true);

    setNameError(validateName(customerName));
    setPhoneError(validatePhone(phone));
    setEmailError(validateEmail(email));
    if (!sameAsContact) {
      setReceiverNameError(validateName(receiverName));
      setReceiverPhoneError(validatePhone(receiverPhone));
    }
    setAddressError(validateAddress());

    if (!selectedProvider) {
      showToast(locale === "zh-HK" ? "請選擇付款方式" : "Please select a payment method");
      return;
    }

    if (selectedProvider.type === "manual" && !paymentProofFile) {
      showToast(locale === "zh-HK" ? "請上傳付款證明" : "Please upload payment proof");
      return;
    }

    if (!isFormValid()) return;

    setProcessing(true);

    try {
      // Manual flow: upload proof → create order
      if (selectedProvider.type === "manual") {
        setUploadingProof(true);

        const formData = new FormData();
        formData.append("file", paymentProofFile!);
        formData.append("folder", "payments");

        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadData.ok) throw new Error(uploadData.error?.message || "上傳失敗");
        setUploadingProof(false);

        const payload = buildOrderPayload(uploadData.data.url);
        const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-idempotency-key": idempotencyKey },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.ok) {
          clearCart();
          showToast(locale === "zh-HK" ? "訂單已提交！我們會盡快確認您的付款。" : "Order submitted! We'll confirm your payment shortly.");
          router.push(`/${locale}/orders/${result.data.id}`);
        } else {
          alert(`${t.common.error}: ${result.error?.code || "ERROR"}: ${result.error?.message || t.common.unknownError}`);
          setProcessing(false);
        }
        return;
      }

      // Online flow: create order → redirect to Stripe checkout
      const payload = buildOrderPayload();
      const idempotencyKey = `order-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-idempotency-key": idempotencyKey },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.ok) {
        alert(`${t.common.error}: ${result.error?.code || "ERROR"}: ${result.error?.message || t.common.unknownError}`);
        setProcessing(false);
        return;
      }

      // Create Stripe checkout session
      const sessionRes = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.data.id, locale }),
      });

      const sessionData = await sessionRes.json();

      if (sessionData.ok && sessionData.data?.url) {
        clearCart();
        window.location.href = sessionData.data.url;
      } else {
        alert(
          locale === "zh-HK"
            ? "無法建立付款連結，請稍後再試"
            : "Failed to create payment session. Please try again."
        );
        setProcessing(false);
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      showToast(error instanceof Error ? error.message : locale === "zh-HK" ? "訂單創建失敗" : "Order failed");
      setProcessing(false);
      setUploadingProof(false);
    }
  };

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Loading...</h1>
        </div>
      </div>
    );
  }

  const districtOptions = locale === "zh-HK" ? DISTRICTS_ZH : DISTRICTS_EN;

  const OrderSummary = ({ sticky = false }: { sticky?: boolean }) => (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 ${
        sticky ? "lg:sticky lg:top-4" : ""
      }`}
    >
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {locale === "zh-HK" ? "訂單摘要" : "Order Summary"}
      </h2>

      <div className="mt-4 space-y-4">
        {cart.map((item) => (
          <div key={`${item.productId}-${item.size || "default"}`} className="flex gap-3">
            <div className="h-14 w-14 rounded-xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-300">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {item.title.split(" - ")[0]}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-zinc-500">
                <span>{item.size ? `${item.size} × ${item.qty}` : `× ${item.qty}`}</span>
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {format(item.unitPrice * item.qty)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {couponFeatureEnabled && (
      <div className="mt-6 border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder={t.checkout.couponCode}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="button"
            onClick={() => applyCoupon()}
            disabled={applyingCoupon}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            {applyingCoupon ? t.checkout.applying : t.checkout.apply}
          </button>
        </div>
        {couponError && <div className="mt-2 text-xs text-red-600">{couponError}</div>}
        {couponApplied && discount > 0 && (
          <div className="mt-2 text-xs text-olive-700">
            {t.checkout.couponApplied}
          </div>
        )}
      </div>
      )}

      <div className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-700">
        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">{t.cart.subtotal}</span>
          <span className="text-zinc-900 dark:text-zinc-100">{format(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-600 dark:text-zinc-400">
            {locale === "zh-HK" ? "運費" : "Delivery"} ({deliveryMethodLabel()})
          </span>
          <span className="text-zinc-900 dark:text-zinc-100">
            {formatFeeLabel(calculatedShipping)}
            {fulfillmentType === "delivery" && islandSurcharge > 0 && (
              <span className="ml-1 text-xs text-zinc-500">({locale === "zh-HK" ? "含離島附加費" : "incl. island extra"})</span>
            )}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-olive-700">
            <span>{locale === "zh-HK" ? "折扣" : "Discount"}</span>
            <span>-{format(discount)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold dark:border-zinc-700">
          <span className="text-zinc-900 dark:text-zinc-100">{t.cart.total}</span>
          <span className="text-zinc-900 dark:text-zinc-100">{format(total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={processing || !isFormValid()}
        className="mt-6 w-full rounded-xl bg-olive-600 py-3.5 text-center font-semibold text-white hover:bg-olive-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploadingProof
          ? locale === "zh-HK"
            ? "上傳中..."
            : "Uploading..."
          : processing
            ? locale === "zh-HK"
              ? "處理中..."
              : "Processing..."
            : locale === "zh-HK"
              ? "提交訂單"
              : "Place Order"}
      </button>
    </div>
  );

  return (
    <div className="px-4 py-6 pb-24 lg:pb-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.title}</h1>

        {!user && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-olive-100">
              <User size={18} className="text-olive-700" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {locale === "zh-HK" ? "已有帳號？" : "Have an account?"}
              </p>
              <p className="text-xs text-zinc-500">
                {locale === "zh-HK" ? "登入以自動填寫資料" : "Sign in to autofill your info"}
              </p>
            </div>
            <Link
              href={`/${locale}/login?redirect=checkout`}
              className="ml-auto text-sm font-semibold text-olive-600 hover:text-olive-700"
            >
              {locale === "zh-HK" ? "登入" : "Sign in"}
            </Link>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {locale === "zh-HK" ? "聯絡資料" : "Contact Info"}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                    {locale === "zh-HK" ? "姓名" : "Name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (nameTouched) setNameError(validateName(e.target.value));
                    }}
                    onBlur={() => {
                      setNameTouched(true);
                      setNameError(validateName(customerName));
                    }}
                    placeholder={locale === "zh-HK" ? "請輸入收件人姓名" : "Full name"}
                    className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                      nameTouched && nameError
                        ? "border-red-500"
                        : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                    }`}
                  />
                  {nameTouched && nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                    {locale === "zh-HK" ? "電話" : "Phone"} <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 grid grid-cols-[72px_1fr] gap-2">
                    <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800">
                      +852
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setPhone(digits);
                        if (phoneTouched) setPhoneError(validatePhone(digits));
                      }}
                      onBlur={() => {
                        setPhoneTouched(true);
                        setPhoneError(validatePhone(phone));
                      }}
                      placeholder={locale === "zh-HK" ? "8位電話號碼" : "8-digit phone"}
                      className={`w-full rounded-lg border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                        phoneTouched && phoneError
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                  </div>
                  {phoneTouched && phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                </div>

                <div>
                  <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                    {locale === "zh-HK" ? "電郵（選填）" : "Email (optional)"}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailTouched) setEmailError(validateEmail(e.target.value));
                    }}
                    onBlur={() => {
                      setEmailTouched(true);
                      setEmailError(validateEmail(email));
                    }}
                    placeholder={locale === "zh-HK" ? "用於接收訂單確認" : "For order confirmation"}
                    className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                      emailTouched && emailError
                        ? "border-red-500"
                        : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                    }`}
                  />
                  {emailTouched && emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                </div>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <input
                type="checkbox"
                checked={sameAsContact}
                onChange={() => setSameAsContact((prev) => !prev)}
                className="h-4.5 w-4.5 accent-olive-600"
              />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {locale === "zh-HK" ? "收貨人同聯絡人相同" : "Receiver is same as contact person"}
              </span>
            </label>

            {!sameAsContact && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {locale === "zh-HK" ? "收貨人資料" : "Receiver Info"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "收貨人姓名" : "Receiver Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={receiverName}
                      onChange={(e) => {
                        setReceiverName(e.target.value);
                        if (receiverNameTouched) setReceiverNameError(validateName(e.target.value));
                      }}
                      onBlur={() => {
                        setReceiverNameTouched(true);
                        setReceiverNameError(validateName(receiverName));
                      }}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                        receiverNameTouched && receiverNameError
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                    {receiverNameTouched && receiverNameError && (
                      <p className="mt-1 text-xs text-red-500">{receiverNameError}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "收貨人電話" : "Receiver Phone"} <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 grid grid-cols-[72px_1fr] gap-2">
                      <div className="flex items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800">
                        +852
                      </div>
                      <input
                        type="tel"
                        required
                        value={receiverPhone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                          setReceiverPhone(digits);
                          if (receiverPhoneTouched) setReceiverPhoneError(validatePhone(digits));
                        }}
                        onBlur={() => {
                          setReceiverPhoneTouched(true);
                          setReceiverPhoneError(validatePhone(receiverPhone));
                        }}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                          receiverPhoneTouched && receiverPhoneError
                            ? "border-red-500"
                            : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                        }`}
                      />
                    </div>
                    {receiverPhoneTouched && receiverPhoneError && (
                      <p className="mt-1 text-xs text-red-500">{receiverPhoneError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {locale === "zh-HK" ? "送貨方式" : "Fulfillment"}
              </h2>

              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  {
                    key: "delivery",
                    icon: "🚚",
                    label: "送貨上門",
                    labelEn: "Home Delivery",
                    price: formatFeeLabel(calculatedHomeFee),
                  },
                  {
                    key: "sf-locker",
                    icon: "📦",
                    label: "順豐智能櫃",
                    labelEn: "SF Locker",
                    price: formatFeeLabel(calculatedSfFee),
                  },
                  {
                    key: "pickup",
                    icon: "🏪",
                    label: "自取",
                    labelEn: "Pickup",
                    price: locale === "zh-HK" ? "免費" : "Free",
                  },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setFulfillmentType(opt.key as FulfillmentType);
                      setAddressTouched(false);
                      setAddressError(null);
                    }}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${
                      fulfillmentType === opt.key
                        ? "border-olive-600 bg-olive-50 dark:bg-olive-900/20"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
                    }`}
                  >
                    <div className="text-xl mb-1">{opt.icon}</div>
                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {locale === "zh-HK" ? opt.label : opt.labelEn}
                    </div>
                    <div className="text-xs text-olive-600 font-medium mt-0.5">{opt.price}</div>
                  </button>
                ))}
              </div>

              {fulfillmentType === "delivery" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "地區" : "District"} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value as District)}
                      onBlur={() => {
                        setAddressTouched(true);
                        setAddressError(validateAddress());
                      }}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">{locale === "zh-HK" ? "選擇地區" : "Select district"}</option>
                      {districtOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "地址" : "Address"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      onBlur={() => {
                        setAddressTouched(true);
                        setAddressError(validateAddress());
                      }}
                      placeholder={locale === "zh-HK" ? "街道/屋苑" : "Street address"}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                        addressTouched && addressError
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      placeholder={locale === "zh-HK" ? "座數/大廈" : "Building"}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder={locale === "zh-HK" ? "樓層" : "Floor"}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder={locale === "zh-HK" ? "單位" : "Unit"}
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "送貨備註（選填）" : "Delivery Notes (optional)"}
                    </label>
                    <textarea
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  {addressTouched && addressError && <p className="text-xs text-red-500">{addressError}</p>}
                </div>
              )}

              {fulfillmentType === "sf-locker" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-700 dark:text-zinc-300">
                      {locale === "zh-HK" ? "智能櫃/順豐站編號" : "SF Locker/Station code"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={sfLockerCode}
                      onChange={(e) => setSfLockerCode(e.target.value)}
                      onBlur={() => {
                        setAddressTouched(true);
                        setAddressError(validateAddress());
                      }}
                      placeholder={locale === "zh-HK" ? "例：H852001001" : "e.g. H852001001"}
                      className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                        addressTouched && addressError
                          ? "border-red-500"
                          : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                      }`}
                    />
                  </div>
                  {addressTouched && addressError && <p className="text-xs text-red-500">{addressError}</p>}
                  <p className="text-xs text-zinc-500">
                    {locale === "zh-HK" ? "請到" : "Check"}{" "}
                    <a
                      href="https://htm.sf-express.com/hk/tc/dynamic_function/S.F.Network/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-olive-600 hover:text-olive-700"
                    >
                      {locale === "zh-HK" ? "順豐官網" : "SF Express"}
                    </a>{" "}
                    {locale === "zh-HK" ? "查詢智能櫃/站編號" : "for locker/station codes"}
                  </p>
                </div>
              )}

              {fulfillmentType === "pickup" && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                  {locale === "zh-HK"
                    ? storeSettings?.pickupAddressZh || "自取地址請聯絡店主"
                    : storeSettings?.pickupAddressEn || "Contact store for pickup address"}
                </div>
              )}
            </div>

            <CheckoutPaymentSelector
              locale={locale}
              onSelect={setSelectedProvider}
            />

            {selectedProvider?.type === "manual" && (
              <ManualPaymentFlow
                provider={selectedProvider}
                locale={locale}
                total={total}
                format={format}
                onFileChange={handlePaymentFileChange}
                paymentProofPreview={paymentProofPreview}
              />
            )}

            {selectedProvider?.type === "online" && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">{selectedProvider.icon}</div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {locale === "zh-HK"
                      ? "提交訂單後將跳轉至安全支付頁面"
                      : "You will be redirected to a secure payment page after submitting"}
                  </p>
                  <p className="mt-2 text-sm text-zinc-500">
                    {locale === "zh-HK" ? "應付金額：" : "Amount: "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {format(total)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {locale === "zh-HK" ? "備註（選填）" : "Order Notes (optional)"}
              </h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                rows={3}
                placeholder={locale === "zh-HK" ? "送貨時間偏好、特別要求..." : "Delivery time, special requests..."}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="hidden lg:block">
            <OrderSummary sticky />
          </div>
        </div>

        <div className="mt-6 lg:hidden">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}
