"use client";

import { useCurrency } from "@/lib/currency";

export default function CurrencyPrice({ amount }: { amount: number }) {
  const { format } = useCurrency();
  return <span>{format(amount)}</span>;
}
