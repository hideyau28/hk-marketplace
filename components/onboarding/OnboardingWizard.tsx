"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepIndicator from "./StepIndicator";
import { COVER_TEMPLATES } from "@/lib/cover-templates";
import type { Locale } from "@/lib/i18n";

// --- Bilingual labels ---
const t = {
  en: {
    // Step 1: Plan
    choosePlan: "Choose your plan",
    choosePlanSub: "Start free, upgrade anytime",
    freePlan: "Free",
    litePlan: "Lite",
    proPlan: "Pro",
    month: "/mo",
    selectPlan: "Select",
    selected: "Selected",
    mostPopular: "Most popular",
    billingLater: "Set up billing after opening",
    freeForever: "Free forever",
    zeroPlatformFee: "0% platform fee",
    // Step 2: Store Info
    storeInfo: "Store details",
    storeInfoSub: "Tell us about your shop",
    storeSection: "Your Store",
    storeName: "Store Name *",
    storeNamePlaceholder: "e.g. May's Fashion",
    storeUrl: "Store URL",
    slugChecking: "Checking...",
    slugAvailable: "Available!",
    slugTaken: "Already taken",
    slugFormatError: "3-30 chars, lowercase letters, numbers & hyphens only",
    nameMinError: "At least 2 characters",
    nameMaxError: "Maximum 50 characters",
    required: "Required",
    accountSection: "Your Account",
    email: "Email *",
    emailPlaceholder: "e.g. hello@myshop.com",
    emailFormatError: "Invalid email format",
    password: "Password *",
    passwordPlaceholder: "At least 8 characters",
    passwordMinError: "At least 8 characters",
    confirmPassword: "Confirm Password *",
    confirmPasswordPlaceholder: "Re-enter your password",
    passwordMismatch: "Passwords do not match",
    contactSection: "Contact (optional)",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "e.g. 91234567",
    whatsappHint: "8-digit HK number, no +852",
    whatsappFormatError: "Must be 8 digits",
    instagram: "Instagram",
    instagramPlaceholder: "@yourshop",
    // Navigation
    next: "Next",
    back: "Back",
    // Step 3: Theme
    pickStyle: "Pick a style",
    pickStyleSub: "You can change this later",
    storeStyle: "Store style",
    taglineOptional: "Tagline (optional)",
    taglinePlaceholder: "e.g. Artisan Oolong Tea Shop",
    taglineSkipHint: "You can skip this",
    // Step 4: Payment
    setupPayment: "Payment methods",
    setupPaymentSub: "How will customers pay you?",
    fpsName: "FPS 轉數快",
    fpsDesc: "Most popular in HK",
    paymeName: "PayMe",
    paymeDesc: "Great for young customers",
    alipayHkName: "AlipayHK",
    alipayHkDesc: "For mainland customers",
    bankTransferName: "Bank Transfer",
    bankTransferDesc: "Traditional & reliable",
    skipPayment: "Set up later",
    createStore: "Create my store",
    creating: "Creating your store...",
    // Step 5: Done
    congrats: "Your store is ready!",
    storeLink: "Your store link:",
    copied: "Copied!",
    copyLink: "Copy",
    openMyStore: "Open my store",
    goToAdmin: "Go to admin dashboard",
    // Errors
    registerError: "Registration failed, please try again",
    haveAccount: "Already have an account?",
    login: "Log in",
    // Billing
    setupBilling: "Set up billing",
    setupBillingDesc: "Activate your {plan} plan ($\u200B{price}/mo) via Stripe",
    setupBillingLater: "Set up later in admin",
    // Upgrade CTA (free users)
    upgradeCta: "Upgrade your plan",
    upgradeCtaDesc: "Unlock more products, orders & features as your store grows",
    liteTag: "Lite — $78/mo",
    proTag: "Pro — $198/mo",
    liteBenefitShort: "50 products, unlimited orders, coupons + WhatsApp",
    proBenefitShort: "Unlimited everything, custom domain, CRM + analytics",
    viewPlans: "View plans & upgrade",
  },
  "zh-HK": {
    // Step 1: Plan
    choosePlan: "揀個計劃",
    choosePlanSub: "免費開始，隨時升級",
    freePlan: "Free",
    litePlan: "Lite",
    proPlan: "Pro",
    month: "/月",
    selectPlan: "選擇",
    selected: "已選擇",
    mostPopular: "最受歡迎",
    billingLater: "開店後設定付款",
    freeForever: "永久免費",
    zeroPlatformFee: "0% 平台抽成",
    // Step 2: Store Info
    storeInfo: "店鋪資料",
    storeInfoSub: "設定你嘅小店",
    storeSection: "你嘅店",
    storeName: "店鋪名稱 *",
    storeNamePlaceholder: "例如：May's Fashion",
    storeUrl: "店舖網址",
    slugChecking: "檢查中...",
    slugAvailable: "可以用！",
    slugTaken: "已被使用",
    slugFormatError: "3-30 個字，只可以用細楷英文、數字同連字號",
    nameMinError: "最少 2 個字",
    nameMaxError: "最多 50 個字",
    required: "必填",
    accountSection: "帳戶資料",
    email: "電郵地址 *",
    emailPlaceholder: "例如 hello@myshop.com",
    emailFormatError: "電郵格式唔啱",
    password: "密碼 *",
    passwordPlaceholder: "最少 8 個字",
    passwordMinError: "最少 8 個字",
    confirmPassword: "確認密碼 *",
    confirmPasswordPlaceholder: "再輸入一次密碼",
    passwordMismatch: "密碼不一致",
    contactSection: "聯絡方式（選填）",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "例如 91234567",
    whatsappHint: "8 位香港號碼，不需要 +852",
    whatsappFormatError: "需要 8 位數字",
    instagram: "Instagram",
    instagramPlaceholder: "@yourshop",
    // Navigation
    next: "下一步",
    back: "返回",
    // Step 3: Theme
    pickStyle: "揀個風格",
    pickStyleSub: "之後可以隨時改",
    storeStyle: "店舖風格",
    taglineOptional: "簡介（選填）",
    taglinePlaceholder: "例如：手工烏龍茶專門店",
    taglineSkipHint: "可以跳過",
    // Step 4: Payment
    setupPayment: "收款方式",
    setupPaymentSub: "客人點樣畀錢你？",
    fpsName: "FPS 轉數快",
    fpsDesc: "香港最常用",
    paymeName: "PayMe",
    paymeDesc: "年輕客群必備",
    alipayHkName: "AlipayHK",
    alipayHkDesc: "內地客人適用",
    bankTransferName: "銀行過數",
    bankTransferDesc: "傳統可靠",
    skipPayment: "之後再設定",
    createStore: "開店",
    creating: "建立緊你嘅小店...",
    // Step 5: Done
    congrats: "你嘅店已準備好！",
    storeLink: "你嘅店舖連結：",
    copied: "已複製！",
    copyLink: "複製",
    openMyStore: "開啟我的店",
    goToAdmin: "去管理後台",
    // Errors
    registerError: "註冊失敗，請再試",
    haveAccount: "已有帳號？",
    login: "登入",
    // Billing
    setupBilling: "設定付款",
    setupBillingDesc: "透過 Stripe 啟用你嘅 {plan} 方案（${price}/月）",
    setupBillingLater: "之後喺後台設定",
    // Upgrade CTA (free users)
    upgradeCta: "升級你嘅方案",
    upgradeCtaDesc: "解鎖更多產品、訂單同進階功能",
    liteTag: "Lite — $78/月",
    proTag: "Pro — $198/月",
    liteBenefitShort: "50 件產品、無限訂單、優惠碼 + WhatsApp",
    proBenefitShort: "無限全部、自訂域名、CRM + 數據分析",
    viewPlans: "睇方案 & 升級",
  },
} as const;

// --- Plan data ---
function getOnboardingPlans(isZh: boolean) {
  return [
    {
      id: "free",
      name: "Free",
      price: 0,
      features: isZh
        ? ["10 件商品", "每月 50 單", "FPS + PayMe + AlipayHK", "Mochi 主題"]
        : ["10 products", "50 orders/mo", "FPS + PayMe + AlipayHK", "Mochi theme"],
      badge: null,
      footnote: isZh ? "永久免費" : "Free forever",
      bg: "bg-white border-zinc-200",
      accent: "#10B981",
    },
    {
      id: "lite",
      name: "Lite",
      price: 78,
      features: isZh
        ? ["50 件商品", "無限訂單", "全部主題", "優惠碼 + WhatsApp"]
        : ["50 products", "Unlimited orders", "All themes", "Coupons + WhatsApp"],
      badge: isZh ? "最受歡迎" : "Most popular",
      footnote: isZh ? "開店後設定付款" : "Set up billing after opening",
      bg: "bg-gradient-to-b from-orange-50 to-amber-50 border-[#FF9500]",
      accent: "#FF9500",
    },
    {
      id: "pro",
      name: "Pro",
      price: 198,
      features: isZh
        ? ["無限商品/訂單", "自訂域名", "CRM + 數據分析", "移除 branding"]
        : ["Unlimited everything", "Custom domain", "CRM + Analytics", "Remove branding"],
      badge: null,
      footnote: isZh ? "開店後設定付款" : "Set up billing after opening",
      bg: "bg-zinc-900 border-zinc-700",
      accent: "#FFFFFF",
    },
  ];
}

// --- Payment method options ---
function getPaymentOptions(isZh: boolean) {
  return [
    {
      id: "fps",
      icon: "🏦",
      name: isZh ? "FPS 轉數快" : "FPS 轉數快",
      desc: isZh ? "香港最常用" : "Most popular in HK",
    },
    {
      id: "payme",
      icon: "📱",
      name: "PayMe",
      desc: isZh ? "年輕客群必備" : "Great for young customers",
    },
    {
      id: "alipay_hk",
      icon: "🅰️",
      name: "AlipayHK",
      desc: isZh ? "內地客人適用" : "For mainland customers",
    },
    {
      id: "bank_transfer",
      icon: "🏧",
      name: isZh ? "銀行過數" : "Bank Transfer",
      desc: isZh ? "傳統可靠" : "Traditional & reliable",
    },
  ];
}

// --- Validation patterns ---
const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
const WHATSAPP_REGEX = /^[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);
}

type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

interface OnboardingData {
  plan: string;
  shopName: string;
  slug: string;
  slugManuallyEdited: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  whatsapp: string;
  instagram: string;
  templateId: string;
  tagline: string;
  paymentMethods: string[];
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

interface OnboardingWizardProps {
  locale: Locale;
}

const STORAGE_KEY = "onboarding-wizard-state";
const TOTAL_STEPS = 5;

export default function OnboardingWizard({ locale }: OnboardingWizardProps) {
  const labels = locale === "zh-HK" ? t["zh-HK"] : t.en;
  const isZh = locale === "zh-HK";
  const plans = getOnboardingPlans(isZh);
  const paymentOptions = getPaymentOptions(isZh);

  const [step, setStep] = useState<OnboardingStep>(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    plan: "free",
    shopName: "",
    slug: "",
    slugManuallyEdited: false,
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    instagram: "",
    templateId: "mochi",
    tagline: "",
    paymentMethods: [],
  });
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [billingRedirecting, setBillingRedirecting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Restore form data from sessionStorage on mount ---
  // Always start from step 1 (plan selection); only restore form data
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.data) setData(parsed.data);
      }
    } catch (error) {
      console.error("Failed to restore onboarding state:", error);
    }
  }, []);

  // --- Save state to sessionStorage whenever it changes ---
  useEffect(() => {
    try {
      const state = { step, data };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save onboarding state:", error);
    }
  }, [step, data]);

  // --- Slug availability check ---
  const checkSlug = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value || value.length < 3) {
        setSlugStatus("idle");
        setSlugReason("");
        return;
      }

      if (!SLUG_REGEX.test(value)) {
        setSlugStatus("invalid");
        setSlugReason(labels.slugFormatError);
        return;
      }

      setSlugStatus("checking");
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/tenant/check-slug?slug=${encodeURIComponent(value)}`
          );
          const json = await res.json();

          if (!res.ok || !json.ok) {
            setSlugStatus("idle");
            setSlugReason("");
            return;
          }

          if (json.data?.available) {
            setSlugStatus("available");
            setSlugReason("");
          } else {
            setSlugStatus("taken");
            setSlugReason(json.data?.reason || labels.slugTaken);
          }
        } catch {
          setSlugStatus("idle");
        }
      }, 400);
    },
    [labels.slugFormatError, labels.slugTaken]
  );

  useEffect(() => {
    if (step === 2) checkSlug(data.slug);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [data.slug, checkSlug, step]);

  // --- Field update helper ---
  const update = <K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleNameChange = (value: string) => {
    update("shopName", value);
    if (!data.slugManuallyEdited) {
      update("slug", nameToSlug(value));
    }
  };

  const handleSlugChange = (raw: string) => {
    const v = raw.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setData((prev) => ({ ...prev, slug: v, slugManuallyEdited: true }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.slug;
      return next;
    });
  };

  const togglePaymentMethod = (methodId: string) => {
    setData((prev) => {
      const methods = prev.paymentMethods.includes(methodId)
        ? prev.paymentMethods.filter((m) => m !== methodId)
        : [...prev.paymentMethods, methodId];
      return { ...prev, paymentMethods: methods };
    });
  };

  // --- Step navigation ---
  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS) as OnboardingStep);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1) as OnboardingStep);
  };

  // --- Validation per step ---
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const name = data.shopName.trim();
    if (!name) newErrors.shopName = labels.required;
    else if (name.length < 2) newErrors.shopName = labels.nameMinError;
    else if (name.length > 50) newErrors.shopName = labels.nameMaxError;

    if (!data.slug.trim()) newErrors.slug = labels.required;
    else if (!SLUG_REGEX.test(data.slug))
      newErrors.slug = labels.slugFormatError;

    if (slugStatus === "taken" || slugStatus === "invalid") {
      newErrors.slug = slugReason || labels.slugFormatError;
    }

    if (!data.email.trim()) newErrors.email = labels.required;
    else if (!EMAIL_REGEX.test(data.email.trim()))
      newErrors.email = labels.emailFormatError;

    if (!data.password) newErrors.password = labels.required;
    else if (data.password.length < 8)
      newErrors.password = labels.passwordMinError;

    if (!data.confirmPassword) newErrors.confirmPassword = labels.required;
    else if (data.password !== data.confirmPassword)
      newErrors.confirmPassword = labels.passwordMismatch;

    if (data.whatsapp && !WHATSAPP_REGEX.test(data.whatsapp.trim()))
      newErrors.whatsapp = labels.whatsappFormatError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 2 && !validateStep2()) return;
    if (step === 2 && slugStatus === "checking") return;
    goNext();
  };

  // --- Submit registration at end of Step 4 ---
  const handleRegister = async (skipPayment = false) => {
    if (!validateStep2()) {
      setDirection(-1);
      setStep(2);
      return;
    }

    setSubmitting(true);
    setGlobalError("");

    const selectedPayments = skipPayment ? [] : data.paymentMethods;

    try {
      const res = await fetch("/api/tenant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.shopName.trim(),
          slug: data.slug.trim().toLowerCase(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
          whatsapp: data.whatsapp.trim() || undefined,
          instagram: data.instagram.trim().replace(/^@/, "") || undefined,
          templateId: data.templateId,
          tagline: data.tagline.trim() || undefined,
          paymentMethods: selectedPayments.length > 0 ? selectedPayments : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json.error?.message || json.error || labels.registerError;
        if (msg.includes("email") || msg.includes("電郵")) {
          setErrors((prev) => ({ ...prev, email: msg }));
          setDirection(-1);
          setStep(2);
        } else if (
          msg.includes("slug") ||
          msg.includes("Slug") ||
          msg.includes("名")
        ) {
          setErrors((prev) => ({ ...prev, slug: msg }));
          setDirection(-1);
          setStep(2);
        } else {
          setGlobalError(msg);
        }
        setSubmitting(false);
        return;
      }

      // Success → show step 5
      setCreatedSlug(json.data?.slug || data.slug);
      setSubmitting(false);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Failed to clear onboarding state:", error);
      }
      goNext();
    } catch {
      setGlobalError(labels.registerError);
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    const link = `https://wowlix.com/${createdSlug}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleLoginClick = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear onboarding state:", error);
    }
  };

  const handleSetupBilling = async () => {
    if (data.plan !== "lite" && data.plan !== "pro") return;
    setBillingRedirecting(true);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/admin/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: data.plan,
          successUrl: `${origin}/${locale}/admin/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
          cancelUrl: `${origin}/${locale}/admin/billing?cancelled=1`,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data?.url) {
        window.location.href = json.data.url;
        return;
      }
    } catch {
      // Fallback to billing page
    }
    setBillingRedirecting(false);
    window.location.href = `/${locale}/admin/billing`;
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-[16px] ${
      errors[field] ? "border-red-400" : "border-zinc-200"
    } focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400`;

  const selectedTemplate = COVER_TEMPLATES.find(
    (tmpl) => tmpl.id === data.templateId
  );

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Branding */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF9500] text-white text-2xl font-bold mb-3">
          W
        </div>
      </div>

      {/* Global error */}
      {globalError && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {globalError}
        </div>
      )}

      {/* Step content with slide animation */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 overflow-hidden relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* ======== STEP 1: Choose Plan ======== */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-zinc-900">
                    {labels.choosePlan}
                  </h1>
                  <p className="text-zinc-500 text-sm mt-1">
                    {labels.choosePlanSub}
                  </p>
                </div>

                {/* Plan cards */}
                <div className="space-y-3">
                  {plans.map((plan) => {
                    const isSelected = data.plan === plan.id;
                    const isDark = plan.id === "pro";
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => update("plan", plan.id)}
                        className={`w-full text-left rounded-xl border-2 p-4 transition-all duration-200 relative overflow-hidden ${
                          isSelected
                            ? "border-[#FF9500] ring-2 ring-[#FF9500]/20"
                            : isDark
                            ? "border-zinc-700 bg-zinc-900"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        } ${isDark && !isSelected ? "bg-zinc-900" : ""} ${
                          isDark && isSelected ? "bg-zinc-900 border-[#FF9500]" : ""
                        } ${plan.id === "lite" && !isSelected ? "bg-gradient-to-r from-orange-50 to-amber-50" : ""} ${
                          plan.id === "lite" && isSelected ? "bg-gradient-to-r from-orange-50 to-amber-50" : ""
                        }`}
                      >
                        {/* Badge */}
                        {plan.badge && (
                          <span className="absolute top-3 right-3 bg-[#FF9500] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {plan.badge}
                          </span>
                        )}

                        <div className="flex items-start gap-3">
                          {/* Radio indicator */}
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                              isSelected
                                ? "border-[#FF9500] bg-[#FF9500]"
                                : isDark
                                ? "border-zinc-500"
                                : "border-zinc-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span
                                className={`font-bold text-base ${
                                  isDark ? "text-white" : "text-zinc-900"
                                }`}
                              >
                                {plan.name}
                              </span>
                              <span className={`text-lg font-extrabold ${isDark ? "text-white" : "text-zinc-900"}`}>
                                ${plan.price}
                              </span>
                              <span className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                                {labels.month}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                              {plan.features.map((f, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}
                                >
                                  <span className="text-[#FF9500] mr-0.5">&#10003;</span> {f}
                                </span>
                              ))}
                            </div>
                            <p className={`text-[10px] mt-1.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                              {plan.footnote}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 0% platform fee badge */}
                <p className="text-center text-xs text-zinc-400">
                  {labels.zeroPlatformFee}
                </p>

                {/* Next button */}
                <button
                  onClick={goNext}
                  className="w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors min-h-[48px]"
                >
                  {labels.next} &rarr;
                </button>

                {/* Login link */}
                <p className="text-center text-sm text-zinc-500">
                  {labels.haveAccount}{" "}
                  <a
                    href={`/${locale}/admin/login`}
                    onClick={handleLoginClick}
                    className="text-[#FF9500] font-medium hover:underline"
                  >
                    {labels.login}
                  </a>
                </p>
              </div>
            )}

            {/* ======== STEP 2: Store Info + Account ======== */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {labels.storeInfo}
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    {labels.storeInfoSub}
                  </p>
                </div>

                {/* Store section */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {labels.storeSection}
                  </p>

                  {/* Store name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      {labels.storeName}
                    </label>
                    <input
                      type="text"
                      value={data.shopName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder={labels.storeNamePlaceholder}
                      maxLength={50}
                      className={inputClass("shopName")}
                    />
                    {errors.shopName && (
                      <p className="text-red-500 text-xs mt-1">{errors.shopName}</p>
                    )}
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      {labels.storeUrl}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
                        wowlix.com/
                      </span>
                      <input
                        type="text"
                        value={data.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        className={`w-full pl-[100px] pr-9 py-2.5 rounded-xl border text-[16px] ${
                          errors.slug ? "border-red-400" : "border-zinc-200"
                        } focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900`}
                        maxLength={30}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                        {slugStatus === "checking" && (
                          <span className="text-zinc-400 animate-pulse">...</span>
                        )}
                        {slugStatus === "available" && (
                          <span className="text-green-500">&#10003;</span>
                        )}
                        {(slugStatus === "taken" || slugStatus === "invalid") && (
                          <span className="text-red-500">&#10007;</span>
                        )}
                      </span>
                    </div>
                    {slugStatus === "available" && (
                      <p className="text-green-600 text-xs mt-1">{labels.slugAvailable}</p>
                    )}
                    {slugStatus === "checking" && (
                      <p className="text-zinc-400 text-xs mt-1">{labels.slugChecking}</p>
                    )}
                    {(slugStatus === "taken" || slugStatus === "invalid") && slugReason && (
                      <p className="text-red-500 text-xs mt-1">{slugReason}</p>
                    )}
                    {errors.slug && slugStatus !== "taken" && slugStatus !== "invalid" && (
                      <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100" />

                {/* Account section */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {labels.accountSection}
                  </p>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      {labels.email}
                    </label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder={labels.emailPlaceholder}
                      className={inputClass("email")}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {labels.password}
                      </label>
                      <input
                        type="password"
                        value={data.password}
                        onChange={(e) => update("password", e.target.value)}
                        placeholder={labels.passwordPlaceholder}
                        autoComplete="new-password"
                        className={inputClass("password")}
                      />
                      {errors.password && (
                        <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {labels.confirmPassword}
                      </label>
                      <input
                        type="password"
                        value={data.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        placeholder={labels.confirmPasswordPlaceholder}
                        autoComplete="new-password"
                        className={inputClass("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-100" />

                {/* Contact section */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {labels.contactSection}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {/* WhatsApp */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {labels.whatsapp}
                      </label>
                      <input
                        type="tel"
                        value={data.whatsapp}
                        onChange={(e) =>
                          update(
                            "whatsapp",
                            e.target.value.replace(/\D/g, "").slice(0, 8)
                          )
                        }
                        placeholder={labels.whatsappPlaceholder}
                        maxLength={8}
                        className={inputClass("whatsapp")}
                      />
                      {errors.whatsapp ? (
                        <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
                      ) : (
                        <p className="text-zinc-400 text-[10px] mt-0.5">{labels.whatsappHint}</p>
                      )}
                    </div>

                    {/* Instagram */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        {labels.instagram}
                      </label>
                      <input
                        type="text"
                        value={data.instagram}
                        onChange={(e) => update("instagram", e.target.value)}
                        placeholder={labels.instagramPlaceholder}
                        className={inputClass("instagram")}
                      />
                    </div>
                  </div>
                </div>

                {/* Nav buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={goBack}
                    type="button"
                    className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors min-h-[48px]"
                  >
                    &larr; {labels.back}
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={slugStatus === "checking"}
                    className="flex-1 py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {labels.next} &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ======== STEP 3: Theme ======== */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {labels.pickStyle}
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    {labels.pickStyleSub}
                  </p>
                </div>

                {/* Template preview gallery — 2x2 grid */}
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-3">
                    {labels.storeStyle}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {COVER_TEMPLATES.map((tmpl) => {
                      const isSelected = data.templateId === tmpl.id;
                      const shopInitial = data.shopName?.[0]?.toUpperCase() || "W";
                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => update("templateId", tmpl.id)}
                          className={`rounded-xl overflow-hidden border-2 transition-all duration-200 text-left ${
                            isSelected
                              ? "border-[#FF9500] ring-2 ring-[#FF9500]/30 scale-[1.02]"
                              : "border-zinc-200 hover:border-zinc-300"
                          }`}
                        >
                          {/* Mini storefront mockup */}
                          <div style={{ background: tmpl.bg }} className="p-0">
                            <div
                              className="h-8"
                              style={{ background: tmpl.headerGradient }}
                            />
                            <div className="px-2.5 pb-2.5 -mt-2.5">
                              <div className="flex items-center gap-1.5">
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0 border border-white/20"
                                  style={{ backgroundColor: tmpl.accent }}
                                >
                                  {shopInitial}
                                </div>
                                <span
                                  className="text-[9px] font-semibold truncate"
                                  style={{ color: tmpl.text }}
                                >
                                  {data.shopName || "My Shop"}
                                </span>
                              </div>
                              <div className="flex gap-1 mt-1.5">
                                {[1, 2, 3].map((i) => (
                                  <div
                                    key={i}
                                    className="flex-1 h-7"
                                    style={{
                                      backgroundColor: tmpl.card,
                                      borderRadius: tmpl.borderRadius.image,
                                      boxShadow: tmpl.shadow === "none" ? undefined : tmpl.shadow,
                                    }}
                                  />
                                ))}
                              </div>
                              <div
                                className="mt-1.5 h-4 w-2/3 mx-auto"
                                style={{
                                  borderRadius: tmpl.borderRadius.button,
                                  ...(tmpl.buttonStyle === "filled"
                                    ? { backgroundColor: tmpl.accent }
                                    : { border: `1px solid ${tmpl.accent}` }),
                                }}
                              />
                            </div>
                          </div>
                          <div className="bg-white px-2.5 py-2 border-t border-zinc-100">
                            <p className="text-xs font-semibold text-zinc-800">
                              {isZh ? tmpl.label : tmpl.labelEn}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {isZh ? tmpl.descZh : tmpl.descEn}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    {labels.taglineOptional}
                  </label>
                  <input
                    type="text"
                    value={data.tagline}
                    onChange={(e) => update("tagline", e.target.value)}
                    placeholder={labels.taglinePlaceholder}
                    maxLength={100}
                    className={inputClass("tagline")}
                  />
                  <p className="text-zinc-400 text-xs mt-1">
                    {labels.taglineSkipHint}
                  </p>
                </div>

                {/* Nav buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={goBack}
                    type="button"
                    className="flex-1 py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors min-h-[48px]"
                  >
                    &larr; {labels.back}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors min-h-[48px]"
                  >
                    {labels.next} &rarr;
                  </button>
                </div>
              </div>
            )}

            {/* ======== STEP 4: Payment Methods ======== */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {labels.setupPayment}
                  </h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    {labels.setupPaymentSub}
                  </p>
                </div>

                {/* Payment method cards — 2x2 grid */}
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.map((method) => {
                    const isSelected = data.paymentMethods.includes(method.id);
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => togglePaymentMethod(method.id)}
                        className={`rounded-xl border-2 p-3 text-left transition-all duration-200 ${
                          isSelected
                            ? "border-[#FF9500] bg-orange-50 ring-1 ring-[#FF9500]/20"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-2xl">{method.icon}</span>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-[#FF9500] bg-[#FF9500]"
                                : "border-zinc-300"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-sm text-zinc-900 mt-2">
                          {method.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          {method.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Nav buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleRegister(false)}
                    disabled={submitting || data.paymentMethods.length === 0}
                    className="w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {submitting ? labels.creating : `${labels.createStore} →`}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={goBack}
                      type="button"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      &larr; {labels.back}
                    </button>
                    <button
                      onClick={() => handleRegister(true)}
                      type="button"
                      disabled={submitting}
                      className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 font-medium text-sm hover:bg-zinc-50 transition-colors disabled:opacity-50"
                    >
                      {labels.skipPayment} &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======== STEP 5: Done ======== */}
            {step === 5 && (
              <div className="space-y-5 text-center">
                <div className="text-4xl">🎉</div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {labels.congrats}
                </h2>

                {/* Store preview card */}
                <div className="rounded-xl overflow-hidden border border-zinc-200">
                  <div
                    className="h-20"
                    style={{
                      background:
                        selectedTemplate?.headerGradient ||
                        "linear-gradient(135deg, #FFFFFF, #F0F5EE)",
                    }}
                  />
                  <div className="p-3 text-left">
                    <p className="font-semibold text-zinc-900">
                      {data.shopName}
                    </p>
                    {data.tagline && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {data.tagline}
                      </p>
                    )}
                  </div>
                </div>

                {/* Store link */}
                <div className="bg-zinc-50 rounded-xl px-4 py-3 border border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-1.5">
                    {labels.storeLink}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[#FF9500] font-semibold text-base">
                      wowlix.com/{createdSlug}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
                    >
                      {linkCopied ? labels.copied : labels.copyLink}
                    </button>
                  </div>
                </div>

                {/* Upgrade CTA for free users */}
                {data.plan === "free" && (
                  <div className="bg-gradient-to-b from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4 space-y-3">
                    <div className="text-center">
                      <p className="font-semibold text-zinc-900 text-sm">
                        {labels.upgradeCta}
                      </p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {labels.upgradeCtaDesc}
                      </p>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="bg-white rounded-lg p-2.5 border border-orange-100">
                        <p className="text-xs font-bold text-[#FF9500]">{labels.liteTag}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{labels.liteBenefitShort}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5 border border-orange-100">
                        <p className="text-xs font-bold text-zinc-900">{labels.proTag}</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">{labels.proBenefitShort}</p>
                      </div>
                    </div>
                    <a
                      href={`/${locale}/admin/billing`}
                      className="block w-full py-2.5 rounded-xl bg-[#FF9500] text-white font-semibold text-sm text-center hover:bg-[#E68600] transition-colors"
                    >
                      {labels.viewPlans} &rarr;
                    </a>
                  </div>
                )}

                {/* Billing CTA for paid plans */}
                {(data.plan === "lite" || data.plan === "pro") && (
                  <div className="space-y-2">
                    <button
                      onClick={handleSetupBilling}
                      disabled={billingRedirecting}
                      className="block w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors min-h-[48px] disabled:opacity-70"
                    >
                      {billingRedirecting
                        ? "..."
                        : `${labels.setupBilling} →`}
                    </button>
                    <p className="text-[11px] text-zinc-400">
                      {labels.setupBillingDesc
                        .replace("{plan}", data.plan === "pro" ? "Pro" : "Lite")
                        .replace("{price}", data.plan === "pro" ? "198" : "78")}
                    </p>
                  </div>
                )}

                {/* Main CTA: Open my store */}
                <a
                  href={`https://wowlix.com/${createdSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 rounded-xl font-semibold text-base transition-colors min-h-[48px] leading-[48px] ${
                    data.plan === "lite" || data.plan === "pro"
                      ? "border-2 border-[#FF9500] text-[#FF9500] hover:bg-[#FF9500]/5"
                      : "bg-[#FF9500] text-white hover:bg-[#E68600]"
                  }`}
                >
                  {labels.openMyStore} &rarr;
                </a>

                {/* Secondary CTA: Go to admin */}
                <a
                  href={`/${locale}/admin`}
                  className="block w-full py-3 rounded-xl border-2 border-zinc-200 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors min-h-[48px] leading-[48px]"
                >
                  {labels.goToAdmin} &rarr;
                </a>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <StepIndicator total={TOTAL_STEPS} current={step} locale={locale} />

      {/* Language toggle */}
      <div className="text-center mt-4">
        <a
          href={locale === "zh-HK" ? "/en/start" : "/zh-HK/start"}
          className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {locale === "zh-HK" ? "English" : "中文"}
        </a>
      </div>
    </div>
  );
}
