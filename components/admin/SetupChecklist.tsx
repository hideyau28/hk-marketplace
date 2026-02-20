"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- Bilingual labels ---
const t = {
  en: {
    title: "Set up your store",
    subtitle: "Complete these steps to get started",
    dismiss: "Dismiss",
    storeName: "Store name & link",
    whatsapp: "WhatsApp number",
    fps: "FPS payment",
    avatar: "Upload logo & banner",
    product: "Add your first product",
    preview: "Preview your store",
    goSettings: "Go to settings",
    goProducts: "Add product",
    goPreview: "Preview",
    complete: "completed",
  },
  "zh-HK": {
    title: "設定你嘅店",
    subtitle: "完成以下步驟，開始做生意",
    dismiss: "隱藏",
    storeName: "店名同連結",
    whatsapp: "WhatsApp 號碼",
    fps: "FPS 收款",
    avatar: "上傳頭像同 Banner",
    product: "加入第一件商品",
    preview: "預覽店舖",
    goSettings: "去設定",
    goProducts: "加商品",
    goPreview: "預覽",
    complete: "已完成",
  },
} as const;

export interface ChecklistStatus {
  hasStoreName: boolean;
  hasWhatsapp: boolean;
  hasFps: boolean;
  hasAvatar: boolean;
  hasProduct: boolean;
}

interface SetupChecklistProps {
  locale: string;
  status: ChecklistStatus;
  storeSlug: string;
}

const DISMISS_KEY = "setup-checklist-dismissed";

export default function SetupChecklist({ locale, status, storeSlug }: SetupChecklistProps) {
  const [dismissed, setDismissed] = useState(true); // default hidden to avoid flash
  const isZh = locale === "zh-HK";
  const labels = isZh ? t["zh-HK"] : t.en;

  useEffect(() => {
    try {
      const val = localStorage.getItem(DISMISS_KEY);
      setDismissed(val === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  // Build checklist items
  const items = [
    { key: "storeName", label: labels.storeName, done: status.hasStoreName, href: null },
    { key: "whatsapp", label: labels.whatsapp, done: status.hasWhatsapp, href: `/${locale}/admin/settings` },
    { key: "fps", label: labels.fps, done: status.hasFps, href: `/${locale}/admin/settings/payment-methods` },
    { key: "avatar", label: labels.avatar, done: status.hasAvatar, href: `/${locale}/admin/settings` },
    { key: "product", label: labels.product, done: status.hasProduct, href: `/${locale}/admin/products/new` },
    { key: "preview", label: labels.preview, done: false, href: `https://wowlix.com/${storeSlug}` },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const totalCount = items.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const allDone = completedCount === totalCount;

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-zinc-200 p-5 mb-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">{labels.title}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">{labels.subtitle}</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-100"
          >
            {labels.dismiss}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-zinc-600">
              {completedCount}/{totalCount} {labels.complete}
            </span>
            <span className="text-xs font-bold text-[#FF9500]">{progressPct}%</span>
          </div>
          <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: allDone ? "#10B981" : "#FF9500" }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Checklist items */}
        <div className="space-y-1">
          {items.map((item) => (
            <ChecklistItem
              key={item.key}
              label={item.label}
              done={item.done}
              href={item.href}
              locale={locale}
              labels={labels}
              isPreview={item.key === "preview"}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ChecklistItem({
  label,
  done,
  href,
  locale,
  labels,
  isPreview,
}: {
  label: string;
  done: boolean;
  href: string | null;
  locale: string;
  labels: (typeof t)["en"] | (typeof t)["zh-HK"];
  isPreview: boolean;
}) {
  const actionLabel = isPreview
    ? labels.goPreview
    : href?.includes("product")
    ? labels.goProducts
    : href
    ? labels.goSettings
    : null;

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-zinc-50 transition-colors">
      {/* Checkbox */}
      <div
        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : "border-zinc-300 bg-white"
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className={`flex-1 text-sm ${done ? "text-zinc-400 line-through" : "text-zinc-700 font-medium"}`}>
        {label}
      </span>

      {/* Action */}
      {!done && href && (
        isPreview ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#FF9500] font-medium hover:underline"
          >
            {actionLabel} &rarr;
          </a>
        ) : (
          <Link
            href={href}
            className="text-xs text-[#FF9500] font-medium hover:underline"
          >
            {actionLabel} &rarr;
          </Link>
        )
      )}
    </div>
  );
}
