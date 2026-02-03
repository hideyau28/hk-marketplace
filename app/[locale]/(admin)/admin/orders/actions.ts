"use server";

import { revalidatePath } from "next/cache";
import type { Order, PaymentAttempt } from "@prisma/client";

// Extended Order type with paymentAttempts
export type OrderWithPayments = Order & {
  paymentAttempts: Array<Pick<
    PaymentAttempt,
    | "id"
    | "provider"
    | "status"
    | "amount"
    | "currency"
    | "stripeCheckoutSessionId"
    | "stripePaymentIntentId"
    | "stripeChargeId"
    | "failureCode"
    | "failureMessage"
    | "createdAt"
    | "updatedAt"
  >>;
};

const ORDER_STATUSES = [
  // New status flow
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
  // Legacy statuses
  "PAID",
  "FULFILLING",
  "DISPUTED",
] as const;

type ApiErrorResponse = {
  ok: false;
  requestId: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type ApiSuccessResponse<T> = {
  ok: true;
  requestId: string;
  data: T;
};

type ActionFail = { ok: false; code: string; message: string };

type FetchOrdersOk = { ok: true; data: OrderWithPayments[] };

type FetchOrdersResult = FetchOrdersOk | ActionFail;

type UpdateOrderOk = { ok: true; data: OrderWithPayments };

type UpdateOrderResult = UpdateOrderOk | ActionFail;

function getApiBaseUrl() {
  // Server-side calls back into this same app.
  // Prefer an explicit base URL when deployed; fall back to local dev port 3012.
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const zeaburUrl = process.env.ZEABUR_URL || process.env.ZEABUR_DOMAIN;
  if (zeaburUrl) return zeaburUrl.startsWith("http") ? zeaburUrl : `https://${zeaburUrl}`;

  return "http://localhost:3012";
}

export async function fetchOrders(status?: string, search?: string): Promise<FetchOrdersResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL("/api/orders", getApiBaseUrl());
    if (status) {
      url.searchParams.set("status", status);
    }
    if (search) {
      url.searchParams.set("q", search);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<{ orders: OrderWithPayments[] }>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to fetch orders",
      };
    }

    const result = json as ApiSuccessResponse<{ orders: OrderWithPayments[] }>;
    return { ok: true, data: result.data.orders };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(orderId: string, status: string, locale?: string): Promise<UpdateOrderResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  // Validate status
  const normalizedStatus = status.toUpperCase();
  if (!ORDER_STATUSES.includes(normalizedStatus as any)) {
    return { ok: false, code: "BAD_REQUEST", message: `Invalid status: ${status}` };
  }

  try {
    const url = new URL(`/api/orders/${orderId}`, getApiBaseUrl());
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: normalizedStatus }),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<OrderWithPayments>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to update order",
      };
    }

    const result = json as ApiSuccessResponse<OrderWithPayments>;
    if (locale) revalidatePath(`/${locale}/admin/orders`, "page");
    return { ok: true, data: result.data };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to update order" };
  }
}
