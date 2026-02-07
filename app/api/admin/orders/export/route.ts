export const runtime = "nodejs";

import { withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function toCsvValue(value: unknown) {
  if (value === null || value === undefined) return "";
  let raw: string;
  if (value instanceof Date) {
    raw = formatDate(value);
  } else if (typeof value === "string") {
    raw = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    raw = String(value);
  } else {
    raw = JSON.stringify(value);
  }

  const needsQuotes = /[",\n\r]/.test(raw);
  let escaped = raw.replace(/"/g, "\"\"");
  if (needsQuotes) escaped = `"${escaped}"`;
  return escaped;
}

export const GET = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  const columns: Array<{ label: string; value: (order: (typeof orders)[number]) => unknown }> = [
    { label: "id", value: (order) => order.id },
    { label: "customer_name", value: (order) => order.customerName },
    { label: "phone", value: (order) => order.phone },
    { label: "email", value: (order) => order.email },
    { label: "status", value: (order) => order.status },
    { label: "fulfillment_type", value: (order) => order.fulfillmentType },
    { label: "note", value: (order) => order.note },
    { label: "amounts", value: (order) => order.amounts },
    { label: "items", value: (order) => order.items },
    { label: "created_at", value: (order) => formatDate(order.createdAt) },
    { label: "updated_at", value: (order) => formatDate(order.updatedAt) },
    { label: "paid_at", value: (order) => formatDate(order.paidAt) },
    { label: "fulfilling_at", value: (order) => formatDate(order.fulfillingAt) },
    { label: "shipped_at", value: (order) => formatDate(order.shippedAt) },
    { label: "completed_at", value: (order) => formatDate(order.completedAt) },
    { label: "cancelled_at", value: (order) => formatDate(order.cancelledAt) },
    { label: "refunded_at", value: (order) => formatDate(order.refundedAt) },
    { label: "disputed_at", value: (order) => formatDate(order.disputedAt) },
  ];

  const header = columns.map((col) => col.label).join(",");
  const rows = orders.map((order) => columns.map((col) => toCsvValue(col.value(order))).join(","));
  const csv = [header, ...rows].join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orders-${today}.csv"`,
    },
  });
});
