"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import StepIndicator from "./StepIndicator";
import { COVER_TEMPLATES } from "@/lib/cover-templates";
import type { Locale } from "@/lib/i18n";

// --- Bilingual labels ---
const t = {
  en: {
    // Step 1
    welcome: "Start your online store",
    welcomeSub: "Done in 2 minutes!",
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
    next: "Next",
    // Step 2
    loginDetails: "Login Details",
    email: "Email *",
    emailPlaceholder: "e.g. hello@myshop.com",
    emailFormatError: "Invalid email format",
    password: "Password *",
    passwordPlaceholder: "At least 8 characters",
    passwordMinError: "At least 8 characters",
    whatsapp: "WhatsApp (optional)",
    whatsappPlaceholder: "e.g. 91234567",
    whatsappHint: "8-digit HK number",
    whatsappFormatError: "Must be 8 digits",
    confirmPassword: "Confirm Password *",
    confirmPasswordPlaceholder: "Re-enter your password",
    passwordMismatch: "Passwords do not match",
    back: "Back",
    // Step 3
    pickStyle: "Pick a style",
    storeStyle: "Store style",
    logoOptional: "Logo (optional)",
    uploadLogo: "Upload",
    taglineOptional: "Tagline (optional)",
    taglinePlaceholder: "e.g. Artisan Oolong Tea Shop",
    // Step 4
    congrats: "Your store is ready!",
    storeLink: "Your store link:",
    copied: "Copied!",
    copyLink: "Copy",
    loginEmail: "Login Email",
    addFirstProduct: "Add your first product",
    shareToIG: "Share to Instagram",
    creating: "Creating your store...",
    // Errors
    registerError: "Registration failed, please try again",
    haveAccount: "Already have an account?",
    login: "Log in",
  },
  "zh-HK": {
    // Step 1
    welcome: "開始你嘅網店",
    welcomeSub: "2 分鐘搞掂！",
    storeName: "店舖名稱 *",
    storeNamePlaceholder: "例如：May's Fashion",
    storeUrl: "店舖網址",
    slugChecking: "檢查中...",
    slugAvailable: "可以用！",
    slugTaken: "已被使用",
    slugFormatError: "3-30 個字，只可以用細楷英文、數字同連字號",
    nameMinError: "最少 2 個字",
    nameMaxError: "最多 50 個字",
    required: "必填",
    next: "下一步",
    // Step 2
    loginDetails: "登入資料",
    email: "電郵地址 *",
    emailPlaceholder: "例如 hello@myshop.com",
    emailFormatError: "電郵格式唔啱",
    password: "密碼 *",
    passwordPlaceholder: "最少 8 個字",
    passwordMinError: "最少 8 個字",
    whatsapp: "WhatsApp（可選）",
    whatsappPlaceholder: "例如 91234567",
    whatsappHint: "8 位香港號碼",
    whatsappFormatError: "需要 8 位數字",
    confirmPassword: "確認密碼 *",
    confirmPasswordPlaceholder: "再輸入一次密碼",
    passwordMismatch: "密碼不一致",
    back: "返回",
    // Step 3
    pickStyle: "揀個風格",
    storeStyle: "店舖風格",
    logoOptional: "頭像（可選）",
    uploadLogo: "上傳",
    taglineOptional: "簡介（選填）",
    taglinePlaceholder: "例如：手工烏龍茶專門店",
    // Step 4
    congrats: "你嘅小店開好喇！",
    storeLink: "你嘅店舖連結：",
    copied: "已複製！",
    copyLink: "複製",
    loginEmail: "登入 Email",
    addFirstProduct: "加第一件商品",
    shareToIG: "分享到 Instagram",
    creating: "建立緊你嘅小店...",
    // Errors
    registerError: "註冊失敗，請再試",
    haveAccount: "已有帳號？",
    login: "登入",
  },
} as const;

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

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  shopName: string;
  slug: string;
  slugManuallyEdited: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  whatsapp: string;
  templateId: string;
  tagline: string;
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

export default function OnboardingWizard({ locale }: OnboardingWizardProps) {
  const labels = locale === "zh-HK" ? t["zh-HK"] : t.en;

  const [step, setStep] = useState<OnboardingStep>(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    shopName: "",
    slug: "",
    slugManuallyEdited: false,
    email: "",
    password: "",
    confirmPassword: "",
    whatsapp: "",
    templateId: "mochi",
    tagline: "",
  });
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdSlug, setCreatedSlug] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [igToast, setIgToast] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Restore state from sessionStorage on mount ---
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.step) setStep(parsed.step);
        if (parsed.data) setData(parsed.data);
      }
    } catch (error) {
      // Ignore invalid JSON or missing data
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

          // Handle API errors - if response is not ok or json.ok is false, don't treat as "taken"
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
    if (step === 1) checkSlug(data.slug);
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

  // --- Step navigation ---
  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4) as OnboardingStep);
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1) as OnboardingStep);
  };

  // --- Validation per step ---
  const validateStep1 = (): boolean => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

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
    if (step === 1 && !validateStep1()) return;
    if (step === 1 && slugStatus === "checking") return;
    if (step === 2 && !validateStep2()) return;
    goNext();
  };

  // --- Submit registration at end of Step 3 ---
  const handleRegister = async () => {
    if (!validateStep2()) {
      // Go back to step 2 if data is somehow invalid
      setDirection(-1);
      setStep(2);
      return;
    }

    setSubmitting(true);
    setGlobalError("");

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
          templateId: data.templateId,
          tagline: data.tagline.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg =
          json.error?.message || json.error || labels.registerError;
        // Map known field errors
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
          setStep(1);
        } else {
          setGlobalError(msg);
        }
        setSubmitting(false);
        return;
      }

      // Success → show step 4
      setCreatedSlug(json.data?.slug || data.slug);
      setSubmitting(false);
      // Clear saved state after successful registration
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
      // Fallback: select + copy
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

  const handleShareIG = async () => {
    const link = `https://wowlix.com/${createdSlug}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const el = document.createElement("textarea");
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setIgToast(true);
    setTimeout(() => setIgToast(false), 2500);
    // Attempt to open Instagram app
    window.location.href = "instagram://";
  };

  // Clear state when user clicks login (they're abandoning registration)
  const handleLoginClick = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear onboarding state:", error);
    }
  };

  const inputClass = (field: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-[16px] ${
      errors[field] ? "border-red-400" : "border-zinc-200"
    } focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400`;

  const selectedTemplate = COVER_TEMPLATES.find(
    (t) => t.id === data.templateId
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
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 overflow-hidden relative min-h-[340px]">
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
            {/* ======== STEP 1: Welcome + Store name ======== */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <h1 className="text-xl font-bold text-zinc-900">
                    {labels.welcome}
                  </h1>
                  <p className="text-zinc-500 text-sm mt-1">
                    {labels.welcomeSub}
                  </p>
                </div>

                {/* Store name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.shopName}
                    </p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                    <p className="text-green-600 text-xs mt-1">
                      {labels.slugAvailable}
                    </p>
                  )}
                  {slugStatus === "checking" && (
                    <p className="text-zinc-400 text-xs mt-1">
                      {labels.slugChecking}
                    </p>
                  )}
                  {(slugStatus === "taken" || slugStatus === "invalid") &&
                    slugReason && (
                      <p className="text-red-500 text-xs mt-1">{slugReason}</p>
                    )}
                  {errors.slug &&
                    slugStatus !== "taken" &&
                    slugStatus !== "invalid" && (
                      <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                    )}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  disabled={slugStatus === "checking"}
                  className="w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
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

            {/* ======== STEP 2: Login details ======== */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-zinc-900 text-center">
                  {labels.loginDetails}
                </h2>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* WhatsApp (optional) */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
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
                  <p className="text-zinc-400 text-xs mt-1">
                    {labels.whatsappHint}
                  </p>
                  {errors.whatsapp && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.whatsapp}
                    </p>
                  )}
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

            {/* ======== STEP 3: Store appearance ======== */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-xl font-bold text-zinc-900 text-center">
                  {labels.pickStyle}
                </h2>

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
                            {/* Header gradient band */}
                            <div
                              className="h-8"
                              style={{ background: tmpl.headerGradient }}
                            />
                            {/* Body area */}
                            <div className="px-2.5 pb-2.5 -mt-2.5">
                              {/* Avatar + shop name */}
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
                              {/* Mock product cards */}
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
                              {/* Mock button */}
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
                          {/* Template label + description */}
                          <div className="bg-white px-2.5 py-2 border-t border-zinc-100">
                            <p className="text-xs font-semibold text-zinc-800">
                              {locale === "zh-HK" ? tmpl.label : tmpl.labelEn}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              {locale === "zh-HK" ? tmpl.descZh : tmpl.descEn}
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
                    onClick={handleRegister}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                  >
                    {submitting ? labels.creating : `${labels.next} →`}
                  </button>
                </div>
              </div>
            )}

            {/* ======== STEP 4: Done ======== */}
            {step === 4 && (
              <div className="space-y-5 text-center">
                <div className="text-4xl">🎉</div>
                <h2 className="text-xl font-bold text-zinc-900">
                  {labels.congrats}
                </h2>

                {/* Login email */}
                <div>
                  <p className="text-lg font-semibold text-zinc-900">{data.email}</p>
                  <p className="text-sm text-zinc-500">{labels.loginEmail}</p>
                </div>

                {/* Store preview card */}
                <div className="rounded-xl overflow-hidden border border-zinc-200">
                  <div
                    className="h-20"
                    style={{ background: selectedTemplate?.headerGradient || "linear-gradient(135deg, #FFFFFF, #F0F5EE)" }}
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
                <div>
                  <p className="text-sm text-zinc-500 mb-1">
                    {labels.storeLink}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[#FF9500] font-medium text-sm">
                      wowlix.com/{createdSlug}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className="text-xs px-2 py-1 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors"
                    >
                      {linkCopied ? labels.copied : labels.copyLink}
                    </button>
                  </div>
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <a
                    href={`/${locale}/admin?welcome=1`}
                    className="block w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors min-h-[48px] leading-[48px]"
                  >
                    {labels.addFirstProduct} &rarr;
                  </a>
                  <button
                    onClick={handleShareIG}
                    className="w-full py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-base hover:bg-zinc-50 transition-colors min-h-[48px]"
                  >
                    {labels.shareToIG}
                  </button>
                </div>

                {/* IG toast */}
                {igToast && (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-zinc-800 px-4 py-2 text-sm text-white shadow-lg">
                    {labels.copied} {locale === "zh-HK" ? "可以貼到 IG 啦" : "Paste your link on Instagram"}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step indicator */}
      <StepIndicator total={4} current={step} />

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
