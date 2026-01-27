"use server";

import { revalidatePath } from "next/cache";
import type { Order } from "@prisma/client";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "FULFILLING",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
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

type FetchOrdersOk = { ok: true; data: Order[] };

type FetchOrdersResult = FetchOrdersOk | ActionFail;

type UpdateOrderOk = { ok: true; data: Order };

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

export async function fetchOrders(status?: string): Promise<FetchOrdersResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL("/api/orders", getApiBaseUrl());
    if (status) {
      url.searchParams.set("status", status);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<{ orders: Order[] }>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to fetch orders",
      };
    }

    const result = json as ApiSuccessResponse<{ orders: Order[] }>;
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

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Order>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to update order",
      };
    }

    const result = json as ApiSuccessResponse<Order>;
    if (locale) revalidatePath(`/${locale}/admin/orders`, "page");
    return { ok: true, data: result.data };
  } catch (error) {
    console.error("Failed to update order:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to update order" };
  }
}
