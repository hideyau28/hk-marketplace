"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
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
import ImageUpload from "@/components/admin/ImageUpload";
import { getDict, type Locale } from "@/lib/i18n";

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
  options?: { label: string; value: string }[];
};

type ProviderConfig = {
  providerId: string;
  name: string;
  nameZh: string;
  icon: string;
  type: "online" | "manual";
  configFields: ConfigField[];
  enabled: boolean;
  config: Record<string, string>;
};

type LocalConfig = {
  enabled: boolean;
  config: Record<string, string>;
};

// --- Group labels ---
const GROUP_LABELS: Record<string, { en: string; zh: string }> = {
  manual: { en: "Manual / Offline Payment", zh: "手動 / 線下支付" },
  online: { en: "Online Payment", zh: "線上支付" },
};

export default function PaymentSettingsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "zh-HK";
  const t = getDict(locale as Locale);
  const isZh = locale === "zh-HK";

  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [localConfigs, setLocalConfigs] = useState<
    Record<string, LocalConfig>
  >({});

  // Load providers + tenant PaymentMethod records
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/payments");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json.ok && Array.isArray(json.data)) {
          setProviders(json.data);
          const configs: Record<string, LocalConfig> = {};
          const expanded = new Set<string>();
          for (const p of json.data) {
            configs[p.providerId] = {
              enabled: p.enabled,
              config: p.config ?? {},
            };
            // 已啟用嘅 provider 自動展開
            if (p.enabled && p.configFields.length > 0) {
              expanded.add(p.providerId);
            }
          }
          setLocalConfigs(configs);
          setExpandedIds(expanded);
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Toggle enable/disable
  const handleToggle = useCallback((providerId: string) => {
    setLocalConfigs((prev) => {
      const current = prev[providerId];
      if (!current) return prev;
      const newEnabled = !current.enabled;
      return { ...prev, [providerId]: { ...current, enabled: newEnabled } };
    });
    // Auto-expand when enabling (check previous state)
    setExpandedIds((prev) => {
      const next = new Set(prev);
      // We toggle: if it was disabled (about to be enabled), expand
      // Reading from localConfigs may be stale, so just add it
      next.add(providerId);
      return next;
    });
  }, []);

  // Update config field
  const handleConfigChange = useCallback(
    (providerId: string, key: string, value: string) => {
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
    },
    []
  );

  // Expand/collapse
  const toggleExpand = useCallback((providerId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  }, []);

  // Batch save all changes
  const handleSaveAll = useCallback(async () => {
    setSaveState("saving");
    setErrorMsg("");

    const methods = Object.entries(localConfigs).map(
      ([providerId, local]) => ({
        providerId,
        enabled: local.enabled,
        config: local.config,
      })
    );

    try {
      const res = await fetch("/api/admin/payments", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ methods }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSaveState("error");
        setErrorMsg(json?.error?.message || (isZh ? "儲存失敗" : "Failed to save"));
        return;
      }
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(
        err instanceof Error ? err.message : isZh ? "網絡錯誤" : "Network error"
      );
    }
  }, [localConfigs, isZh]);

  // Group providers by type
  const grouped = providers.reduce<Record<string, ProviderConfig[]>>(
    (acc, p) => {
      if (!acc[p.type]) acc[p.type] = [];
      acc[p.type].push(p);
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
    <div className="bg-zinc-50 text-zinc-900 pb-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6">
          <SidebarToggle />
        </div>

        {/* Header */}
        <div className="space-y-1.5 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <CreditCard className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-600" />
            {t.admin.payments.title}
          </h1>
          <p className="text-zinc-600 text-sm sm:text-base">
            {t.admin.payments.subtitle}
          </p>
        </div>

        {/* Provider groups */}
        <div className="space-y-8">
          {(["manual", "online"] as const).map((groupType) => {
            const items = grouped[groupType];
            if (!items || items.length === 0) return null;
            const gl = GROUP_LABELS[groupType];

            return (
              <div key={groupType}>
                <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center gap-2">
                  {isZh ? gl.zh : gl.en}
                  <span className="text-sm font-normal text-zinc-500">
                    ({isZh ? gl.en : gl.zh})
                  </span>
                </h2>

                <div className="space-y-3">
                  {items.map((provider) => {
                    const local = localConfigs[provider.providerId];
                    const isExpanded = expandedIds.has(provider.providerId);
                    const hasConfigFields = provider.configFields.length > 0;

                    return (
                      <div
                        key={provider.providerId}
                        className="rounded-xl border border-zinc-200 bg-white overflow-hidden"
                      >
                        {/* Provider header row */}
                        <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-4">
                          <span
                            className="text-2xl"
                            role="img"
                            aria-label={provider.name}
                          >
                            {provider.icon}
                          </span>

                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-zinc-900">
                              {isZh ? provider.nameZh : provider.name}
                            </div>
                            <div className="text-sm text-zinc-500">
                              {isZh ? provider.name : provider.nameZh}
                            </div>
                          </div>

                          {/* Toggle switch */}
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
                          {hasConfigFields && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(provider.providerId)}
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
                          {isExpanded && hasConfigFields && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-zinc-100 px-4 sm:px-5 py-4 sm:py-5 space-y-4 bg-zinc-50/50">
                                {provider.configFields.map((field) => (
                                  <div key={field.key} className="space-y-1.5">
                                    <label className="text-sm font-medium text-zinc-700">
                                      {isZh ? field.labelZh : field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-0.5">
                                          *
                                        </span>
                                      )}
                                    </label>

                                    {/* Image field → ImageUpload component */}
                                    {field.type === "image" ? (
                                      <ImageUpload
                                        currentUrl={
                                          local?.config?.[field.key] ?? ""
                                        }
                                        onUpload={(url) =>
                                          handleConfigChange(
                                            provider.providerId,
                                            field.key,
                                            url
                                          )
                                        }
                                      />
                                    ) : /* Select field */
                                    field.type === "select" && field.options ? (
                                      <select
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
                                        className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
                                      >
                                        <option value="">
                                          {isZh ? "請選擇" : "Select..."}
                                        </option>
                                        {field.options.map((opt) => (
                                          <option
                                            key={opt.value}
                                            value={opt.value}
                                          >
                                            {opt.label}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      /* Text / URL field */
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
                                    )}

                                    {/* Sub-label: show the other language */}
                                    <p className="text-xs text-zinc-500">
                                      {isZh ? field.label : field.labelZh}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global save bar */}
        <div className="sticky bottom-0 bg-zinc-50/95 backdrop-blur-sm border-t border-zinc-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mt-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={saveState === "saving"}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t.admin.payments.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t.admin.payments.save}
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
                  {t.admin.payments.saved}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {saveState === "error" && errorMsg && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
