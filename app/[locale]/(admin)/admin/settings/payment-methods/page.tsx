"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Save,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useParams } from "next/navigation";
import SidebarToggle from "@/components/admin/SidebarToggle";
import ImageUpload from "@/components/admin/ImageUpload";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
type MethodType = "fps" | "payme" | "alipay_hk" | "bank_transfer";

type PaymentMethodData = {
  type: MethodType;
  name: string;
  active: boolean;
  accountName: string;
  accountNumber: string;
  bankName: string;
  paymentLink: string;
  qrCodeUrl: string;
  instructions: string;
};

type SaveState = "idle" | "saving" | "success" | "error";

// --- Helpers ---
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400",
        enabled ? "bg-emerald-500" : "bg-zinc-300"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform",
          enabled ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-medium text-zinc-700">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
    />
  );
}

function TextareaInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="flex w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 resize-none"
    />
  );
}

// --- Method Icons (emoji) ---
const METHOD_ICONS: Record<MethodType, string> = {
  fps: "⚡",
  payme: "💜",
  alipay_hk: "🔵",
  bank_transfer: "🏦",
};

const METHOD_NAMES: Record<MethodType, { zh: string; en: string }> = {
  fps: { zh: "FPS 轉數快", en: "FPS (Faster Payment System)" },
  payme: { zh: "PayMe", en: "PayMe by HSBC" },
  alipay_hk: { zh: "AlipayHK 支付寶香港", en: "Alipay HK" },
  bank_transfer: { zh: "銀行過數", en: "Bank Transfer" },
};

const ORDERED_TYPES: MethodType[] = ["fps", "payme", "alipay_hk", "bank_transfer"];

// --- Default empty record ---
function emptyMethod(type: MethodType): PaymentMethodData {
  return {
    type,
    name: METHOD_NAMES[type].zh,
    active: false,
    accountName: "",
    accountNumber: "",
    bankName: "",
    paymentLink: "",
    qrCodeUrl: "",
    instructions: "",
  };
}

// --- Main Page ---
export default function PaymentMethodsPage() {
  const params = useParams();
  const locale = (params.locale as string) || "zh-HK";
  const isZh = locale === "zh-HK";

  const [methods, setMethods] = useState<Record<MethodType, PaymentMethodData>>(
    () =>
      Object.fromEntries(
        ORDERED_TYPES.map((t) => [t, emptyMethod(t)])
      ) as Record<MethodType, PaymentMethodData>
  );
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Load
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/payment-methods");
        if (!res.ok) return;
        const json = await res.json();
        if (mounted && json.ok && Array.isArray(json.data)) {
          const map: Record<string, PaymentMethodData> = {};
          for (const m of json.data) {
            map[m.type] = m;
          }
          setMethods((prev) => {
            const next = { ...prev };
            for (const t of ORDERED_TYPES) {
              if (map[t]) next[t] = map[t];
            }
            return next;
          });
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

  const updateMethod = useCallback(
    (type: MethodType, patch: Partial<PaymentMethodData>) => {
      setMethods((prev) => ({
        ...prev,
        [type]: { ...prev[type], ...patch },
      }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ methods: Object.values(methods) }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setSaveState("error");
        setErrorMsg(json?.error?.message || "儲存失敗");
        return;
      }
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setSaveState("error");
      setErrorMsg(err instanceof Error ? err.message : "網絡錯誤");
    }
  }, [methods]);

  if (loading) {
    return (
      <div className="bg-zinc-50 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 text-zinc-900 pb-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-4">
          <SidebarToggle />
        </div>

        {/* Back + Header */}
        <div className="mb-2">
          <Link
            href={`/${locale}/admin/settings`}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {isZh ? "返回設定" : "Back to Settings"}
          </Link>
        </div>

        <div className="space-y-1.5 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            <Wallet className="h-7 w-7 sm:h-8 sm:w-8 text-zinc-600" />
            {isZh ? "收款方式" : "Payment Methods"}
          </h1>
          <p className="text-zinc-500 text-sm sm:text-base">
            {isZh
              ? "設定顧客結帳時可用的收款方式。至少啟用 1 種。"
              : "Configure payment methods shown during checkout. At least 1 must be active."}
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {/* FPS Card */}
          <MethodCard
            type="fps"
            method={methods.fps}
            onToggle={() => updateMethod("fps", { active: !methods.fps.active })}
            isZh={isZh}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel required={methods.fps.active}>
                  {isZh ? "收款電話 / FPS ID" : "Phone / FPS ID"}
                </FieldLabel>
                <TextInput
                  value={methods.fps.accountNumber}
                  onChange={(v) => updateMethod("fps", { accountNumber: v })}
                  placeholder={isZh ? "例：98765432 或 FPS ID" : "e.g. 98765432 or FPS ID"}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>
                  {isZh ? "收款人名（選填）" : "Account Name (optional)"}
                </FieldLabel>
                <TextInput
                  value={methods.fps.accountName}
                  onChange={(v) => updateMethod("fps", { accountName: v })}
                  placeholder={isZh ? "例：陳大文" : "e.g. Chan Tai Man"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>
                {isZh ? "FPS QR Code（選填）" : "FPS QR Code (optional)"}
              </FieldLabel>
              <div className="max-w-[200px]">
                <ImageUpload
                  currentUrl={methods.fps.qrCodeUrl}
                  onUpload={(url) => updateMethod("fps", { qrCodeUrl: url })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>
                {isZh ? "轉帳指引（選填）" : "Transfer Instructions (optional)"}
              </FieldLabel>
              <TextareaInput
                value={methods.fps.instructions}
                onChange={(v) => updateMethod("fps", { instructions: v })}
                placeholder={isZh ? "例：轉帳後請截圖傳 WhatsApp" : "e.g. Send screenshot to WhatsApp after transfer"}
              />
            </div>
          </MethodCard>

          {/* PayMe Card */}
          <MethodCard
            type="payme"
            method={methods.payme}
            onToggle={() => updateMethod("payme", { active: !methods.payme.active })}
            isZh={isZh}
          >
            <div className="space-y-1.5">
              <FieldLabel required={methods.payme.active}>
                {isZh ? "PayMe QR Code" : "PayMe QR Code"}
              </FieldLabel>
              <div className="max-w-[200px]">
                <ImageUpload
                  currentUrl={methods.payme.qrCodeUrl}
                  onUpload={(url) => updateMethod("payme", { qrCodeUrl: url })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel>
                  {isZh ? "PayMe 連結（選填）" : "PayMe Link (optional)"}
                </FieldLabel>
                <TextInput
                  value={methods.payme.paymentLink}
                  onChange={(v) => updateMethod("payme", { paymentLink: v })}
                  type="url"
                  placeholder="https://payme.hsbc/..."
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>
                  {isZh ? "收款人名（選填）" : "Account Name (optional)"}
                </FieldLabel>
                <TextInput
                  value={methods.payme.accountName}
                  onChange={(v) => updateMethod("payme", { accountName: v })}
                  placeholder={isZh ? "例：陳大文" : "e.g. Chan Tai Man"}
                />
              </div>
            </div>
          </MethodCard>

          {/* AlipayHK Card */}
          <MethodCard
            type="alipay_hk"
            method={methods.alipay_hk}
            onToggle={() => updateMethod("alipay_hk", { active: !methods.alipay_hk.active })}
            isZh={isZh}
          >
            <div className="space-y-1.5">
              <FieldLabel required={methods.alipay_hk.active}>
                {isZh ? "AlipayHK QR Code" : "AlipayHK QR Code"}
              </FieldLabel>
              <div className="max-w-[200px]">
                <ImageUpload
                  currentUrl={methods.alipay_hk.qrCodeUrl}
                  onUpload={(url) => updateMethod("alipay_hk", { qrCodeUrl: url })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>
                {isZh ? "收款人名（選填）" : "Account Name (optional)"}
              </FieldLabel>
              <TextInput
                value={methods.alipay_hk.accountName}
                onChange={(v) => updateMethod("alipay_hk", { accountName: v })}
                placeholder={isZh ? "例：陳大文" : "e.g. Chan Tai Man"}
              />
            </div>
          </MethodCard>

          {/* Bank Transfer Card */}
          <MethodCard
            type="bank_transfer"
            method={methods.bank_transfer}
            onToggle={() =>
              updateMethod("bank_transfer", { active: !methods.bank_transfer.active })
            }
            isZh={isZh}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel required={methods.bank_transfer.active}>
                  {isZh ? "銀行名稱" : "Bank Name"}
                </FieldLabel>
                <TextInput
                  value={methods.bank_transfer.bankName}
                  onChange={(v) => updateMethod("bank_transfer", { bankName: v })}
                  placeholder={isZh ? "例：滙豐銀行 HSBC" : "e.g. HSBC"}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel required={methods.bank_transfer.active}>
                  {isZh ? "戶口號碼" : "Account Number"}
                </FieldLabel>
                <TextInput
                  value={methods.bank_transfer.accountNumber}
                  onChange={(v) => updateMethod("bank_transfer", { accountNumber: v })}
                  placeholder={isZh ? "例：123-456789-001" : "e.g. 123-456789-001"}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel required={methods.bank_transfer.active}>
                {isZh ? "戶口名稱" : "Account Holder Name"}
              </FieldLabel>
              <TextInput
                value={methods.bank_transfer.accountName}
                onChange={(v) => updateMethod("bank_transfer", { accountName: v })}
                placeholder={isZh ? "例：Chan Tai Man / 陳大文" : "e.g. Chan Tai Man"}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>
                {isZh ? "轉帳指引（選填）" : "Transfer Instructions (optional)"}
              </FieldLabel>
              <TextareaInput
                value={methods.bank_transfer.instructions}
                onChange={(v) => updateMethod("bank_transfer", { instructions: v })}
                placeholder={isZh ? "例：轉帳後請傳收據圖片" : "e.g. Send receipt photo after transfer"}
              />
            </div>
          </MethodCard>
        </div>

        {/* Save bar */}
        <div className="sticky bottom-0 bg-zinc-50/95 backdrop-blur-sm border-t border-zinc-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mt-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === "saving"}
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              {saveState === "saving" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isZh ? "儲存中…" : "Saving…"}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isZh ? "儲存設定" : "Save Settings"}
                </>
              )}
            </button>

            <AnimatePresence>
              {saveState === "success" && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5 text-sm text-emerald-600"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isZh ? "已儲存" : "Saved"}
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

// --- MethodCard sub-component ---
function MethodCard({
  type,
  method,
  onToggle,
  isZh,
  children,
}: {
  type: MethodType;
  method: PaymentMethodData;
  onToggle: () => void;
  isZh: boolean;
  children: React.ReactNode;
}) {
  const names = METHOD_NAMES[type];
  const icon = METHOD_ICONS[type];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white overflow-hidden transition-colors",
        method.active ? "border-zinc-300" : "border-zinc-200"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4">
        <span className="text-2xl" role="img" aria-label={names.en}>
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-900">
            {isZh ? names.zh : names.en}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {method.active ? (
              <span className="text-emerald-600 font-medium">
                {isZh ? "已啟用" : "Active"}
              </span>
            ) : (
              <span>{isZh ? "未啟用" : "Inactive"}</span>
            )}
          </div>
        </div>
        <Toggle enabled={method.active} onToggle={onToggle} />
      </div>

      {/* Fields (always visible, but dimmed when inactive) */}
      <div
        className={cn(
          "border-t border-zinc-100 px-4 sm:px-5 py-4 sm:py-5 space-y-4 bg-zinc-50/40 transition-opacity",
          !method.active && "opacity-60"
        )}
      >
        {children}
      </div>
    </div>
  );
}
