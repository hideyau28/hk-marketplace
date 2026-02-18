"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

export interface PaymentProviderOption {
  providerId: string;
  displayName: string | null;
  name: string;
  nameZh: string;
  type: "online" | "manual";
  icon: string;
  config: Record<string, unknown>;
  instructions?: string;
}

interface Props {
  locale: Locale;
  onSelect: (provider: PaymentProviderOption | null) => void;
}

export default function CheckoutPaymentSelector({ locale, onSelect }: Props) {
  const [providers, setProviders] = useState<PaymentProviderOption[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-config")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.data?.providers) {
          setProviders(data.data.providers);
          // Auto-select first provider
          if (data.data.providers.length > 0) {
            const first = data.data.providers[0];
            setSelected(first.providerId);
            onSelect(first);
          }
        } else {
          setError(
            locale === "zh-HK" ? "無法載入付款方式" : "Failed to load payment methods"
          );
        }
      })
      .catch(() => {
        setError(
          locale === "zh-HK" ? "無法載入付款方式" : "Failed to load payment methods"
        );
      })
      .finally(() => setLoading(false));
    // onSelect is a callback from parent, only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const handleSelect = (provider: PaymentProviderOption) => {
    setSelected(provider.providerId);
    onSelect(provider);
  };

  const getDisplayName = (p: PaymentProviderOption) =>
    p.displayName || (locale === "zh-HK" ? p.nameZh : p.name);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {locale === "zh-HK" ? "付款方式" : "Payment"}
        </h2>
        <div className="flex items-center justify-center py-8 text-sm text-zinc-400">
          {locale === "zh-HK" ? "載入中..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (error || providers.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {locale === "zh-HK" ? "付款方式" : "Payment"}
        </h2>
        <p className="text-sm text-zinc-500">
          {error || (locale === "zh-HK" ? "暫無可用付款方式" : "No payment methods available")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {locale === "zh-HK" ? "付款方式" : "Payment"}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <button
            key={provider.providerId}
            type="button"
            onClick={() => handleSelect(provider)}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              selected === provider.providerId
                ? "border-olive-600 bg-olive-50 dark:bg-olive-900/20"
                : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            <div className="text-2xl mb-1">{provider.icon}</div>
            <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
              {getDisplayName(provider)}
            </div>
            <div className="mt-0.5 text-[10px] text-zinc-400">
              {provider.type === "online"
                ? locale === "zh-HK"
                  ? "線上支付"
                  : "Online"
                : locale === "zh-HK"
                  ? "手動轉賬"
                  : "Manual"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
