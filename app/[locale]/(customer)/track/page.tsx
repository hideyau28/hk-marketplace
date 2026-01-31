"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

const TIMELINE = ["PENDING", "PAID", "FULFILLING", "SHIPPED", "COMPLETED"] as const;

type TrackData = {
  id: string;
  status: string;
};

type ApiSuccess = {
  ok: true;
  data: TrackData;
};

type ApiFail = {
  ok: false;
  error?: { message?: string };
};

export default function OrderTrackingPage({ params }: { params: Promise<{ locale: string }> }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ locale: l }) => setLocale(l as Locale));
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = orderId.trim();
    if (!trimmed) {
      setError("Please enter an Order ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}/track`, {
        method: "GET",
      });
      const json = (await res.json()) as ApiSuccess | ApiFail;
      if (!res.ok || !json.ok) {
        setError(json && "error" in json && json.error?.message ? json.error.message : "Order not found.");
      } else {
        setStatus(json.data.status);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = status ? TIMELINE.indexOf(status as (typeof TIMELINE)[number]) : -1;

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-zinc-900">Order Tracking</h1>
        <p className="mt-2 text-sm text-zinc-600">Enter your Order ID to view the latest status.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ckxyz123456"
            className="flex-1 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-olive-600/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-olive-600 px-6 py-3 text-sm font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Find Order"}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {status && (
          <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6">
            <div className="mb-4 text-sm text-zinc-500">
              Current Status: <span className="font-semibold text-zinc-900">{status}</span>
            </div>

            <div className="space-y-4">
              {TIMELINE.map((step, index) => {
                const isCurrent = index === currentIndex;
                const isComplete = index < currentIndex;
                const circleClass = isCurrent
                  ? "bg-olive-600 text-white border-olive-600"
                  : isComplete
                  ? "bg-olive-100 text-olive-700 border-olive-200"
                  : "bg-white text-zinc-400 border-zinc-200";
                const textClass = isCurrent ? "text-olive-700 font-semibold" : isComplete ? "text-zinc-700" : "text-zinc-400";
                return (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${circleClass}`}>
                      {step.slice(0, 2)}
                    </div>
                    <div className={`text-sm ${textClass}`}>{step}</div>
                  </div>
                );
              })}
            </div>

            {currentIndex === -1 && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                This order is currently in status "{status}".
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href={`/${locale}`} className="text-[var(--primary)] underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
