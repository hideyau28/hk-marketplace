"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";

export type Currency = "HKD" | "CNY" | "USD";

const RATES: Record<Currency, number> = {
  HKD: 1,
  CNY: 0.92,
  USD: 0.13,
};

const SYMBOLS: Record<Currency, string> = {
  HKD: "HK$",
  CNY: "¥",
  USD: "US$",
};

const STORAGE_KEY = "hk-marketplace-currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  format: (amountHKD: number) => string;
  convert: (amountHKD: number) => number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("HKD");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "HKD" || stored === "CNY" || stored === "USD") {
      setCurrencyState(stored);
    }
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = useMemo<CurrencyContextValue>(() => {
    return {
      currency,
      setCurrency,
      convert: (amountHKD: number) => amountHKD * RATES[currency],
      format: (amountHKD: number) => {
        const converted = amountHKD * RATES[currency];
        return `${SYMBOLS[currency]}${Math.round(converted).toLocaleString()}`;
      },
    };
  }, [currency]);

  return createElement(CurrencyContext.Provider, { value }, children);
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}

export const currencyOptions: Currency[] = ["HKD", "CNY", "USD"];
