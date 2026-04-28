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
    fps: "Set up payments",
    avatar: "Upload logo & banner",
    product: "Add your first product",
    preview: "Preview your store",
    goSettings: "Go to settings",
    goPayments: "Set up payments",
    goProducts: "Add product",
    goPreview: "Preview",
    complete: "completed",
    congrats: "Your store is ready",
    congratsDesc: "You've completed all setup steps. Time to share your store!",
  },
  "zh-HK": {
    title: "設定你嘅店",
    subtitle: "完成以下步驟，開始做生意",
    dismiss: "隱藏",
    storeName: "店名同連結",
    whatsapp: "WhatsApp 號碼",
    fps: "設定收款方式",
    avatar: "上傳頭像同 Banner",
    product: "加入第一件商品",
    preview: "預覽店舖",
    goSettings: "去設定",
    goPayments: "設定收款",
    goProducts: "加商品",
    goPreview: "預覽",
    complete: "已完成",
    congrats: "恭喜！你嘅店已準備好 🎉",
    congratsDesc: "你已完成所有設定步驟，立即分享你嘅店！",
  },
} as const;

export interface ChecklistStatus {
  hasStoreName: boolean;
  hasWhatsapp: boolean;
  hasPaymentMethod: boolean; // any active PaymentMethod record
  hasAvatar: boolean;
  hasProduct: boolean;
}

interface SetupChecklistProps {
  locale: string;
  status: ChecklistStatus;
  storeSlug: string;
}

const DISMISS_KEY = "setup-checklist-dismissed";
const PREVIEW_KEY = "setup-preview-clicked";

export default function SetupChecklist({ locale, status, storeSlug }: SetupChecklistProps) {
  // Start hidden to avoid SSR flash; useEffect sets real value
  const [dismissed, setDismissed] = useState(true);
  const [previewDone, setPreviewDone] = useState(false);
  const isZh = locale === "zh-HK";
  const labels = isZh ? t["zh-HK"] : t.en;

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
      setPreviewDone(localStorage.getItem(PREVIEW_KEY) === "1");
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

  const handlePreviewClick = () => {
    setPreviewDone(true);
    try {
      localStorage.setItem(PREVIEW_KEY, "1");
    } catch {}
  };

  // Steps 1-5 are auto-detected; step 6 (preview) uses localStorage
  const allItems = [
    { key: "storeName", label: labels.storeName, done: status.hasStoreName, href: null },
    { key: "whatsapp", label: labels.whatsapp, done: status.hasWhatsapp, href: `/${locale}/admin/settings` },
    { key: "fps", label: labels.fps, done: status.hasPaymentMethod, href: `/${locale}/admin/settings/payment-methods` },
    { key: "avatar", label: labels.avatar, done: status.hasAvatar, href: `/${locale}/admin/settings` },
    { key: "product", label: labels.product, done: status.hasProduct, href: `/${locale}/admin/products/new` },
    { key: "preview", label: labels.preview, done: previewDone, href: `/${locale}/${storeSlug}` },
  ];

  const completedCount = allItems.filter((i) => i.done).length;
  const totalCheckable = allItems.length; // 6
  const progressPct = Math.round((completedCount / totalCheckable) * 100);
  const allDone = completedCount === totalCheckable;

  // When all done and congrats dismissed: hide everything
  if (allDone && dismissed) return null;

  // When all done (and not dismissed): show congrats banner
  if (allDone) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-emerald-900">{labels.congrats}</h3>
              <p className="text-sm text-emerald-700 mt-0.5">{labels.congratsDesc}</p>
              <a
                href={`/${locale}/${storeSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-emerald-700 hover:text-emerald-900 underline underline-offset-2 transition-colors"
              >
                {labels.goPreview} &rarr;
              </a>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-xs text-emerald-600 hover:text-emerald-800 transition-colors px-2 py-1 rounded-lg hover:bg-emerald-100"
            >
              {labels.dismiss}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Not all done: show checklist at top (no dismiss — always visible until complete)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl border border-wlx-mist p-5 mb-6"
      >
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-wlx-ink">{labels.title}</h3>
          <p className="text-sm text-wlx-stone mt-0.5">{labels.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-wlx-stone">
              {completedCount}/{totalCheckable} {labels.complete}
            </span>
            <span className="text-xs font-bold text-wlx-ink">{progressPct}%</span>
          </div>
          <div className="h-2 bg-wlx-cream rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-wlx-ink"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Checklist items (all 6) */}
        <div className="space-y-1">
          {allItems.map((item) => (
            <ChecklistItem
              key={item.key}
              label={item.label}
              done={item.done}
              href={item.href}
              labels={labels}
              isPreview={item.key === "preview"}
              onPreviewClick={item.key === "preview" ? handlePreviewClick : undefined}
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
  labels,
  isPreview,
  onPreviewClick,
}: {
  label: string;
  done: boolean;
  href: string | null;
  labels: (typeof t)["en"] | (typeof t)["zh-HK"];
  isPreview: boolean;
  onPreviewClick?: () => void;
}) {
  const actionLabel = isPreview
    ? labels.goPreview
    : href?.includes("payment")
    ? labels.goPayments
    : href?.includes("product")
    ? labels.goProducts
    : href
    ? labels.goSettings
    : null;

  return (
    <div className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-wlx-cream transition-colors">
      {/* Circle indicator */}
      <div
        className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
          done
            ? "bg-emerald-500 border-emerald-500"
            : "border-wlx-mist bg-white"
        }`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Label */}
      <span className={`flex-1 text-sm ${done ? "text-wlx-stone line-through" : "text-wlx-stone font-medium"}`}>
        {label}
      </span>

      {/* CTA — shown when not done and href exists */}
      {!done && href && (
        isPreview ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-wlx-ink font-medium hover:underline"
            onClick={onPreviewClick}
          >
            {actionLabel} &rarr;
          </a>
        ) : (
          <Link
            href={href}
            className="text-xs text-wlx-ink font-medium hover:underline"
          >
            {actionLabel} &rarr;
          </Link>
        )
      )}
    </div>
  );
}
