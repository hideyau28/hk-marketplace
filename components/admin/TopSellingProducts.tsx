"use client";

import { useState, useEffect } from "react";

type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
  imageUrl: string | null;
};

type RangeOption = "7d" | "30d" | "all";

type TopSellingProductsProps = {
  t: {
    topSellersTitle: string;
    topSellersDesc: string;
    topSellersRange7d: string;
    topSellersRange30d: string;
    topSellersRangeAll: string;
    topSellersProduct: string;
    topSellersSales: string;
    topSellersRevenue: string;
    topSellersEmpty: string;
  };
};

export default function TopSellingProducts({ t }: TopSellingProductsProps) {
  const [range, setRange] = useState<RangeOption>("30d");
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics/top-products?range=${range}`)
      .then((res) => res.json())
      .then((response) => {
        setProducts(response.data?.topProducts || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [range]);

  const rangeOptions: { value: RangeOption; label: string }[] = [
    { value: "7d", label: t.topSellersRange7d },
    { value: "30d", label: t.topSellersRange30d },
    { value: "all", label: t.topSellersRangeAll },
  ];

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-base font-semibold text-zinc-900">{t.topSellersTitle}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t.topSellersDesc}</p>
        </div>
        <div className="flex gap-1">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                range === opt.value
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-zinc-200" />
              <div className="flex-1 h-4 bg-zinc-200 rounded" />
              <div className="w-12 h-4 bg-zinc-200 rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-6 text-center text-sm text-zinc-500 py-8">
          {t.topSellersEmpty}
        </div>
      ) : (
        <div className="mt-4">
          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 text-xs text-zinc-500 font-medium pb-2 border-b border-zinc-100">
            <div className="w-6" />
            <div>{t.topSellersProduct}</div>
            <div className="text-right w-16">{t.topSellersSales}</div>
            <div className="text-right w-20">{t.topSellersRevenue}</div>
          </div>

          {/* Product rows */}
          {products.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center py-2.5 border-b border-zinc-50 last:border-0"
            >
              <div className="text-xs font-semibold text-zinc-400 w-6 text-center">
                {idx + 1}
              </div>
              <div className="flex items-center gap-2.5 min-w-0">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-zinc-100 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm text-zinc-800 font-medium truncate">{p.name}</span>
              </div>
              <div className="text-sm font-semibold text-zinc-900 text-right w-16">
                {p.quantity}
              </div>
              <div className="text-sm text-zinc-600 text-right w-20">
                ${p.revenue.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
