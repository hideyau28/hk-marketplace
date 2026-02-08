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

  const hasAccountInfo = accountName || accountId || accountNumber || bankName || paymeLink || paypalEmail;

  return (
    <>
      {/* Payment details section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center">
          <h3 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">
            {displayName}
          </h3>

          {qrCodeUrl && (
            <div className="mx-auto h-48 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700">
              <img
                src={qrCodeUrl}
                alt={displayName}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {hasAccountInfo && (
            <div className="mt-4 space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              {bankName && (
                <p>
                  {locale === "zh-HK" ? "銀行：" : "Bank: "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{bankName}</span>
                </p>
              )}
              {accountName && (
                <p>
                  {locale === "zh-HK" ? "帳戶名稱：" : "Account: "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{accountName}</span>
                </p>
              )}
              {(accountId || accountNumber) && (
                <p>
                  {locale === "zh-HK" ? "帳號：" : "ID: "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {accountId || accountNumber}
                  </span>
                </p>
              )}
              {paymeLink && (
                <p>
                  <a
                    href={paymeLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-olive-600 hover:text-olive-700"
                  >
                    {locale === "zh-HK" ? "打開 PayMe 連結" : "Open PayMe Link"}
                  </a>
                </p>
              )}
              {paypalEmail && (
                <p>
                  {locale === "zh-HK" ? "PayPal：" : "PayPal: "}
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{paypalEmail}</span>
                </p>
              )}
            </div>
          )}

          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            {locale === "zh-HK" ? "請使用以上方式付款" : "Please pay"}{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {format(total)}
            </span>
          </p>

          {provider.instructions && (
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              {provider.instructions}
            </p>
          )}
        </div>
      </div>

      {/* Upload payment proof section */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {locale === "zh-HK" ? "上傳付款截圖" : "Upload Payment Proof"}
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {locale === "zh-HK"
            ? "完成付款後，請上傳付款截圖以確認您的訂單"
            : "After payment, upload a screenshot to confirm your order"}
        </p>
        <div className="mt-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {paymentProofPreview ? (
            <div className="relative">
              <img
                src={paymentProofPreview}
                alt="Payment proof"
                className="w-full max-h-64 object-contain rounded-xl border border-zinc-200 dark:border-zinc-700"
              />
              <button
                type="button"
                onClick={() => onFileChange(null, null)}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-8 text-center hover:border-olive-500 hover:bg-olive-50 dark:border-zinc-600 dark:bg-zinc-800"
            >
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {locale === "zh-HK" ? "點擊上傳付款截圖" : "Click to upload"}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {locale === "zh-HK"
                  ? "支持 JPG, PNG, HEIC (最大 5MB)"
                  : "JPG, PNG, HEIC (max 5MB)"}
              </div>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
