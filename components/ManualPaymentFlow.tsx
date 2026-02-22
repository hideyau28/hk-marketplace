"use client";

import { useRef } from "react";
import type { Locale } from "@/lib/i18n";
import type { PaymentProviderOption } from "./CheckoutPaymentSelector";

interface Props {
  provider: PaymentProviderOption;
  locale: Locale;
  total: number;
  format: (amount: number) => string;
  onFileChange: (file: File | null, preview: string | null) => void;
  paymentProofPreview: string | null;
}

export default function ManualPaymentFlow({
  provider,
  locale,
  total,
  format,
  onFileChange,
  paymentProofPreview,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = provider.config || {};

  const qrCodeUrl = config.qrCodeUrl as string | undefined;
  const accountName = config.accountName as string | undefined;
  const accountId = config.accountId as string | undefined;
  const accountNumber = config.accountNumber as string | undefined;
  const bankName = config.bankName as string | undefined;
  const paymeLink = config.paymeLink as string | undefined;
  const paypalEmail = config.paypalEmail as string | undefined;

  const displayName =
    provider.displayName || (locale === "zh-HK" ? provider.nameZh : provider.name);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => onFileChange(file, reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleReUpload = () => {
    onFileChange(null, null);
    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
    // Slight delay so state clears before opening file picker
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const hasAccountInfo = accountName || accountId || accountNumber || bankName || paymeLink || paypalEmail;

  return (
    <>
      {/* Payment details section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
            {displayName}
          </h3>

          {/* Transfer amount — prominent display */}
          <div className="mb-4 rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-900/20">
            <p className="text-xs text-orange-700 dark:text-orange-400">
              {locale === "zh-HK" ? "請轉帳以下金額" : "Please transfer"}
            </p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {format(total)}
            </p>
          </div>

          {qrCodeUrl && (
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700">
              <img
                src={qrCodeUrl}
                alt={displayName}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {!qrCodeUrl && !hasAccountInfo && (
            <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
              {locale === "zh-HK" ? "付款資料準備中" : "Payment details loading"}
            </p>
          )}

          {hasAccountInfo && (
            <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-800/50">
              <div className="space-y-2 text-sm">
                {bankName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {locale === "zh-HK" ? "銀行" : "Bank"}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{bankName}</span>
                  </div>
                )}
                {accountName && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {locale === "zh-HK" ? "收款人" : "Account"}
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{accountName}</span>
                  </div>
                )}
                {(accountId || accountNumber) && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {locale === "zh-HK" ? "帳號 / FPS ID" : "ID / Number"}
                    </span>
                    <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {accountId || accountNumber}
                    </span>
                  </div>
                )}
                {paymeLink && (
                  <div className="pt-1">
                    <a
                      href={paymeLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg bg-[#db0011] px-4 py-2 text-sm font-medium text-white hover:bg-[#b8000e]"
                    >
                      {locale === "zh-HK" ? "打開 PayMe 連結" : "Open PayMe Link"} →
                    </a>
                  </div>
                )}
                {paypalEmail && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">PayPal</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{paypalEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {provider.instructions && (
            <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
              {provider.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Upload payment proof section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {locale === "zh-HK" ? "請轉帳後上傳收據截圖" : "Upload Payment Receipt"}
          </h2>
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {locale === "zh-HK" ? "必填" : "Required"}
          </span>
        </div>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {locale === "zh-HK"
            ? "完成轉帳後，請上傳付款截圖以確認落單"
            : "After payment, upload a screenshot to confirm your order"}
        </p>
        <div className="mt-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={handleFileChange}
            className="hidden"
          />
          {paymentProofPreview ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                <img
                  src={paymentProofPreview}
                  alt="Payment proof"
                  className="w-full max-h-64 object-contain bg-zinc-50 dark:bg-zinc-800"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onFileChange(null, null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                    title={locale === "zh-HK" ? "移除" : "Remove"}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReUpload}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {locale === "zh-HK" ? "重新上傳" : "Re-upload"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:border-orange-500 dark:hover:bg-orange-900/10"
            >
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {locale === "zh-HK" ? "點擊上傳付款截圖" : "Click to upload screenshot"}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                JPG, PNG, WebP (max 5MB)
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
