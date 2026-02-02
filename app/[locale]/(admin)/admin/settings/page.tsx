"use client";

import { getDict, type Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle, Store, Undo2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SidebarToggle from "@/components/admin/SidebarToggle";

// --- Utility for Tailwind merging (simulating shadcn cn()) ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types (Preserved) ---
type StoreSettings = {
  id: string;
  storeName: string | null;
  tagline: string | null;
  returnsPolicy: string | null;
  shippingPolicy: string | null;
  welcomePopupEnabled: boolean;
  welcomePopupTitle: string | null;
  welcomePopupSubtitle: string | null;
  welcomePopupPromoText: string | null;
  welcomePopupButtonText: string | null;
};

type SaveState = "idle" | "saving" | "success" | "error";

export default function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  // --- Logic State (Preserved) ---
  const [locale, setLocale] = useState<Locale>("en");
  const [settings, setSettings] = useState<StoreSettings>({
    id: "default",
    storeName: "",
    tagline: "",
    returnsPolicy: "",
    shippingPolicy: "",
    welcomePopupEnabled: true,
    welcomePopupTitle: "",
    welcomePopupSubtitle: "",
    welcomePopupPromoText: "",
    welcomePopupButtonText: "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestId, setRequestId] = useState("");

  const t = getDict(locale);

  // --- Effects (Preserved) ---
  useEffect(() => {
    params.then((p) => setLocale(p.locale as Locale));
  }, [params]);

  useEffect(() => {
    loadSettings();
  }, []);

  // --- Functions (Preserved Logic) ---
  async function loadSettings() {
    try {
      const res = await fetch("/api/store-settings");

      if (!res.ok) {
        if (res.status === 401) {
          setErrorMessage("Please log in to view settings");
        }
        return;
      }

      const data = await res.json();
      if (data.ok && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      // Silent fail on load
    }
  }

  async function handleSave() {
    setSaveState("saving");
    setErrorMessage("");
    setRequestId("");

    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setSaveState("success");
        if (data.data) {
          setSettings(data.data);
        }
        setTimeout(() => setSaveState("idle"), 3000);
      } else {
        setSaveState("error");
        const errorCode = data.error?.code || "UNKNOWN";
        const errorMsg = data.error?.message || "Unknown error";
        setRequestId(data.requestId || "");

        if (res.status === 401) {
          setErrorMessage("Unauthorized: Missing or invalid admin credentials");
        } else if (res.status === 403) {
          setErrorMessage("Forbidden: Invalid admin credentials");
        } else if (res.status === 409) {
          setErrorMessage(`Conflict: ${errorMsg} (${errorCode})`);
        } else {
          setErrorMessage(`${errorCode}: ${errorMsg}`);
        }
      }
    } catch (err) {
      setSaveState("error");
      setErrorMessage(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // --- UI Components ---

  const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-900", className)}>
      {children}
    </label>
  );

  const Description = ({ children }: { children: React.ReactNode }) => (
    <p className="text-[0.8rem] text-zinc-600 mt-1.5">
      {children}
    </p>
  );

  const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );

  const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 ring-offset-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );

  return (
    <div className="bg-zinc-50 text-zinc-900 pb-20">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Sidebar Toggle */}
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{t.admin.settings.storeSettings}</h1>
            <p className="text-zinc-600 text-base max-w-lg">
              {locale === "zh-HK" ? "管理商店設定" : "Manage store settings"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicators */}
            <AnimatePresence mode="wait">
              {saveState === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4" /> Saved
                </motion.div>
              )}
              {saveState === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400"
                >
                  <AlertCircle className="h-4 w-4" /> Failed
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
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t.admin.common.loading}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {t.admin.common.save}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">

          {/* Main Settings Form */}
          <div className={cn("grid gap-6 transition-opacity duration-300")}>

            {/* General Info Card */}
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
                  <Input
                    value={settings.storeName || ""}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    placeholder="e.g. Yau Store"
                  />
                  <Description>Visible in the navigation bar and browser title.</Description>
                </div>

                <div className="space-y-3">
                  <Label>{t.admin.settings.tagline}</Label>
                  <Input
                    value={settings.tagline || ""}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="e.g. Premium Tech & Lifestyle"
                  />
                  <Description>Featured prominently on the homepage hero section.</Description>
                </div>
              </div>
            </div>

            {/* Policies Card */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Undo2 className="h-5 w-5 text-zinc-600" />
                  Store Policies
                </h3>
                <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                  Define how you handle shipping and returns for your customers.
                </p>
              </div>

              <div className="grid gap-8">
                <div className="space-y-3">
                  <Label>{t.admin.settings.returnsPolicy}</Label>
                  <Textarea
                    value={settings.returnsPolicy || ""}
                    onChange={(e) => setSettings({ ...settings, returnsPolicy: e.target.value })}
                    rows={4}
                    placeholder="e.g. Items can be returned within 30 days of delivery..."
                    className="font-mono text-sm resize-y min-h-[120px]"
                  />
                  <Description>Displayed on product detail pages and during checkout.</Description>
                </div>

                <div className="space-y-3">
                  <Label>{t.admin.settings.shippingPolicy}</Label>
                  <Textarea
                    value={settings.shippingPolicy || ""}
                    onChange={(e) => setSettings({ ...settings, shippingPolicy: e.target.value })}
                    rows={4}
                    placeholder="e.g. Standard shipping takes 3-5 business days..."
                    className="font-mono text-sm resize-y min-h-[120px]"
                  />
                  <Description>Inform customers about delivery times and costs.</Description>
                </div>
              </div>
            </div>

            {/* Welcome Popup Card */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 md:p-8 space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-zinc-600" />
                  Welcome Popup
                </h3>
                <p className="text-sm text-zinc-600 mt-1 border-b border-zinc-200 pb-4">
                  Configure the welcome popup shown to first-time visitors.
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
                    aria-checked={settings.welcomePopupEnabled}
                    onClick={() => setSettings({ ...settings, welcomePopupEnabled: !settings.welcomePopupEnabled })}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                      settings.welcomePopupEnabled ? "bg-olive-600" : "bg-zinc-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                        settings.welcomePopupEnabled ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>

                <div className="space-y-3">
                  <Label>Welcome Popup Title</Label>
                  <Input
                    value={settings.welcomePopupTitle || ""}
                    onChange={(e) => setSettings({ ...settings, welcomePopupTitle: e.target.value })}
                    placeholder="歡迎來到 HK•Market"
                  />
                  <Description>Main heading of the welcome popup.</Description>
                </div>

                <div className="space-y-3">
                  <Label>Welcome Popup Subtitle</Label>
                  <Input
                    value={settings.welcomePopupSubtitle || ""}
                    onChange={(e) => setSettings({ ...settings, welcomePopupSubtitle: e.target.value })}
                    placeholder="探索最新波鞋及運動裝備，正品保證！"
                  />
                  <Description>Subheading displayed below the title.</Description>
                </div>

                <div className="space-y-3">
                  <Label>Welcome Popup Promo Text</Label>
                  <Input
                    value={settings.welcomePopupPromoText || ""}
                    onChange={(e) => setSettings({ ...settings, welcomePopupPromoText: e.target.value })}
                    placeholder="🎉 訂單滿 $600 免運費！"
                  />
                  <Description>Promotional text shown in the highlighted box.</Description>
                </div>

                <div className="space-y-3">
                  <Label>Welcome Popup Button Text</Label>
                  <Input
                    value={settings.welcomePopupButtonText || ""}
                    onChange={(e) => setSettings({ ...settings, welcomePopupButtonText: e.target.value })}
                    placeholder="開始購物"
                  />
                  <Description>Text on the call-to-action button.</Description>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
