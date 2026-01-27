"use client";

import type { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { getAdminSecret, setAdminSecret, clearAdminSecret } from "@/lib/admin/client-secret";
import {
  Save,
  Shield,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Store,
  Truck,
  Undo2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestId, setRequestId] = useState("");

  const [secretInput, setSecretInput] = useState("");
  const [adminSecret, setAdminSecretState] = useState<string | null>(null);

  // --- Effects (Preserved) ---
  useEffect(() => {
    params.then((p) => setLocale(p.locale as Locale));
  }, [params]);

  useEffect(() => {
    const secret = getAdminSecret();
    setAdminSecretState(secret);
  }, []);

  useEffect(() => {
    if (adminSecret) {
      loadSettings();
    }
  }, [adminSecret]);

  // --- Functions (Preserved Logic) ---
  async function loadSettings() {
    if (!adminSecret) return;

    try {
      const res = await fetch("/api/store-settings", {
        headers: {
          "x-admin-secret": adminSecret,
        },
      });

      if (!res.ok) {
        console.error("Failed to load settings:", res.status);
        return;
      }

      const data = await res.json();
      if (data.ok && data.data) {
        setSettings(data.data);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    }
  }

  async function handleSave() {
    if (!adminSecret) return;

    setSaveState("saving");
    setErrorMessage("");
    setRequestId("");

    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": adminSecret,
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

  function handleSetSecret() {
    if (!secretInput.trim()) return;
    setAdminSecret(secretInput.trim());
    setAdminSecretState(secretInput.trim());
    setSecretInput("");
  }

  function handleClearSecret() {
    clearAdminSecret();
    setAdminSecretState(null);
    setSettings({
      id: "default",
      storeName: "",
      tagline: "",
      returnsPolicy: "",
      shippingPolicy: "",
    });
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
    <div className="min-h-screen bg-white text-zinc-900 pb-20">
      <div className="mx-auto max-w-4xl px-6 py-12">

        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Store Settings</h1>
            <p className="text-zinc-600 text-base max-w-lg">
              Manage your storefront identity, policies, and global configurations.
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
              disabled={!adminSecret || saveState === "saving"}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50",
                saveState === "saving" && "opacity-80"
              )}
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 space-y-6">

          {/* Admin Secret Section (Authentication) */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                  <Shield className={cn("h-5 w-5", adminSecret ? "text-emerald-600" : "text-amber-600")} />
                  <h3>Admin Authentication</h3>
                </div>
                <p className="text-sm text-zinc-600">
                  {adminSecret
                    ? "Session active. You have write access to store settings."
                    : "Enter your admin secret key to unlock editing capabilities."}
                </p>
              </div>

              {!adminSecret ? (
                <div className="flex w-full md:w-auto items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Input
                      type="password"
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSetSecret()}
                      placeholder="Enter secret key"
                      className="pr-10"
                    />
                  </div>
                  <button
                    onClick={handleSetSecret}
                    disabled={!secretInput.trim()}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Unlock
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleClearSecret}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  Lock Session
                </button>
              )}
            </div>

            {/* Error Message Display */}
            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-md bg-red-50 border border-red-200 p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-800 font-medium">{errorMessage}</p>
                      {requestId && <p className="text-red-700/60 text-xs mt-1 font-mono">ID: {requestId}</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Settings Form */}
          <div className={cn("grid gap-6 transition-opacity duration-300", !adminSecret && "opacity-50 pointer-events-none grayscale-[0.5]")}>

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
                  <Label>Store Name</Label>
                  <Input
                    value={settings.storeName || ""}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    placeholder="e.g. Yau Store"
                  />
                  <Description>Visible in the navigation bar and browser title.</Description>
                </div>

                <div className="space-y-3">
                  <Label>Tagline</Label>
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
                  <Label>Returns Policy</Label>
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
                  <Label>Shipping Policy</Label>
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

          </div>
        </div>
      </div>
    </div>
  );
}