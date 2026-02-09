export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { prisma } from "@/lib/prisma";

const DELIVERY_OPTIONS: Record<string, { label: string; fulfillmentType: "PICKUP" | "DELIVERY" }> = {
  "sf-locker": { label: "SF 智能櫃", fulfillmentType: "PICKUP" },
  "sf-cod": { label: "順豐到付", fulfillmentType: "DELIVERY" },
  meetup: { label: "面交", fulfillmentType: "PICKUP" },
};

async function generateBioOrderNumber(tenantId: string): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `WX-${dateStr}-`;

  const lastOrder = await prisma.order.findFirst({
    where: { orderNumber: { startsWith: prefix }, tenantId },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });

  let sequence = 1;
  if (lastOrder?.orderNumber) {
    const lastSeq = parseInt(lastOrder.orderNumber.slice(-3), 10);
    if (!isNaN(lastSeq)) sequence = lastSeq + 1;
  }

  return `${prefix}${sequence.toString().padStart(3, "0")}`;
}

type BioLinkOrderPayload = {
  tenantId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    productName: string;
    variant: string | null;
    qty: number;
    price: number;
    image: string | null;
  }>;
  customer: { name: string; phone: string };
  delivery: { method: string };
  payment: { method: string };
  note: string | null;
  total: number;
};

function parsePayload(body: unknown): BioLinkOrderPayload {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }
  const b = body as Record<string, unknown>;

  // tenantId
  if (typeof b.tenantId !== "string" || !b.tenantId) {
    throw new ApiError(400, "BAD_REQUEST", "Missing tenantId");
  }

  // items
  if (!Array.isArray(b.items) || b.items.length === 0) {
    throw new ApiError(400, "BAD_REQUEST", "Missing items");
  }
  for (const item of b.items) {
    if (!item || typeof item !== "object") throw new ApiError(400, "BAD_REQUEST", "Invalid item");
    const i = item as Record<string, unknown>;
    if (typeof i.productId !== "string") throw new ApiError(400, "BAD_REQUEST", "Missing item.productId");
    if (typeof i.productName !== "string") throw new ApiError(400, "BAD_REQUEST", "Missing item.productName");
    if (typeof i.qty !== "number" || i.qty <= 0) throw new ApiError(400, "BAD_REQUEST", "Invalid item.qty");
    if (typeof i.price !== "number" || i.price <= 0) throw new ApiError(400, "BAD_REQUEST", "Invalid item.price");
  }

  // customer
  const cust = b.customer as Record<string, unknown> | undefined;
  if (!cust || typeof cust.name !== "string" || cust.name.trim().length < 2) {
    throw new ApiError(400, "BAD_REQUEST", "Missing or invalid customer.name (min 2 chars)");
  }
  if (typeof cust.phone !== "string" || !/^\d{8}$/.test(cust.phone.trim())) {
    throw new ApiError(400, "BAD_REQUEST", "Missing or invalid customer.phone (8 digits)");
  }

  // delivery
  const del = b.delivery as Record<string, unknown> | undefined;
  if (!del || typeof del.method !== "string" || !DELIVERY_OPTIONS[del.method]) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid delivery.method");
  }

  // payment
  const pay = b.payment as Record<string, unknown> | undefined;
  if (!pay || typeof pay.method !== "string" || !["fps", "payme", "stripe"].includes(pay.method)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid payment.method");
  }

  // total
  if (typeof b.total !== "number" || b.total <= 0) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid total");
  }

  return {
    tenantId: b.tenantId as string,
    items: b.items as BioLinkOrderPayload["items"],
    customer: { name: (cust.name as string).trim(), phone: (cust.phone as string).trim() },
    delivery: { method: del.method as string },
    payment: { method: pay.method as string },
    note: typeof b.note === "string" && b.note.trim() ? b.note.trim() : null,
    total: b.total as number,
  };
}

// POST /api/biolink/orders
export const POST = withApi(async (req) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const payload = parsePayload(body);

  // Validate tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: payload.tenantId },
    select: {
      id: true,
      name: true,
      fpsEnabled: true,
      fpsAccountName: true,
      fpsAccountId: true,
      fpsQrCodeUrl: true,
      paymeEnabled: true,
      paymeLink: true,
      paymeQrCodeUrl: true,
      whatsapp: true,
    },
  });

  if (!tenant) throw new ApiError(404, "NOT_FOUND", "Tenant not found");

  // Server-side repricing: verify prices match DB
  const productIds = Array.from(new Set(payload.items.map((i) => i.productId)));
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, tenantId: tenant.id, active: true },
    select: { id: true, title: true, price: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  let serverTotal = 0;
  const repricedItems: Array<{ productId: string; name: string; unitPrice: number; quantity: number }> = [];

  for (const item of payload.items) {
    const product = productMap.get(item.productId);
    if (!product) throw new ApiError(400, "BAD_REQUEST", `Product not found: ${item.productId}`);
    const lineTotal = product.price * item.qty;
    serverTotal += lineTotal;
    repricedItems.push({
      productId: item.productId,
      name: `${product.title}${item.variant ? ` · ${item.variant}` : ""}`,
      unitPrice: product.price,
      quantity: item.qty,
    });
  }

  // Allow small rounding difference
  if (Math.abs(serverTotal - payload.total) > 1) {
    throw new ApiError(400, "BAD_REQUEST", "Total mismatch (server repriced)");
  }

  // Stock deduction for items with variantId
  for (const item of payload.items) {
    if (!item.variantId) continue;
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      select: { id: true, stock: true, name: true },
    });
    if (!variant) throw new ApiError(400, "BAD_REQUEST", `Variant not found: ${item.variantId}`);
    if (variant.stock < item.qty) {
      throw new ApiError(400, "BAD_REQUEST", `${variant.name} 庫存不足`);
    }
    await prisma.productVariant.update({
      where: { id: item.variantId },
      data: {
        stock: { decrement: item.qty },
        // 如果扣到 0，自動設為 inactive
        ...(variant.stock - item.qty <= 0 ? { active: false } : {}),
      },
    });
  }

  const deliveryOpt = DELIVERY_OPTIONS[payload.delivery.method];
  const orderNumber = await generateBioOrderNumber(tenant.id);

  const order = await prisma.order.create({
    data: {
      tenantId: tenant.id,
      orderNumber,
      customerName: payload.customer.name,
      phone: payload.customer.phone,
      items: repricedItems,
      amounts: { subtotal: serverTotal, total: serverTotal, currency: "HKD" },
      fulfillmentType: deliveryOpt.fulfillmentType,
      fulfillmentAddress:
        deliveryOpt.fulfillmentType === "DELIVERY"
          ? { line1: deliveryOpt.label, notes: payload.delivery.method }
          : undefined,
      status: "PENDING",
      paymentMethod: payload.payment.method,
      paymentStatus: "pending",
      note: payload.note || null,
    },
  });

  // Build response
  const response: Record<string, unknown> = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: "pending_payment",
  };

  if (payload.payment.method === "fps" && tenant.fpsEnabled) {
    response.fpsInfo = {
      accountName: tenant.fpsAccountName,
      id: tenant.fpsAccountId,
      qrCode: tenant.fpsQrCodeUrl,
    };
  }

  if (payload.payment.method === "payme" && tenant.paymeEnabled) {
    response.paymeInfo = {
      link: tenant.paymeLink,
      qrCode: tenant.paymeQrCodeUrl,
    };
  }

  response.whatsapp = tenant.whatsapp;
  response.storeName = tenant.name;
  response.total = serverTotal;

  return ok(req, response);
});
