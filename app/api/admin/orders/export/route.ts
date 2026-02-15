export const runtime = "nodejs";

import { ApiError, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { hasFeature } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  let escaped = raw.replace(/"/g, '""');
  if (needsQuotes) escaped = `"${escaped}"`;
  return escaped;
}

/** Extract flat product names from items JSON */
function formatItems(items: unknown): string {
  if (!Array.isArray(items)) return "";
  return items
    .map((i: any) => {
      const name = i.name || "";
      const variant = i.variant ? ` (${i.variant})` : "";
      return `${name}${variant}`;
    })
    .join("; ");
}

/** Sum total quantity from items JSON */
function formatQuantity(items: unknown): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
}

/** Format fulfillment address to a single string */
function formatAddress(addr: unknown): string {
  if (!addr || typeof addr !== "object") return "";
  const a = addr as Record<string, string>;
  return [a.line1, a.district, a.notes].filter(Boolean).join(", ");
}

// ---------------------------------------------------------------------------
// Column definitions — matches requested spec
// 訂單號, 日期, 客人名, 電話, Email, 產品, 數量, 金額, 付款方式, 狀態, 送貨方式, 地址
// ---------------------------------------------------------------------------

type OrderRow = {
  orderNumber: string | null;
  createdAt: Date;
  customerName: string;
  phone: string;
  email: string | null;
  items: unknown;
  amounts: unknown;
  paymentMethod: string | null;
  status: string;
  fulfillmentType: string;
  fulfillmentAddress: unknown;
};

const COLUMNS: Array<{ label: string; value: (o: OrderRow) => unknown }> = [
  { label: "order_number", value: (o) => o.orderNumber ?? "" },
  { label: "date", value: (o) => formatDate(o.createdAt) },
  { label: "customer_name", value: (o) => o.customerName },
  { label: "phone", value: (o) => o.phone },
  { label: "email", value: (o) => o.email ?? "" },
  { label: "products", value: (o) => formatItems(o.items) },
  { label: "quantity", value: (o) => formatQuantity(o.items) },
  { label: "total", value: (o) => (o.amounts as any)?.total ?? "" },
  { label: "payment_method", value: (o) => o.paymentMethod ?? "" },
  { label: "status", value: (o) => o.status },
  { label: "fulfillment_type", value: (o) => o.fulfillmentType },
  { label: "address", value: (o) => formatAddress(o.fulfillmentAddress) },
];

const HEADER_ROW = COLUMNS.map((c) => c.label).join(",") + "\n";

// UTF-8 BOM for Excel / Numbers 中文支援
const BOM = "\uFEFF";

// Batch size for cursor-based streaming
const BATCH_SIZE = 200;

// ---------------------------------------------------------------------------
// GET /api/admin/orders/export?format=csv&from=&to=&status=&q=
// ---------------------------------------------------------------------------

export const GET = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  // Plan gating — csv_export 只限 Lite+ plan
  const allowed = await hasFeature(tenantId, "csv_export");
  if (!allowed) {
    throw new ApiError(403, "FORBIDDEN", "CSV export requires Lite plan or above");
  }

  // Parse query params
  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");
  const statusParam = url.searchParams.get("status");
  const qParam = url.searchParams.get("q");

  // Build where clause
  const where: Record<string, unknown> = { tenantId };

  // Date range filter
  if (fromParam || toParam) {
    const createdAt: Record<string, Date> = {};
    if (fromParam) {
      const from = new Date(fromParam);
      if (!Number.isNaN(from.getTime())) createdAt.gte = from;
    }
    if (toParam) {
      const to = new Date(toParam);
      if (!Number.isNaN(to.getTime())) {
        // End of day inclusive
        to.setHours(23, 59, 59, 999);
        createdAt.lte = to;
      }
    }
    if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;
  }

  // Status filter
  if (statusParam) {
    where.status = statusParam.toUpperCase();
  }

  // Search filter (order number or phone)
  if (qParam) {
    where.OR = [
      { orderNumber: { contains: qParam, mode: "insensitive" } },
      { phone: { contains: qParam } },
    ];
  }

  const today = new Date().toISOString().slice(0, 10);

  // Stream response — cursor-based pagination
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // BOM + header
        controller.enqueue(encoder.encode(BOM + HEADER_ROW));

        let cursor: string | undefined;
        let hasMore = true;

        while (hasMore) {
          const batch = await prisma.order.findMany({
            where: where as any,
            orderBy: { createdAt: "desc" },
            take: BATCH_SIZE,
            ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              customerName: true,
              phone: true,
              email: true,
              items: true,
              amounts: true,
              paymentMethod: true,
              status: true,
              fulfillmentType: true,
              fulfillmentAddress: true,
            },
          });

          if (batch.length === 0) {
            hasMore = false;
            break;
          }

          const chunk = batch
            .map((order) =>
              COLUMNS.map((col) => toCsvValue(col.value(order as unknown as OrderRow))).join(",")
            )
            .join("\n") + "\n";

          controller.enqueue(encoder.encode(chunk));

          if (batch.length < BATCH_SIZE) {
            hasMore = false;
          } else {
            cursor = batch[batch.length - 1].id;
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="orders_${today}.csv"`,
      "cache-control": "no-store",
    },
  });
});
