"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDict } from "@/lib/i18n";

export type CustomerSummary = {
  phone: string;
  customerName: string;
  email: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: string;
};

type CustomersTableProps = {
  customers: CustomerSummary[];
  locale: Locale;
  searchQuery?: string;
  currentSort?: string;
};

function formatDate(date: string, locale: Locale): string {
  const d = new Date(date);
  return d.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-HK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function CustomersTable({
  customers,
  locale,
  searchQuery,
  currentSort,
}: CustomersTableProps) {
  const router = useRouter();
  const t = getDict(locale);
  const [search, setSearch] = useState(searchQuery || "");
  const [sort, setSort] = useState(currentSort || "lastOrder");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sort && sort !== "lastOrder") params.set("sort", sort);
    const url = params.toString()
      ? `/${locale}/admin/customers?${params.toString()}`
      : `/${locale}/admin/customers`;
    router.push(url);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (newSort && newSort !== "lastOrder") params.set("sort", newSort);
    const url = params.toString()
      ? `/${locale}/admin/customers?${params.toString()}`
      : `/${locale}/admin/customers`;
    router.push(url);
  };

  return (
    <>
      {/* Sort tabs + search */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => handleSortChange("lastOrder")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            sort !== "totalSpent"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {t.admin.customers.sortByRecent}
        </button>
        <button
          onClick={() => handleSortChange("totalSpent")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            sort === "totalSpent"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {t.admin.customers.sortBySpent}
        </button>
      </div>

      {/* Search */}
      <div className="mt-4">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.admin.customers.search}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pl-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-olive-300"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
      </div>

      {/* Customer cards */}
      {customers.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-zinc-200 bg-white px-4 py-12 text-center">
          <div className="text-zinc-400 mb-2">
            <svg
              className="h-12 w-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="text-zinc-500 font-medium">
            {searchQuery
              ? t.admin.customers.noResults
              : t.admin.customers.noCustomers}
          </div>
          <div className="text-zinc-400 text-sm mt-1">
            {searchQuery
              ? t.admin.customers.noResultsDesc
              : t.admin.customers.noCustomersDesc}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {customers.map((customer) => (
            <Link
              key={customer.phone}
              href={`/${locale}/admin/customers/${encodeURIComponent(customer.phone)}`}
              className="block rounded-2xl border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Left: Customer info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-zinc-900">
                      {customer.customerName}
                    </span>
                    {customer.orderCount >= 2 && (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">
                        🔄 {locale === "zh-HK" ? "回頭客" : "Repeat"}
                      </span>
                    )}
                    {customer.totalSpent >= 1000 && (
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-100">
                        ⭐ VIP
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono">{customer.phone}</span>
                    {customer.email && <span>{customer.email}</span>}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    {customer.orderCount}{" "}
                    {t.admin.customers.orderCount.toLowerCase()} ·{" "}
                    {t.admin.customers.lastOrder.toLowerCase()}{" "}
                    {formatDate(customer.lastOrderDate, locale)}
                  </div>
                </div>

                {/* Right: Total spent */}
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-zinc-900">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {t.admin.customers.totalSpent}
                    </div>
                  </div>
                  <svg
                    className="h-5 w-5 text-zinc-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}

          {/* Summary */}
          <div className="flex items-center justify-between px-4 py-3 text-zinc-600 text-sm">
            <div>
              {t.admin.customers.showing} {customers.length}{" "}
              {t.admin.customers.customersCount}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
