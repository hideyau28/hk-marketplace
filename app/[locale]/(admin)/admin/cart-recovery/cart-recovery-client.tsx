"use client";

import { useState } from "react";
import { ShoppingCart, DollarSign, TrendingDown, MessageCircle, Clock, User, Phone } from "lucide-react";
import type { Locale } from "@/lib/i18n";

type AbandonedOrder = {
  id: string;
  orderNumber: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  items: any;
  amounts: any;
  createdAt: string;
  abandonedAt: string | null;
};

type Draft = {
  id: string;
  customerName: string | null;
  phone: string | null;
  email: string | null;
  items: any;
  amounts: any;
  createdAt: string;
  updatedAt: string;
};

type Stats = {
  totalOrdersLast30: number;
  abandonedOrdersLast30: number;
  abandonmentRate: number;
  abandonedRevenue: number;
};

type Props = {
  locale: Locale;
  abandonedOrders: AbandonedOrder[];
  drafts: Draft[];
  stats: Stats;
  merchantWhatsApp: string | null;
};

type TabType = "orders" | "drafts";

function formatDate(dateStr: string, locale: Locale): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === "zh-HK" ? "zh-HK" : "en-HK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getItemsSummary(items: any): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((item: any) => {
      const name = item.name || item.title || "";
      const qty = item.quantity || item.qty || 1;
      return `${name} ×${qty}`;
    })
    .join(", ");
}

function buildRecoveryWhatsAppUrl(
  phone: string,
  customerName: string,
  items: any,
  locale: Locale
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.length === 8 ? `852${cleanPhone}` : cleanPhone;

  const itemNames = Array.isArray(items)
    ? items.map((i: any) => i.name || i.title || "").filter(Boolean).join("、")
    : "";

  const message =
    locale === "zh-HK"
      ? `你好 ${customerName}，你早前揀咗 ${itemNames}，仲有興趣嗎？我哋可以幫你留貨。`
      : `Hi ${customerName}, you were interested in ${itemNames} earlier. Still interested? We can reserve it for you.`;

  return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`rounded-2xl border p-5 ${color}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm opacity-80">{label}</div>
          <div className="text-2xl font-bold mt-1">{value}</div>
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
    </div>
  );
}

export default function CartRecoveryClient({
  locale,
  abandonedOrders,
  drafts,
  stats,
  merchantWhatsApp,
}: Props) {
  const [tab, setTab] = useState<TabType>("orders");
  const isZh = locale === "zh-HK";

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={isZh ? "棄單數 (30天)" : "Abandoned (30d)"}
          value={stats.abandonedOrdersLast30}
          icon={<ShoppingCart size={22} />}
          color="bg-red-50 border-red-200 text-red-800"
        />
        <StatCard
          label={isZh ? "棄單率" : "Abandonment Rate"}
          value={`${stats.abandonmentRate}%`}
          icon={<TrendingDown size={22} />}
          color="bg-amber-50 border-amber-200 text-amber-800"
        />
        <StatCard
          label={isZh ? "潛在收入" : "Potential Revenue"}
          value={`$${stats.abandonedRevenue.toLocaleString("en-HK")}`}
          icon={<DollarSign size={22} />}
          color="bg-orange-50 border-orange-200 text-orange-800"
        />
        <StatCard
          label={isZh ? "總訂單 (30天)" : "Total Orders (30d)"}
          value={stats.totalOrdersLast30}
          icon={<ShoppingCart size={22} />}
          color="bg-zinc-50 border-zinc-200 text-zinc-800"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("orders")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "orders"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {isZh ? "棄單訂單" : "Abandoned Orders"} ({abandonedOrders.length})
        </button>
        <button
          onClick={() => setTab("drafts")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            tab === "drafts"
              ? "bg-olive-600 text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          {isZh ? "未完成結帳" : "Incomplete Checkouts"} ({drafts.length})
        </button>
      </div>

      {/* Abandoned Orders List */}
      {tab === "orders" && (
        <div className="space-y-3">
          {abandonedOrders.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-12 text-center text-zinc-500">
              {isZh ? "暫時冇棄單訂單" : "No abandoned orders yet"}
            </div>
          ) : (
            abandonedOrders.map((order) => {
              const amounts = order.amounts as any;
              const total = amounts?.total || 0;
              const itemsSummary = getItemsSummary(order.items);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-zinc-500">
                          {order.orderNumber || `#${order.id.slice(0, 8)}`}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          {isZh ? "棄單" : "Abandoned"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-zinc-900 font-medium">
                        <User size={14} className="text-zinc-400" />
                        {order.customerName}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                        <Phone size={12} className="text-zinc-400" />
                        {order.phone}
                      </div>

                      {itemsSummary && (
                        <div className="text-xs text-zinc-500 mt-1 truncate max-w-md">
                          {itemsSummary}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                        <Clock size={12} />
                        {isZh ? "棄單時間：" : "Abandoned: "}
                        {order.abandonedAt
                          ? formatDate(order.abandonedAt, locale)
                          : formatDate(order.createdAt, locale)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold text-zinc-900">
                          ${total.toLocaleString("en-HK")}
                        </div>
                      </div>

                      {/* WhatsApp 跟進 */}
                      <a
                        href={buildRecoveryWhatsAppUrl(
                          order.phone,
                          order.customerName,
                          order.items,
                          locale
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors whitespace-nowrap"
                      >
                        <MessageCircle size={16} />
                        {isZh ? "WhatsApp 跟進" : "WhatsApp"}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Checkout Drafts List */}
      {tab === "drafts" && (
        <div className="space-y-3">
          {drafts.length === 0 ? (
            <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-12 text-center text-zinc-500">
              {isZh ? "暫時冇未完成結帳記錄" : "No incomplete checkouts yet"}
            </div>
          ) : (
            drafts.map((draft) => {
              const amounts = draft.amounts as any;
              const total = amounts?.total || 0;
              const itemsSummary = getItemsSummary(draft.items);

              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                          {isZh ? "未完成結帳" : "Incomplete"}
                        </span>
                      </div>

                      {draft.customerName && (
                        <div className="flex items-center gap-2 text-sm text-zinc-900 font-medium">
                          <User size={14} className="text-zinc-400" />
                          {draft.customerName}
                        </div>
                      )}

                      {draft.phone && (
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-1">
                          <Phone size={12} className="text-zinc-400" />
                          {draft.phone}
                        </div>
                      )}

                      {itemsSummary && (
                        <div className="text-xs text-zinc-500 mt-1 truncate max-w-md">
                          {itemsSummary}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-zinc-400 mt-2">
                        <Clock size={12} />
                        {isZh ? "最後更新：" : "Last updated: "}
                        {formatDate(draft.updatedAt, locale)}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {total > 0 && (
                        <div className="text-right">
                          <div className="text-lg font-semibold text-zinc-900">
                            ${total.toLocaleString("en-HK")}
                          </div>
                        </div>
                      )}

                      {draft.phone && (
                        <a
                          href={buildRecoveryWhatsAppUrl(
                            draft.phone,
                            draft.customerName || "",
                            draft.items,
                            locale
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors whitespace-nowrap"
                        >
                          <MessageCircle size={16} />
                          {isZh ? "WhatsApp 跟進" : "WhatsApp"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </>
  );
}
