"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getCart, getCartTotal, clearCart, type CartItem } from "@/lib/cart";
import { getDict, type Locale } from "@/lib/i18n";
import { useToast } from "@/components/Toast";
import { useCurrency } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";
import { User } from "lucide-react";

type CheckoutStep = "info" | "payment" | "confirm";

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  qrImage: string | null;
  accountInfo: string | null;
}

interface AddressSuggestion {
  fullAddress: string;
  region: string;
  district: string;
  street: string;
  building: string;
}

interface SavedAddress {
  region: string;
  district: string;
  street: string;
  unit: string;
  fullAddress: string;
}

const HK_REGIONS = ["香港島", "九龍", "新界", "離島"] as const;
type HKRegion = (typeof HK_REGIONS)[number];

// Shipping fee constants (will be overridden by store settings)
const DEFAULT_SHIPPING_FEE = 40;
const DEFAULT_FREE_SHIPPING_THRESHOLD = 600;
const OUTLYING_ISLANDS_SURCHARGE = 20;

const SAVED_ADDRESS_KEY = "hk_last_address";

function getSavedAddress(): SavedAddress | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(SAVED_ADDRESS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveAddress(address: SavedAddress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(address));
  } catch {
    // Ignore storage errors
  }
}

export default function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();
  const { format } = useCurrency();

  // Store settings
  const [shippingFee, setShippingFee] = useState(DEFAULT_SHIPPING_FEE);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(DEFAULT_FREE_SHIPPING_THRESHOLD);

  // Checkout step state
  const [step, setStep] = useState<CheckoutStep>("info");

  // Section 1: Contact info
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Section 2: Delivery address
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [region, setRegion] = useState<HKRegion | "">("");
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [unit, setUnit] = useState("");
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [savedAddressDismissed, setSavedAddressDismissed] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Section 3: Order note
  const [orderNote, setOrderNote] = useState("");

  // Validation states
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [addressTouched, setAddressTouched] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Coupon
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
  const [prefilled, setPrefilled] = useState(false);

  const { user } = useAuth();

  // Mobile order summary toggle
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Address lookup debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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
      // Load saved address
      const saved = getSavedAddress();
      if (saved) {
        setSavedAddress(saved);
      }
    });
  }, [params, router]);

  // Fetch store settings
  useEffect(() => {
    fetch("/api/store-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data) {
          if (data.data.shippingFee) setShippingFee(data.data.shippingFee);
          if (data.data.freeShippingThreshold) setFreeShippingThreshold(data.data.freeShippingThreshold);
        }
      })
      .catch(console.error);
  }, []);

  // Pre-fill form with user data when logged in
  useEffect(() => {
    if (user && !prefilled) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setPhone(user.phone.replace("+852", ""));
      if (user.email) setEmail(user.email);
      if (user.address) {
        try {
          const addr = JSON.parse(user.address);
          if (addr.fullAddress) setAddressQuery(addr.fullAddress);
          if (addr.region) setRegion(addr.region as HKRegion);
          if (addr.district) setDistrict(addr.district);
          if (addr.street) setStreet(addr.street);
          if (addr.unit) setUnit(addr.unit);
        } catch {
          setAddressQuery(user.address);
          setUseManualEntry(true);
          setStreet(user.address);
        }
      }
      setPrefilled(true);
    }
  }, [user, prefilled]);

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

  // Address lookup with debounce
  const lookupAddress = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAddressSuggestions([]);
      return;
    }

    setIsLoadingAddresses(true);
    try {
      const res = await fetch(`/api/address/lookup?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok && data.data?.addresses) {
        setAddressSuggestions(data.data.addresses);
        if (data.data.addresses.length === 0) {
          // No results - switch to manual entry
          setUseManualEntry(true);
        }
      } else {
        setUseManualEntry(true);
      }
    } catch {
      setUseManualEntry(true);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, []);

  const handleAddressInputChange = (value: string) => {
    setAddressQuery(value);
    setShowSuggestions(true);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the lookup
    debounceRef.current = setTimeout(() => {
      lookupAddress(value);
    }, 300);
  };

  const selectAddress = (suggestion: AddressSuggestion) => {
    setAddressQuery(suggestion.fullAddress);
    setRegion(suggestion.region as HKRegion);
    setDistrict(suggestion.district);
    setStreet(suggestion.building || suggestion.street);
    setShowSuggestions(false);
    setUseManualEntry(false);
    setAddressError(null);
  };

  const useSavedAddressHandler = () => {
    if (savedAddress) {
      setAddressQuery(savedAddress.fullAddress);
      setRegion(savedAddress.region as HKRegion);
      setDistrict(savedAddress.district);
      setStreet(savedAddress.street);
      setUnit(savedAddress.unit);
      setUseManualEntry(false);
      setAddressError(null);
    }
  };

  // Validation functions
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

  const validateAddress = (): string | null => {
    if (!region && !street && !addressQuery) {
      return "請輸入送貨地址";
    }
    if (useManualEntry && !region) {
      return "請選擇地區";
    }
    if (useManualEntry && !street.trim()) {
      return "請輸入街道/大廈";
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

  const handleAddressBlur = () => {
    setAddressTouched(true);
    setShowSuggestions(false);
    setAddressError(validateAddress());
  };

  const isFormValid = () => {
    const nameValid = validateName(customerName) === null;
    const phoneValid = validatePhone(phone) === null;
    const emailValid = validateEmail(email) === null;
    const addressValid = validateAddress() === null;
    return nameValid && phoneValid && emailValid && addressValid;
  };

  // Calculate shipping
  const subtotal = getCartTotal(cart);
  const isOutlyingIslands = region === "離島";
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;
  const baseShipping = qualifiesForFreeShipping ? 0 : shippingFee;
  const islandSurcharge = isOutlyingIslands ? OUTLYING_ISLANDS_SURCHARGE : 0;
  const calculatedShipping = baseShipping + islandSurcharge;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const total = Math.max(0, subtotal + calculatedShipping - discount);

  const t = getDict(locale);

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
  }, [region, cart]);

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

      // Build address object
      const addressData = {
        region,
        district,
        street,
        unit,
        fullAddress: addressQuery || `${street}, ${district}, ${region}`,
      };

      const payload = {
        customerName,
        phone,
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
        fulfillment: {
          type: "delivery" as const,
          address: {
            line1: addressData.fullAddress,
            district: addressData.district || undefined,
            region: addressData.region || undefined,
            unit: addressData.unit || undefined,
            notes: undefined,
          },
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
        // Save address for next time
        saveAddress(addressData);

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

  if (!mounted) {
    return (
      <div className="px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Loading...</h1>
        </div>
      </div>
    );
  }

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
    <div className={`rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900 ${!compact ? "lg:sticky lg:top-6" : ""}`}>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{t.checkout.orderSummary}</h2>

      {/* Product list */}
      <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
        {cart.map((item) => (
          <div key={`${item.productId}-${item.size || "default"}`} className="flex gap-3">
            <div className="w-10 h-10 rounded-md bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt="" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
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

      {/* Coupon section */}
      {!compact && (
        <div className="mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4">
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
          {couponApplied && discount > 0 && <div className="mt-2 text-xs text-olive-700">已套用優惠碼</div>}
        </div>
      )}

      {/* Totals */}
      <div className={`${!compact ? "mt-4 border-t border-zinc-200 dark:border-zinc-700 pt-4" : "mt-4"} space-y-2`}>
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{t.cart.subtotal}</span>
          <span className="text-zinc-900 dark:text-zinc-100">{format(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{t.cart.deliveryFee}</span>
          {qualifiesForFreeShipping && !isOutlyingIslands ? (
            <span className="text-green-600 font-medium">免運費</span>
          ) : (
            <span className="text-zinc-900 dark:text-zinc-100">
              {format(calculatedShipping)}
              {isOutlyingIslands && <span className="text-xs text-zinc-500 ml-1">(含離島附加費)</span>}
            </span>
          )}
        </div>

        {/* Free shipping hint */}
        {!qualifiesForFreeShipping && amountToFreeShipping > 0 && (
          <div className="text-xs text-olive-600 bg-olive-50 dark:bg-olive-900/20 px-2 py-1.5 rounded-lg">
            再買 {format(amountToFreeShipping)} 即可免運費
          </div>
        )}

        {/* Discount */}
        {discount > 0 && (
          <div className="flex justify-between text-sm text-olive-700">
            <span>折扣</span>
            <span>-{format(discount)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700 pt-2 text-lg font-semibold">
          <span className="text-zinc-900 dark:text-zinc-100">{t.cart.total}</span>
          <span className="text-zinc-900 dark:text-zinc-100">{format(total)}</span>
        </div>
      </div>
    </div>
  );

  // Mobile summary toggle
  const MobileSummaryHeader = () => (
    <div className="lg:hidden mb-4">
      <button
        type="button"
        onClick={() => setShowMobileSummary(!showMobileSummary)}
        className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-600 dark:text-zinc-400">訂單摘要</span>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">({cart.length} 件商品)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{format(total)}</span>
          <svg className={`w-5 h-5 text-zinc-400 transition-transform ${showMobileSummary ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {showMobileSummary && (
        <div className="mt-2">
          <OrderSummary compact />
        </div>
      )}
    </div>
  );

  return (
    <div className="px-4 py-6 pb-32 lg:pb-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{t.checkout.title}</h1>
        <StepIndicator />

        {step === "info" && (
          <>
            <MobileSummaryHeader />
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                {/* Login prompt for guests */}
                {!user && (
                  <Link href={`/${locale}/login?redirect=/${locale}/checkout`} className="flex items-center gap-3 rounded-2xl border border-olive-200 bg-olive-50 p-4 hover:bg-olive-100 dark:border-olive-800 dark:bg-olive-900/20 dark:hover:bg-olive-900/30 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-olive-100 dark:bg-olive-800 flex items-center justify-center"><User size={18} className="text-olive-600 dark:text-olive-400" /></div>
                    <div className="flex-1">
                      <div className="font-medium text-olive-800 dark:text-olive-300">{locale === "zh-HK" ? "登入以獲得更好體驗" : "Login for a better experience"}</div>
                      <div className="text-sm text-olive-600 dark:text-olive-400">{locale === "zh-HK" ? "追蹤訂單、儲存地址" : "Track orders, save address"}</div>
                    </div>
                  </Link>
                )}

                {/* Section 1: Contact Info */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">聯絡資料</h2>
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-zinc-700 text-sm dark:text-zinc-300">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (nameTouched) setNameError(validateName(e.target.value));
                        }}
                        onBlur={handleNameBlur}
                        placeholder="請輸入收件人姓名"
                        className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                          nameTouched && nameError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                        }`}
                      />
                      {nameTouched && nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-zinc-700 text-sm dark:text-zinc-300">
                        電話 <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-1 flex">
                        <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-zinc-200 bg-zinc-50 text-zinc-500 text-sm dark:border-zinc-800 dark:bg-zinc-800">
                          +852
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                            setPhone(digits);
                            if (phoneTouched) setPhoneError(validatePhone(digits));
                          }}
                          onBlur={handlePhoneBlur}
                          placeholder="8位電話號碼"
                          className={`flex-1 rounded-r-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                            phoneTouched && phoneError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                          }`}
                        />
                      </div>
                      {phoneTouched && phoneError && <p className="mt-1 text-xs text-red-500">{phoneError}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-zinc-700 text-sm dark:text-zinc-300">電郵（選填）</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (emailTouched) setEmailError(validateEmail(e.target.value));
                        }}
                        onBlur={handleEmailBlur}
                        placeholder="用於接收訂單確認"
                        className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                          emailTouched && emailError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                        }`}
                      />
                      {emailTouched && emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                    </div>
                  </div>
                </div>

                {/* Section 2: Delivery Address */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">送貨地址</h2>

                  {/* Saved address quick-fill */}
                  {savedAddress && !savedAddressDismissed && (
                    <div className="mb-4 flex items-center gap-3 rounded-xl border border-olive-200 bg-olive-50 p-3 dark:border-olive-800 dark:bg-olive-900/20">
                      <div className="w-8 h-8 rounded-full bg-olive-100 dark:bg-olive-800 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-olive-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-olive-700 dark:text-olive-300">使用上次地址</div>
                        <div className="text-xs text-olive-600 dark:text-olive-400 truncate">{savedAddress.fullAddress}</div>
                      </div>
                      <button
                        type="button"
                        onClick={useSavedAddressHandler}
                        className="px-3 py-1.5 text-sm font-medium text-olive-700 bg-olive-100 hover:bg-olive-200 rounded-lg dark:bg-olive-800 dark:text-olive-300 dark:hover:bg-olive-700"
                      >
                        使用
                      </button>
                      <button
                        type="button"
                        onClick={() => setSavedAddressDismissed(true)}
                        className="p-1 text-olive-500 hover:text-olive-700 dark:text-olive-400 dark:hover:text-olive-300"
                        aria-label="關閉"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Address search input */}
                    {!useManualEntry && (
                      <div className="relative">
                        <label className="block text-zinc-700 text-sm dark:text-zinc-300">
                          搜尋地址 <span className="text-red-500">*</span>
                        </label>
                        <div className="relative mt-1">
                          <input
                            ref={addressInputRef}
                            type="text"
                            value={addressQuery}
                            onChange={(e) => handleAddressInputChange(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            onBlur={handleAddressBlur}
                            placeholder="輸入街道、大廈或屋苑名稱..."
                            className={`w-full rounded-xl border bg-white px-4 py-3 pr-10 text-zinc-900 placeholder-zinc-400 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                              addressTouched && addressError ? "border-red-500" : "border-zinc-200 focus:border-zinc-400 dark:border-zinc-800"
                            }`}
                          />
                          {isLoadingAddresses && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <svg className="w-5 h-5 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Address suggestions dropdown */}
                        {showSuggestions && addressQuery.length >= 2 && (
                          <div className="absolute z-50 mt-1 w-full rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800 max-h-60 overflow-y-auto">
                            {isLoadingAddresses ? (
                              <div className="px-4 py-3 text-sm text-zinc-500">搜尋中...</div>
                            ) : addressSuggestions.length > 0 ? (
                              addressSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => selectAddress(suggestion)}
                                  className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-700 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  <div className="text-sm text-zinc-900 dark:text-zinc-100">{suggestion.fullAddress}</div>
                                  <div className="text-xs text-zinc-500 mt-0.5">
                                    {suggestion.region} {suggestion.district && `· ${suggestion.district}`}
                                  </div>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-zinc-500">找不到地址</div>
                            )}
                          </div>
                        )}

                        {addressTouched && addressError && <p className="mt-1 text-xs text-red-500">{addressError}</p>}

                        <button
                          type="button"
                          onClick={() => setUseManualEntry(true)}
                          className="mt-2 text-sm text-olive-600 hover:text-olive-700 dark:text-olive-400"
                        >
                          找不到？手動輸入地址
                        </button>
                      </div>
                    )}

                    {/* Manual entry fallback */}
                    {useManualEntry && (
                      <>
                        <div>
                          <label className="block text-zinc-700 text-sm dark:text-zinc-300">
                            地區 <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value as HKRegion)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          >
                            <option value="">選擇地區</option>
                            {HK_REGIONS.map((r) => (
                              <option key={r} value={r}>
                                {r}
                                {r === "離島" && " (+$20)"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-zinc-700 text-sm dark:text-zinc-300">
                            街道/大廈 <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="例：觀塘道123號創紀之城"
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setUseManualEntry(false);
                            setAddressQuery("");
                          }}
                          className="text-sm text-olive-600 hover:text-olive-700 dark:text-olive-400"
                        >
                          ← 返回地址搜尋
                        </button>
                      </>
                    )}

                    {/* Unit (always shown) */}
                    <div>
                      <label className="block text-zinc-700 text-sm dark:text-zinc-300">樓層/單位（選填）</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="例：12樓 A室"
                        className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    </div>

                    {/* Region display (when selected via autocomplete) */}
                    {region && !useManualEntry && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-500">送貨地區：</span>
                        <span className={`font-medium ${region === "離島" ? "text-amber-600" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {region}
                          {region === "離島" && " (附加費 +$20)"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Order Note */}
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">訂單備註</h2>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    rows={3}
                    placeholder="送貨時間偏好、其他備註..."
                    className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {/* Continue button - Desktop */}
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  disabled={!isFormValid()}
                  className="hidden lg:block w-full rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一步：選擇付款方式
                </button>
              </div>

              {/* Desktop Order Summary */}
              <div className="hidden lg:block">
                <OrderSummary />
              </div>
            </div>

            {/* Mobile sticky button */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 lg:hidden">
              <button
                type="button"
                onClick={() => setStep("payment")}
                disabled={!isFormValid()}
                className="w-full rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步：選擇付款方式
              </button>
            </div>
          </>
        )}

        {step === "payment" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">選擇付款方式</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method.type)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        selectedPaymentMethod === method.type
                          ? "border-olive-600 bg-olive-50 dark:bg-olive-900/20"
                          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800"
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {method.type === "fps" && "💳"}
                        {method.type === "payme" && "📱"}
                        {method.type === "alipay" && "🔵"}
                      </div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{method.name}</div>
                    </button>
                  ))}
                </div>
                {selectedMethod && (
                  <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
                    <div className="text-center">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{selectedMethod.name}</h3>
                      {selectedMethod.qrImage && (
                        <div className="mx-auto w-48 h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white">
                          <img src={selectedMethod.qrImage} alt={selectedMethod.name} className="w-full h-full object-contain" />
                        </div>
                      )}
                      {selectedMethod.accountInfo && (
                        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">{selectedMethod.accountInfo}</p>
                      )}
                      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                        請使用以上方式付款 <span className="font-semibold text-zinc-900 dark:text-zinc-100">{format(total)}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("info")}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 text-zinc-700 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={() => setStep("confirm")}
                  disabled={!selectedPaymentMethod}
                  className="flex-1 rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50"
                >
                  下一步：上傳付款證明
                </button>
              </div>
            </div>
            <div>
              <OrderSummary compact />
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">上傳付款截圖</h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">完成付款後，請上傳付款截圖以確認您的訂單</p>
                <div className="mt-6">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {paymentProofPreview ? (
                    <div className="relative">
                      <img
                        src={paymentProofPreview}
                        alt="Payment proof"
                        className="w-full max-h-64 object-contain rounded-xl border border-zinc-200 dark:border-zinc-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentProofFile(null);
                          setPaymentProofPreview(null);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center hover:border-olive-500 hover:bg-olive-50 dark:border-zinc-600 dark:bg-zinc-800"
                    >
                      <div className="text-4xl mb-2">📷</div>
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">點擊上傳付款截圖</div>
                      <div className="text-xs text-zinc-500 mt-1">支持 JPG, PNG, HEIC (最大 5MB)</div>
                    </button>
                  )}
                </div>
                {selectedMethod && (
                  <div className="mt-4 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {selectedMethod.type === "fps" && "💳"}
                        {selectedMethod.type === "payme" && "📱"}
                        {selectedMethod.type === "alipay" && "🔵"}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{selectedMethod.name}</div>
                        <div className="text-sm text-zinc-500">{selectedMethod.accountInfo}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("payment")}
                  className="flex-1 rounded-2xl border border-zinc-200 bg-white py-4 text-zinc-700 font-semibold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={processing || !paymentProofFile}
                  className="flex-1 rounded-2xl bg-olive-600 py-4 text-white font-semibold hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingProof ? "上傳中..." : processing ? "處理中..." : "確認訂單"}
                </button>
              </div>
            </div>
            <div>
              <OrderSummary compact />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
