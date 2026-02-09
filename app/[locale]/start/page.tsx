"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Bilingual text
const t = {
  en: {
    heading: "Create your store",
    subheading: "Set up your online store in seconds",
    storeName: "Store Name",
    storeNamePlaceholder: "e.g. May's Fashion",
    slug: "Store URL",
    slugChecking: "Checking...",
    slugAvailable: "Available!",
    whatsapp: "WhatsApp Number",
    whatsappPlaceholder: "e.g. 91234567",
    whatsappHint: "8-digit HK number",
    email: "Email",
    emailPlaceholder: "e.g. you@example.com",
    submit: "Create Store",
    submitting: "Creating...",
    required: "Required",
    slugFormatError: "3-30 chars, lowercase letters, numbers & hyphens only",
    whatsappFormatError: "Must be 8 digits",
    emailFormatError: "Invalid email format",
    nameMinError: "At least 2 characters",
    nameMaxError: "Maximum 50 characters",
  },
  "zh-HK": {
    heading: "開設你嘅網店",
    subheading: "幾秒鐘就開到自己嘅網店",
    storeName: "店名",
    storeNamePlaceholder: "例如：May's Fashion",
    slug: "店舖網址",
    slugChecking: "檢查中...",
    slugAvailable: "可以用！",
    whatsapp: "WhatsApp 號碼",
    whatsappPlaceholder: "例如 91234567",
    whatsappHint: "8 位香港號碼",
    email: "電郵地址",
    emailPlaceholder: "例如 you@example.com",
    submit: "開店",
    submitting: "建立中...",
    required: "必填",
    slugFormatError: "3-30 個字，只可以用細楷英文、數字同連字號",
    whatsappFormatError: "需要 8 位數字",
    emailFormatError: "電郵格式唔啱",
    nameMinError: "最少 2 個字",
    nameMaxError: "最多 50 個字",
  },
} as const;

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

export default function StartPage() {
  const params = useParams();
  const locale = ((params?.locale as string) || "en") as Locale;
  const labels = locale === "zh-HK" ? t["zh-HK"] : t.en;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-generate slug from name
  const handleNameChange = useCallback(
    (value: string) => {
      setName(value);
      if (!slugManuallyEdited) {
        setSlug(nameToSlug(value));
      }
    },
    [slugManuallyEdited]
  );

  // Debounced slug availability check
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
          const res = await fetch(`/api/tenant/check-slug?slug=${encodeURIComponent(value)}`);
          const json = await res.json();
          if (json.data?.available) {
            setSlugStatus("available");
            setSlugReason("");
          } else {
            setSlugStatus("taken");
            setSlugReason(json.data?.reason || "");
          }
        } catch {
          setSlugStatus("idle");
        }
      }, 400);
    },
    [labels.slugFormatError]
  );

  // Trigger check when slug changes
  useEffect(() => {
    checkSlug(slug);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [slug, checkSlug]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = labels.required;
    else if (name.trim().length < 2) newErrors.name = labels.nameMinError;
    else if (name.trim().length > 50) newErrors.name = labels.nameMaxError;

    if (!slug.trim()) newErrors.slug = labels.required;
    else if (!SLUG_REGEX.test(slug)) newErrors.slug = labels.slugFormatError;

    if (!whatsapp.trim()) newErrors.whatsapp = labels.required;
    else if (!WHATSAPP_REGEX.test(whatsapp.trim())) newErrors.whatsapp = labels.whatsappFormatError;

    if (!email.trim()) newErrors.email = labels.required;
    else if (!EMAIL_REGEX.test(email.trim())) newErrors.email = labels.emailFormatError;

    if (slugStatus === "taken" || slugStatus === "invalid") {
      newErrors.slug = slugReason || labels.slugFormatError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");

    if (!validate()) return;
    if (slugStatus === "checking") return; // wait for check

    setSubmitting(true);

    try {
      const res = await fetch("/api/tenant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          whatsapp: whatsapp.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        const msg = json.error?.message || json.error || "Registration failed";
        // Map specific errors to fields
        if (msg.includes("email")) {
          setErrors((prev) => ({ ...prev, email: msg }));
        } else if (msg.includes("名") || msg.includes("slug") || msg.includes("Slug")) {
          setErrors((prev) => ({ ...prev, slug: msg }));
        } else {
          setGlobalError(msg);
        }
        setSubmitting(false);
        return;
      }

      // Success — redirect to admin dashboard
      window.location.href = `/${locale}/admin?welcome=1`;
    } catch {
      setGlobalError("Network error, please try again");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FF9500] text-white text-2xl font-bold mb-4">
            W
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">{labels.heading}</h1>
          <p className="text-zinc-500 mt-1">{labels.subheading}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 space-y-5">
          {globalError && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3">
              {globalError}
            </div>
          )}

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{labels.storeName}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder={labels.storeNamePlaceholder}
              maxLength={50}
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.name ? "border-red-400" : "border-zinc-200"} focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{labels.slug}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm select-none">
                wowlix.com/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  setSlug(v);
                  setSlugManuallyEdited(true);
                }}
                className={`w-full pl-[100px] pr-9 py-2.5 rounded-xl border ${errors.slug ? "border-red-400" : "border-zinc-200"} focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900`}
                maxLength={30}
              />
              {/* Status icon */}
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

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{labels.whatsapp}</label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder={labels.whatsappPlaceholder}
              maxLength={8}
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.whatsapp ? "border-red-400" : "border-zinc-200"} focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400`}
            />
            <p className="text-zinc-400 text-xs mt-1">{labels.whatsappHint}</p>
            {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">{labels.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.emailPlaceholder}
              className={`w-full px-3 py-2.5 rounded-xl border ${errors.email ? "border-red-400" : "border-zinc-200"} focus:outline-none focus:ring-2 focus:ring-[#FF9500]/30 focus:border-[#FF9500] text-zinc-900 placeholder:text-zinc-400`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || slugStatus === "checking"}
            className="w-full py-3 rounded-xl bg-[#FF9500] text-white font-semibold text-base hover:bg-[#E68600] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? labels.submitting : labels.submit}
          </button>
        </form>

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
    </div>
  );
}
