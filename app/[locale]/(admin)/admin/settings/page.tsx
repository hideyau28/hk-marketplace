"use client";

import { getDict, type Locale } from "@/lib/i18n";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Store, Undo2, MessageSquare, Phone, Clock, MapPin, Truck, CreditCard, Link2, Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SidebarToggle from "@/components/admin/SidebarToggle";

// --- Utility for Tailwind merging ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type StoreSettings = {
  id: string;
  storeName: string | null;
  storeNameEn: string | null;
  storeLogo: string | null;
  tagline: string | null;
  returnsPolicy: string | null;
  shippingPolicy: string | null;
  welcomePopupEnabled: boolean;
  welcomePopupTitle: string | null;
  welcomePopupSubtitle: string | null;
  welcomePopupPromoText: string | null;
  welcomePopupButtonText: string | null;
  whatsappNumber: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  openingHours: string | null;
  pickupHours: string | null;
  pickupAddress: string | null;
  pickupAddressZh: string | null;
  pickupAddressEn: string | null;
  shippingFee: number;
  freeShippingThreshold: number;
  homeDeliveryFee: number | null;
  homeDeliveryFreeAbove: number | null;
  homeDeliveryIslandExtra: number | null;
  sfLockerFee: number | null;
  sfLockerFreeAbove: number | null;
};

type DeliveryOption = {
  id: string;
  label: string;
  price: number;
  note: string;
  enabled: boolean;
};

type TenantSettings = {
  fpsEnabled: boolean;
  fpsAccountName: string;
  fpsAccountId: string;
  fpsQrCodeUrl: string;
  paymeEnabled: boolean;
  paymeLink: string;
  paymeQrCodeUrl: string;
  socialLinks: Array<{ url: string }>;
  deliveryOptions: DeliveryOption[];
};

const DEFAULT_TENANT_SETTINGS: TenantSettings = {
  fpsEnabled: false,
  fpsAccountName: "",
  fpsAccountId: "",
  fpsQrCodeUrl: "",
  paymeEnabled: false,
  paymeLink: "",
  paymeQrCodeUrl: "",
  socialLinks: [],
  deliveryOptions: [
    { id: "sf-locker", label: "SF 智能櫃", price: 0, note: "免運費", enabled: true },
    { id: "sf-cod", label: "順豐到付", price: 0, note: "到付運費", enabled: true },
    { id: "meetup", label: "面交", price: 0, note: "地點待確認", enabled: true },
  ],
};

type SaveState = "idle" | "saving" | "success" | "error";

const DEFAULT_SETTINGS: StoreSettings = {
  id: "default",
  storeName: "",
  storeNameEn: "",
  storeLogo: "",
  tagline: "",
  returnsPolicy: "",
  shippingPolicy: "",
  welcomePopupEnabled: true,
  welcomePopupTitle: "",
  welcomePopupSubtitle: "",
  welcomePopupPromoText: "",
  welcomePopupButtonText: "",
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  openingHours: "",
  pickupHours: "",
  pickupAddress: "",
  pickupAddressZh: "",
  pickupAddressEn: "",
  shippingFee: 40,
  freeShippingThreshold: 600,
  homeDeliveryFee: 40,
  homeDeliveryFreeAbove: 600,
  homeDeliveryIslandExtra: 20,
  sfLockerFee: 35,
  sfLockerFreeAbove: 600,
};

// --- UI Components (outside main component) ---
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("text-sm font-medium leading-none text-zinc-900", className)}>
      {children}
    </label>
  );
}

function Description({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.8rem] text-zinc-600 mt-1.5">{children}</p>;
}

// Simple controlled input - no memo needed, just stable DOM
function SettingsInput({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  step?: number;
}) {
  return (
    <input
      id={id}
      name={id}
      type={type}
      min={min}
      step={step}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete="off"
      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    />
  );
}

function SettingsTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      autoComplete="off"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
        className
      )}
    />
  );
}

export default function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  // Separate state: loaded data vs form data
  const [locale, setLocale] = useState<Locale>("zh-HK");
  const [formData, setFormData] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  // Tenant-level settings (payment, delivery, social)
  const [tenantData, setTenantData] = useState<TenantSettings>(DEFAULT_TENANT_SETTINGS);
  const [tenantSaveState, setTenantSaveState] = useState<SaveState>("idle");
  const [tenantError, setTenantError] = useState("");

  const t = useMemo(() => getDict(locale), [locale]);

  // Initialize locale from params - only once
  useEffect(() => {
    let mounted = true;
    params.then((p) => {
      if (mounted) {
        setLocale(p.locale as Locale);
      }
    });
    return () => { mounted = false; };
  }, []); // Empty deps - run only once on mount

  // Load settings ONCE on mount - separate from form state updates
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const res = await fetch("/api/store-settings");
        if (!res.ok) {
          if (res.status === 401) {
            setErrorMessage("Please log in to view settings");
          }
          setDataLoaded(true);
          return;
        }
        const data = await res.json();
        if (mounted && data.ok && data.data) {
          setFormData(data.data);
        }
      } catch {
        // Ignore errors
      } finally {
        if (mounted) {
          setDataLoaded(true);
        }
      }
    }

    loadData();
    return () => { mounted = false; };
  }, []); // Empty deps - load only once on mount

  // Load tenant settings (payment/delivery/social) on mount
  useEffect(() => {
    let mounted = true;
    async function loadTenantSettings() {
      try {
        const res = await fetch("/api/admin/tenant-settings");
        if (!res.ok) return;
        const data = await res.json();
        if (mounted && data.ok && data.data) {
          setTenantData({
            fpsEnabled: data.data.fpsEnabled ?? false,
            fpsAccountName: data.data.fpsAccountName ?? "",
            fpsAccountId: data.data.fpsAccountId ?? "",
            fpsQrCodeUrl: data.data.fpsQrCodeUrl ?? "",
            paymeEnabled: data.data.paymeEnabled ?? false,
            paymeLink: data.data.paymeLink ?? "",
            paymeQrCodeUrl: data.data.paymeQrCodeUrl ?? "",
            socialLinks: data.data.socialLinks ?? [],
            deliveryOptions: data.data.deliveryOptions ?? DEFAULT_TENANT_SETTINGS.deliveryOptions,
          });
        }
      } catch {
        // Ignore
      }
    }
    loadTenantSettings();
    return () => { mounted = false; };
  }, []);

  // Generic handler for text fields
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Handler for numeric fields
  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  }, []);

  // Handler for boolean toggle
  const toggleWelcomePopup = useCallback(() => {
    setFormData((prev) => ({ ...prev, welcomePopupEnabled: !prev.welcomePopupEnabled }));
  }, []);

  // --- Tenant settings handlers ---
  const handleTenantChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTenantData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleTenantBool = useCallback((field: keyof TenantSettings) => {
    setTenantData((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  // Social link handlers
  const addSocialLink = useCallback(() => {
    setTenantData((prev) => ({ ...prev, socialLinks: [...prev.socialLinks, { url: "" }] }));
  }, []);

  const updateSocialLink = useCallback((index: number, url: string) => {
    setTenantData((prev) => {
      const links = [...prev.socialLinks];
      links[index] = { url };
      return { ...prev, socialLinks: links };
    });
  }, []);

  const removeSocialLink = useCallback((index: number) => {
    setTenantData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));
  }, []);

  // Delivery option handlers
  const addDeliveryOption = useCallback(() => {
    setTenantData((prev) => ({
      ...prev,
      deliveryOptions: [
        ...prev.deliveryOptions,
        { id: `custom-${Date.now()}`, label: "", price: 0, note: "", enabled: true },
      ],
    }));
  }, []);

  const updateDeliveryOption = useCallback((index: number, field: string, value: string | number | boolean) => {
    setTenantData((prev) => {
      const options = [...prev.deliveryOptions];
      options[index] = { ...options[index], [field]: value };
      return { ...prev, deliveryOptions: options };
    });
  }, []);

  const removeDeliveryOption = useCallback((index: number) => {
    setTenantData((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.filter((_, i) => i !== index),
    }));
  }, []);

  // Save tenant settings
  const handleTenantSave = useCallback(async () => {
    setTenantSaveState("saving");
    setTenantError("");
    try {
      const res = await fetch("/api/admin/tenant-settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(tenantData),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setTenantSaveState("success");
        setTimeout(() => setTenantSaveState("idle"), 3000);
      } else {
        setTenantSaveState("error");
        setTenantError(data.error?.message || "儲存失敗");
      }
    } catch (err) {
      setTenantSaveState("error");
      setTenantError(err instanceof Error ? err.message : "Network error");
    }
  }, [tenantData]);

  // Save handler - only this syncs to server
  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMessage("");

    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveState("success");
        if (data.data) {
          setFormData(data.data);
        }
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        const errorCode = data.error?.code || "UNKNOWN";
        const errorMsg = data.error?.message || "Unknown error";
        if (res.status === 401) {
          setErrorMessage("Unauthorized: Please log in");
        } else if (res.status === 403) {
          setErrorMessage("Forbidden: Invalid credentials");
        } else {
          setErrorMessage(`${errorCode}: ${errorMsg}`);
        }
      }
    } catch (err) {
      setSaveState("error");
      setErrorMessage(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [formData]);

  // Show loading state
  if (!dataLoaded) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 text-zinc-900 pb-20">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{t.admin.settings.storeSettings}</h1>
            <p className="text-zinc-600 text-base max-w-lg">
              {locale === "zh-HK" ? "管理商店設定" : "Manage store settings"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {saveState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.div>
              )}
              {saveState === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-sm font-medium text-red-600"
                >
                  <AlertCircle className="h-4 w-4" /> {errorMessage || "Failed"}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
                saveState === "saving" && "opacity-80"
              )}
            >
              {saveState === "saving" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t.admin.common.loading}</>
              ) : (
                <><Save className="h-4 w-4" /> {t.admin.common.save}</>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* General Info */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-zinc-600" />
                General Information
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Basic details about your storefront branding.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>{t.admin.settings.storeName}</Label>
                <SettingsInput
                  id="storeName"
                  value={formData.storeName || ""}
                  onChange={handleChange}
                  placeholder="e.g. Yau Store"
                />
                <Description>Visible in the navigation bar and browser title.</Description>
              </div>

              <div className="space-y-3">
                <Label>{t.admin.settings.tagline}</Label>
                <SettingsInput
                  id="tagline"
                  value={formData.tagline || ""}
                  onChange={handleChange}
                  placeholder="e.g. Premium Tech & Lifestyle"
                />
                <Description>Featured prominently on the homepage hero section.</Description>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Undo2 className="h-5 w-5 text-zinc-600" />
                Store Policies
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Define how you handle shipping and returns.
              </p>
            </div>

            <div className="grid gap-8">
              <div className="space-y-3">
                <Label>{t.admin.settings.returnsPolicy}</Label>
                <SettingsTextarea
                  id="returnsPolicy"
                  value={formData.returnsPolicy || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. Items can be returned within 30 days..."
                  className="font-mono text-sm resize-y min-h-[120px]"
                />
                <Description>Displayed on product detail pages and during checkout.</Description>
              </div>

              <div className="space-y-3">
                <Label>{t.admin.settings.shippingPolicy}</Label>
                <SettingsTextarea
                  id="shippingPolicy"
                  value={formData.shippingPolicy || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. Standard shipping takes 3-5 business days..."
                  className="font-mono text-sm resize-y min-h-[120px]"
                />
                <Description>Inform customers about delivery times and costs.</Description>
              </div>
            </div>
          </div>

          {/* Store Identity */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Store className="h-5 w-5 text-zinc-600" />
                Store Identity
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Branding details for English-facing store identity.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Store Name (English)</Label>
                <SettingsInput
                  id="storeNameEn"
                  value={formData.storeNameEn || ""}
                  onChange={handleChange}
                  placeholder="e.g. Yau Store"
                />
              </div>

              <div className="space-y-3">
                <Label>Store Logo</Label>
                <SettingsInput
                  id="storeLogo"
                  value={formData.storeLogo || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.storeLogo ? (
                  <img src={formData.storeLogo} alt="Store logo preview" className="h-16 mt-2 rounded" />
                ) : null}
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-600" />
                Pickup Address
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Pickup address details in both Chinese and English.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Pickup Address (Chinese)</Label>
                <SettingsTextarea
                  id="pickupAddressZh"
                  value={formData.pickupAddressZh || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="例：九龍旺角彌敦道XXX號 XX大廈XX樓XX室"
                />
              </div>

              <div className="space-y-3">
                <Label>Pickup Address (English)</Label>
                <SettingsTextarea
                  id="pickupAddressEn"
                  value={formData.pickupAddressEn || ""}
                  onChange={handleChange}
                  rows={4}
                  placeholder="e.g. Unit XX, XX/F, XX Building, XXX Nathan Road, Mong Kok, Kowloon"
                />
              </div>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-zinc-600" />
                Shipping Settings
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Configure delivery fees and free shipping thresholds.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-zinc-800">Home Delivery (送貨上門)</h4>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label>Shipping Fee ($)</Label>
                    <SettingsInput
                      id="homeDeliveryFee"
                      type="number"
                      min={0}
                      step={0.01}
                      value={String(formData.homeDeliveryFee ?? "")}
                      onChange={handleNumericChange}
                      placeholder="40"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Free Shipping Above ($)</Label>
                    <SettingsInput
                      id="homeDeliveryFreeAbove"
                      type="number"
                      min={0}
                      step={0.01}
                      value={String(formData.homeDeliveryFreeAbove ?? "")}
                      onChange={handleNumericChange}
                      placeholder="600"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Outlying Islands Surcharge ($)</Label>
                    <SettingsInput
                      id="homeDeliveryIslandExtra"
                      type="number"
                      min={0}
                      step={0.01}
                      value={String(formData.homeDeliveryIslandExtra ?? "")}
                      onChange={handleNumericChange}
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-6 space-y-4">
                <h4 className="text-sm font-semibold text-zinc-800">SF Locker / Station (順豐智能櫃/站)</h4>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label>Shipping Fee ($)</Label>
                    <SettingsInput
                      id="sfLockerFee"
                      type="number"
                      min={0}
                      step={0.01}
                      value={String(formData.sfLockerFee ?? "")}
                      onChange={handleNumericChange}
                      placeholder="35"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Free Above ($)</Label>
                    <SettingsInput
                      id="sfLockerFreeAbove"
                      type="number"
                      min={0}
                      step={0.01}
                      value={String(formData.sfLockerFreeAbove ?? "")}
                      onChange={handleNumericChange}
                      placeholder="600"
                    />
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-600">
                Self-pickup is always free — no settings needed.
              </p>
            </div>
          </div>

          {/* Welcome Popup */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zinc-600" />
                Welcome Popup
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Configure the welcome popup for first-time visitors.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Welcome Popup Enabled</Label>
                  <Description>Show welcome popup to first-time visitors.</Description>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.welcomePopupEnabled}
                  onClick={toggleWelcomePopup}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                    formData.welcomePopupEnabled ? "bg-olive-600" : "bg-zinc-300"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                      formData.welcomePopupEnabled ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <Label>Welcome Popup Title</Label>
                <SettingsInput
                  id="welcomePopupTitle"
                  value={formData.welcomePopupTitle || ""}
                  onChange={handleChange}
                  placeholder="歡迎來到 HK•Market"
                />
                <Description>Main heading of the welcome popup.</Description>
              </div>

              <div className="space-y-3">
                <Label>Welcome Popup Subtitle</Label>
                <SettingsInput
                  id="welcomePopupSubtitle"
                  value={formData.welcomePopupSubtitle || ""}
                  onChange={handleChange}
                  placeholder="探索最新波鞋及運動裝備，正品保證！"
                />
                <Description>Subheading displayed below the title.</Description>
              </div>

              <div className="space-y-3">
                <Label>Welcome Popup Promo Text</Label>
                <SettingsInput
                  id="welcomePopupPromoText"
                  value={formData.welcomePopupPromoText || ""}
                  onChange={handleChange}
                  placeholder="🎉 訂單滿 $600 免運費！"
                />
                <Description>Promotional text shown in the highlighted box.</Description>
              </div>

              <div className="space-y-3">
                <Label>Welcome Popup Button Text</Label>
                <SettingsInput
                  id="welcomePopupButtonText"
                  value={formData.welcomePopupButtonText || ""}
                  onChange={handleChange}
                  placeholder="開始購物"
                />
                <Description>Text on the call-to-action button.</Description>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Phone className="h-5 w-5 text-zinc-600" />
                Contact Information
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Social media and contact details for customers.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <Label>WhatsApp Number</Label>
                <SettingsInput
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ""}
                  onChange={handleChange}
                  placeholder="+852 1234 5678"
                />
                <Description>Include country code (+852).</Description>
              </div>

              <div className="space-y-3">
                <Label>Instagram URL</Label>
                <SettingsInput
                  id="instagramUrl"
                  value={formData.instagramUrl || ""}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourstore"
                />
                <Description>Full Instagram profile URL.</Description>
              </div>

              <div className="space-y-3">
                <Label>Facebook URL</Label>
                <SettingsInput
                  id="facebookUrl"
                  value={formData.facebookUrl || ""}
                  onChange={handleChange}
                  placeholder="https://facebook.com/yourstore"
                />
                <Description>Full Facebook page URL.</Description>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-zinc-600" />
                Business Hours
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Store opening hours and pickup availability.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Opening Hours</Label>
                <SettingsTextarea
                  id="openingHours"
                  value={formData.openingHours || ""}
                  onChange={handleChange}
                  placeholder="星期一至五: 10:00 - 20:00&#10;星期六日: 12:00 - 18:00"
                  rows={3}
                />
                <Description>General store operating hours.</Description>
              </div>

              <div className="space-y-3">
                <Label>Pickup Hours</Label>
                <SettingsTextarea
                  id="pickupHours"
                  value={formData.pickupHours || ""}
                  onChange={handleChange}
                  placeholder="星期一至五: 14:00 - 19:00&#10;星期六: 14:00 - 17:00"
                  rows={3}
                />
                <Description>Hours when customers can pick up orders.</Description>
              </div>
            </div>
          </div>

          {/* Pickup Address */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-600" />
                Pickup Address
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Location where customers can collect their orders.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Pickup Address</Label>
              <SettingsTextarea
                id="pickupAddress"
                value={formData.pickupAddress || ""}
                onChange={handleChange}
                placeholder="九龍旺角彌敦道XXX號&#10;XX大廈XX樓XX室"
                rows={3}
              />
              <Description>Full address for order pickup location.</Description>
            </div>
          </div>

          {/* Shipping Settings */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-zinc-600" />
                Shipping Settings
              </h3>
              <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                Configure shipping fees and free shipping threshold.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Shipping Fee ($)</Label>
                <SettingsInput
                  id="shippingFee"
                  type="number"
                  min={0}
                  step={1}
                  value={String(formData.shippingFee)}
                  onChange={handleNumericChange}
                  placeholder="40"
                />
                <Description>Standard shipping fee in HKD. Default: $40</Description>
              </div>

              <div className="space-y-3">
                <Label>Free Shipping Threshold ($)</Label>
                <SettingsInput
                  id="freeShippingThreshold"
                  type="number"
                  min={0}
                  step={1}
                  value={String(formData.freeShippingThreshold)}
                  onChange={handleNumericChange}
                  placeholder="600"
                />
                <Description>Orders above this amount get free shipping. Default: $600</Description>
              </div>
            </div>
          </div>
        </div>

        {/* === Tenant BioLink Settings === */}
        <div className="mt-12 pt-8 border-t-2 border-zinc-300">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">BioLink 商店設定</h2>
              <p className="text-zinc-600 text-sm">付款方式、送貨方式、社交連結</p>
            </div>
            <div className="flex items-center gap-4">
              <AnimatePresence mode="wait">
                {tenantSaveState === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4" /> 已儲存
                  </motion.div>
                )}
                {tenantSaveState === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-sm font-medium text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" /> {tenantError || "Failed"}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleTenantSave}
                disabled={tenantSaveState === "saving"}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50",
                  tenantSaveState === "saving" && "opacity-80"
                )}
              >
                {tenantSaveState === "saving" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> 儲存中...</>
                ) : (
                  <><Save className="h-4 w-4" /> 儲存</>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-zinc-600" />
                  付款方式
                </h3>
                <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                  設定 BioLink 落單嘅付款方式
                </p>
              </div>

              {/* FPS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>FPS 轉數快</Label>
                    <Description>客人可以用 FPS 轉帳付款</Description>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tenantData.fpsEnabled}
                    onClick={() => toggleTenantBool("fpsEnabled")}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      tenantData.fpsEnabled ? "bg-emerald-500" : "bg-zinc-300"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                      tenantData.fpsEnabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
                {tenantData.fpsEnabled && (
                  <div className="grid gap-4 md:grid-cols-3 pl-4 border-l-2 border-emerald-200">
                    <div className="space-y-2">
                      <Label>FPS 帳戶名</Label>
                      <SettingsInput
                        id="fpsAccountName"
                        value={tenantData.fpsAccountName}
                        onChange={handleTenantChange}
                        placeholder="e.g. Chan Tai Man"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>FPS ID</Label>
                      <SettingsInput
                        id="fpsAccountId"
                        value={tenantData.fpsAccountId}
                        onChange={handleTenantChange}
                        placeholder="e.g. 12345678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QR Code URL</Label>
                      <SettingsInput
                        id="fpsQrCodeUrl"
                        value={tenantData.fpsQrCodeUrl}
                        onChange={handleTenantChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PayMe */}
              <div className="space-y-4 border-t border-zinc-200 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>PayMe</Label>
                    <Description>客人可以用 PayMe 付款</Description>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tenantData.paymeEnabled}
                    onClick={() => toggleTenantBool("paymeEnabled")}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      tenantData.paymeEnabled ? "bg-emerald-500" : "bg-zinc-300"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transition-transform",
                      tenantData.paymeEnabled ? "translate-x-5" : "translate-x-0"
                    )} />
                  </button>
                </div>
                {tenantData.paymeEnabled && (
                  <div className="grid gap-4 md:grid-cols-2 pl-4 border-l-2 border-emerald-200">
                    <div className="space-y-2">
                      <Label>PayMe Link</Label>
                      <SettingsInput
                        id="paymeLink"
                        value={tenantData.paymeLink}
                        onChange={handleTenantChange}
                        placeholder="https://payme.hsbc.com.hk/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QR Code URL</Label>
                      <SettingsInput
                        id="paymeQrCodeUrl"
                        value={tenantData.paymeQrCodeUrl}
                        onChange={handleTenantChange}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Delivery Options */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-zinc-600" />
                  送貨方式
                </h3>
                <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                  設定 BioLink 落單嘅送貨選項
                </p>
              </div>

              <div className="space-y-3">
                {tenantData.deliveryOptions.map((opt, i) => (
                  <div key={opt.id} className="flex items-start gap-3 bg-white rounded-lg border border-zinc-200 p-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={opt.enabled}
                      onClick={() => updateDeliveryOption(i, "enabled", !opt.enabled)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors mt-1",
                        opt.enabled ? "bg-emerald-500" : "bg-zinc-300"
                      )}
                    >
                      <span className={cn(
                        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform",
                        opt.enabled ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                    <div className="flex-1 grid gap-3 md:grid-cols-3">
                      <div>
                        <input
                          value={opt.label}
                          onChange={(e) => updateDeliveryOption(i, "label", e.target.value)}
                          placeholder="送貨方式名稱"
                          className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={opt.price}
                          onChange={(e) => updateDeliveryOption(i, "price", Number(e.target.value) || 0)}
                          placeholder="運費"
                          min={0}
                          className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        />
                      </div>
                      <div>
                        <input
                          value={opt.note}
                          onChange={(e) => updateDeliveryOption(i, "note", e.target.value)}
                          placeholder="備註"
                          className="flex h-9 w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeliveryOption(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="移除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addDeliveryOption}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Plus className="h-4 w-4" /> 新增送貨方式
              </button>
            </div>

            {/* Social Links */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-zinc-600" />
                  社交連結
                </h3>
                <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                  貼上 URL，系統自動識別平台並顯示對應 icon
                </p>
              </div>

              <div className="space-y-3">
                {tenantData.socialLinks.map((link, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      value={link.url}
                      onChange={(e) => updateSocialLink(i, e.target.value)}
                      placeholder="https://instagram.com/yourshop"
                      className="flex h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                    />
                    <button
                      onClick={() => removeSocialLink(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                      title="移除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addSocialLink}
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                <Plus className="h-4 w-4" /> 新增連結
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
