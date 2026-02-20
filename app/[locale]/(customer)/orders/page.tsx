"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { getDict, type Locale } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";

const STATUS_DISPLAY: Record<string, { en: string; zh: string }> = {
  PENDING: { en: "Pending", zh: "待付款" },
  PENDING_CONFIRMATION: { en: "Awaiting Confirmation", zh: "待確認收款" },
  CONFIRMED: { en: "Confirmed", zh: "已確認" },
  PAID: { en: "Paid", zh: "已付款" },
  FULFILLING: { en: "Fulfilling", zh: "配送中" },
  SHIPPED: { en: "Shipped", zh: "已發貨" },
  COMPLETED: { en: "Completed", zh: "已完成" },
  CANCELLED: { en: "Cancelled", zh: "已取消" },
  REFUNDED: { en: "Refunded", zh: "已退款" },
  DISPUTED: { en: "Disputed", zh: "爭議中" },
};

function translateStatus(status: string, locale: string): string {
  const t = STATUS_DISPLAY[status];
  return t ? (locale === "zh-HK" ? t.zh : t.en) : status;
}

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (s === "paid" || s === "completed") {
    return "bg-olive-100 text-olive-700 border border-olive-200";
  }
  if (s === "pending" || s === "pending_confirmation") {
    return "bg-yellow-100 text-yellow-700 border border-yellow-200";
  }
  if (s === "fulfilling" || s === "shipped") {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  if (s === "refunded") {
    return "bg-amber-100 text-amber-700 border border-amber-200";
  }
  if (s === "cancelled" || s === "disputed") {
    return "bg-red-100 text-red-700 border border-red-200";
  }
  return "bg-zinc-100 text-zinc-600 border border-zinc-200";
}

type OrderItem = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
};

type OrderResult = {
  id: string;
  orderNumber: string | null;
  status: string;
  items: OrderItem[];
  amounts: { total: number };
  createdAt: string;
};

export default function OrdersPage() {
  const params = useParams();
  const locale = (params?.locale as Locale) || "zh-HK";
  const t = getDict(locale);
  const { format } = useCurrency();

  const [phone, setPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [orders, setOrders] = useState<OrderResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const digitsOnly = phone.replace(/\D/g, "");

    if (digitsOnly.length !== 8) {
      setError("請輸入有效嘅8位電話號碼");
      return;
    }

    setSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/search?phone=${digitsOnly}`);
      const json = await res.json();

      if (json.ok) {
        setOrders(json.data.orders);
      } else {
        setError(json.error?.message || "查詢失敗");
        setOrders([]);
      }
    } catch {
      setError("網絡錯誤，請稍後再試");
      setOrders([]);
    } finally {
      setSearching(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-HK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProductSummary = (items: OrderItem[]) => {
    if (items.length === 0) return "";
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const firstItem = items[0].name;
    if (items.length === 1) {
      return totalQty > 1 ? `${firstItem} x${totalQty}` : firstItem;
    }
    return locale === "zh-HK"
      ? `${firstItem} 等 ${items.length} 件商品`
      : `${firstItem} and ${items.length - 1} more`;
  };

  return (
    <div className="px-4 py-6 pb-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {t.orders.title}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {locale === "zh-HK" ? "輸入電話號碼查詢訂單" : "Enter your phone number to find orders"}
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={locale === "zh-HK" ? "電話號碼 (8位數字)" : "Phone number (8 digits)"}
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center gap-2 rounded-xl bg-olive-600 px-5 py-3 font-semibold text-white hover:bg-olive-700 disabled:opacity-50"
            >
              <Search size={18} />
              {searching
                ? locale === "zh-HK" ? "搜尋中..." : "Searching..."
                : locale === "zh-HK" ? "搜尋" : "Search"}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </form>

        {/* Results */}
        {hasSearched && orders !== null && (
          <div className="mt-8">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-zinc-500 dark:text-zinc-400">
                  {locale === "zh-HK" ? "找不到訂單" : "No orders found"}
                </p>
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  {locale === "zh-HK"
                    ? "請確認電話號碼是否正確"
                    : "Please verify your phone number"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {locale === "zh-HK"
                    ? `找到 ${orders.length} 個訂單`
                    : `Found ${orders.length} order${orders.length > 1 ? "s" : ""}`}
                </p>
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/${locale}/orders/${order.id}`}
                    className="block rounded-2xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {order.orderNumber || order.id.slice(0, 12)}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-xs ${badgeClass(order.status)}`}>
                            {translateStatus(order.status, locale)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                          {getProductSummary(order.items as OrderItem[])}
                        </p>
                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {format(order.amounts.total)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Initial state before search */}
        {!hasSearched && (
          <div className="mt-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <Search size={28} className="text-zinc-400" />
            </div>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400">
              {locale === "zh-HK"
                ? "輸入你嘅電話號碼查詢訂單狀態"
                : "Enter your phone number to check order status"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
