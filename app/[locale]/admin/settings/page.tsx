"use client";

import type { Locale } from "@/lib/i18n";
import { useEffect, useState } from "react";

type StoreSettings = {
  id: string;
  storeName: string | null;
  tagline: string | null;
  returnsPolicy: string | null;
  shippingPolicy: string | null;
};

type SaveState = "idle" | "saving" | "success" | "error";

export default function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
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

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const hasAdminSecret = !!adminSecret;

  useEffect(() => {
    params.then((p) => setLocale(p.locale as Locale));
  }, [params]);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    if (!hasAdminSecret) return;

    try {
      const res = await fetch("/api/store-settings", {
        headers: {
          "x-admin-secret": adminSecret!,
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
    if (!hasAdminSecret) return;

    setSaveState("saving");
    setErrorMessage("");
    setRequestId("");

    const idempotencyKey = crypto.randomUUID();

    try {
      const res = await fetch("/api/store-settings", {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          "x-admin-secret": adminSecret!,
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

  return (
    <div className="px-4 pb-16 pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-white/60 text-sm">Admin</div>
          <h1 className="mt-1 text-2xl font-semibold text-white">Settings</h1>
          <div className="mt-2 text-white/60 text-sm">Single-shop storefront settings.</div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasAdminSecret || saveState === "saving"}
          className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveState === "saving" ? "Saving..." : "Save"}
        </button>
      </div>

      {!hasAdminSecret && (
        <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-red-400 text-sm">
          ⚠️ Missing NEXT_PUBLIC_ADMIN_SECRET environment variable. Please set it to enable admin actions.
        </div>
      )}

      {saveState === "success" && (
        <div className="mt-4 rounded-2xl bg-green-500/10 border border-green-500/20 p-4 text-green-400 text-sm">
          ✓ Settings saved successfully
        </div>
      )}

      {saveState === "error" && errorMessage && (
        <div className="mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 p-4">
          <div className="text-red-400 text-sm font-medium">Error saving settings</div>
          <div className="mt-1 text-red-300/80 text-sm">{errorMessage}</div>
          {requestId && (
            <div className="mt-1 text-red-300/60 text-xs">Request ID: {requestId}</div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Store name</div>
          <div className="mt-2 text-white/60 text-sm">Shown in TopNav / branding.</div>
          <input
            value={settings.storeName || ""}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. Yau Store"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Tagline</div>
          <div className="mt-2 text-white/60 text-sm">Shown on homepage hero.</div>
          <input
            value={settings.tagline || ""}
            onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. Curated picks, easy checkout"
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Returns Policy</div>
          <div className="mt-2 text-white/60 text-sm">Displayed on product pages and checkout.</div>
          <textarea
            value={settings.returnsPolicy || ""}
            onChange={(e) => setSettings({ ...settings, returnsPolicy: e.target.value })}
            rows={4}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. 30-day return policy..."
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-white font-medium">Shipping Policy</div>
          <div className="mt-2 text-white/60 text-sm">Displayed on product pages and checkout.</div>
          <textarea
            value={settings.shippingPolicy || ""}
            onChange={(e) => setSettings({ ...settings, shippingPolicy: e.target.value })}
            rows={4}
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="e.g. Free shipping on orders over $50..."
          />
        </div>
      </div>
    </div>
  );
}
