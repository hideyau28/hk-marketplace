"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import SidebarToggle from "@/components/admin/SidebarToggle";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type ConfigField = {
  key: string;
  label: string;
  labelZh: string;
  type: "text" | "url" | "image" | "select" | "boolean";
  required: boolean;
  placeholder?: string;
};

type ProviderConfig = {
  providerId: string;
  name: string;
  nameZh: string;
  icon: string;
  type: "online" | "manual";
  configFields: ConfigField[];
  enabled: boolean;
  config: Record<string, any>;
  displayName: string | null;
  sortOrder: number;
};

type SaveState = Record<string, "idle" | "saving" | "success" | "error">;
type ErrorState = Record<string, string>;

// --- Group labels ---
const GROUP_LABELS: Record<string, { label: string; labelZh: string }> = {
  online: { label: "Online Payment", labelZh: "線上支付" },
  manual: { label: "Manual / Offline Payment", labelZh: "手動 / 線下支付" },
};

export default function PaymentSettingsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveStates, setSaveStates] = useState<SaveState>({});
  const [errors, setErrors] = useState<ErrorState>({});
  // 本地 form state（toggle 同 config 修改先改呢度，save 先 push 上 server）
  const [localConfigs, setLocalConfigs] = useState<Record<string, { enabled: boolean; config: Record<string, any>; displayName: string | null; sortOrder: number }>>({});

  // Load providers
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/payment-config");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json.ok && Array.isArray(json.data)) {
          setProviders(json.data);
          // Init local config state
          const configs: typeof localConfigs = {};
          for (const p of json.data) {
            configs[p.providerId] = {
              enabled: p.enabled,
              config: p.config ?? {},
              displayName: p.displayName,
              sortOrder: p.sortOrder,
            };
          }
          setLocalConfigs(configs);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // Toggle enable/disable
  const handleToggle = useCallback((providerId: string) => {
    setLocalConfigs((prev) => {
      const current = prev[providerId];
      if (!current) return prev;
      const newEnabled = !current.enabled;
      // 如果 enable 就展開 config，disable 就收起
      if (newEnabled) {
        setExpandedId(providerId);
      }
      return { ...prev, [providerId]: { ...current, enabled: newEnabled } };
    });
  }, []);

  // Update config field
  const handleConfigChange = useCallback((providerId: string, key: string, value: string) => {
    setLocalConfigs((prev) => {
      const current = prev[providerId];
      if (!current) return prev;
      return {
        ...prev,
        [providerId]: {
          ...current,
          config: { ...current.config, [key]: value },
        },
      };
    });
  }, []);

  // Save provider config
  const handleSave = useCallback(async (providerId: string) => {
    const local = localConfigs[providerId];
    if (!local) return;

    setSaveStates((prev) => ({ ...prev, [providerId]: "saving" }));
    setErrors((prev) => ({ ...prev, [providerId]: "" }));

    try {
      const res = await fetch(`/api/admin/payment-config/${providerId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          enabled: local.enabled,
          config: local.config,
          displayName: local.displayName,
          sortOrder: local.sortOrder,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSaveStates((prev) => ({ ...prev, [providerId]: "error" }));
        setErrors((prev) => ({
          ...prev,
          [providerId]: json?.error?.message || "Failed to save",
        }));
        return;
      }

      setSaveStates((prev) => ({ ...prev, [providerId]: "success" }));
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [providerId]: "idle" }));
      }, 2000);
    } catch (err) {
      setSaveStates((prev) => ({ ...prev, [providerId]: "error" }));
      setErrors((prev) => ({
        ...prev,
        [providerId]: err instanceof Error ? err.message : "Network error",
      }));
    }
  }, [localConfigs]);

  // Group providers by type
  const grouped = providers.reduce<Record<string, ProviderConfig[]>>(
    (acc, p) => {
      const key = p.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {}
  );

  if (loading) {
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
        <div className="space-y-1.5 mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-zinc-600" />
            Payment Methods
          </h1>
          <p className="text-zinc-600 text-base">
            管理支付方式，啟用或停用 provider，填寫設定
          </p>
        </div>

        <div className="space-y-8">
          {(["online", "manual"] as const).map((groupType) => {
            const items = grouped[groupType];
            if (!items || items.length === 0) return null;
            const groupInfo = GROUP_LABELS[groupType];

            return (
              <div key={groupType}>
                <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                  {groupInfo.labelZh}
                  <span className="text-sm font-normal text-zinc-500">
                    ({groupInfo.label})
                  </span>
                </h2>

                <div className="space-y-3">
                  {items.map((provider) => {
                    const local = localConfigs[provider.providerId];
                    const isExpanded = expandedId === provider.providerId;
                    const saveState = saveStates[provider.providerId] || "idle";
                    const error = errors[provider.providerId] || "";

                    return (
                      <div
                        key={provider.providerId}
                        className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
                      >
                        {/* Provider header row */}
                        <div className="flex items-center gap-4 px-5 py-4">
                          <span className="text-2xl" role="img" aria-label={provider.name}>
                            {provider.icon}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-zinc-900">
                              {provider.nameZh}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {provider.name}
                            </div>
                          </div>

                          {/* Toggle */}
                          <button
                            type="button"
                            role="switch"
                            aria-checked={local?.enabled ?? false}
                            onClick={() => handleToggle(provider.providerId)}
                            className={cn(
                              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
                              local?.enabled ? "bg-olive-600" : "bg-zinc-300"
                            )}
                          >
                            <span
                              className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
                                local?.enabled
                                  ? "translate-x-5"
                                  : "translate-x-0"
                              )}
                            />
                          </button>

                          {/* Expand/collapse */}
                          {provider.configFields.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId(
                                  isExpanded ? null : provider.providerId
                                )
                              }
                              className="text-zinc-400 hover:text-zinc-600 p-1"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Config panel */}
                        <AnimatePresence initial={false}>
                          {isExpanded && provider.configFields.length > 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-zinc-100 px-5 py-5 space-y-4 bg-zinc-50/50">
                                {provider.configFields.map((field) => (
                                  <div key={field.key} className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-700">
                                      {field.labelZh}
                                      {field.required && (
                                        <span className="text-red-500 ml-0.5">
                                          *
                                        </span>
                                      )}
                                    </label>
                                    <input
                                      type={
                                        field.type === "url" ? "url" : "text"
                                      }
                                      value={
                                        local?.config?.[field.key] ?? ""
                                      }
                                      onChange={(e) =>
                                        handleConfigChange(
                                          provider.providerId,
                                          field.key,
                                          e.target.value
                                        )
                                      }
                                      placeholder={
                                        field.placeholder || field.label
                                      }
                                      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                    />
                                    <p className="text-xs text-zinc-500">
                                      {field.label}
                                    </p>
                                  </div>
                                ))}

                                {/* Error */}
                                {error && (
                                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    {error}
                                  </div>
                                )}

                                {/* Save button */}
                                <div className="flex items-center gap-3 pt-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleSave(provider.providerId)
                                    }
                                    disabled={saveState === "saving"}
                                    className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                                  >
                                    {saveState === "saving" ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="h-4 w-4" />
                                        Save
                                      </>
                                    )}
                                  </button>

                                  <AnimatePresence>
                                    {saveState === "success" && (
                                      <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-1 text-sm text-emerald-600"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Saved
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Save row for providers with no config fields (just toggle) */}
                        {provider.configFields.length === 0 && (
                          <div className="border-t border-zinc-100 px-5 py-3 flex items-center gap-3 bg-zinc-50/50">
                            <button
                              type="button"
                              onClick={() => handleSave(provider.providerId)}
                              disabled={saveState === "saving"}
                              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                            >
                              {saveState === "saving" ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                              Save
                            </button>
                            <AnimatePresence>
                              {saveState === "success" && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-1 text-xs text-emerald-600"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  Saved
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {error && (
                              <span className="text-xs text-red-600">{error}</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
