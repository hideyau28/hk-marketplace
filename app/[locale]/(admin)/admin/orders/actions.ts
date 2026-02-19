"use server";

import { cookies } from "next/headers";
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

type FetchOrdersOk = {
  ok: true;
  data: OrderWithPayments[];
  total: number;
  page: number;
  pageSize: number;
};

type FetchOrdersResult = FetchOrdersOk | ActionFail;

type UpdateOrderOk = { ok: true; data: OrderWithPayments };

type UpdateOrderResult = UpdateOrderOk | ActionFail;

function getApiBaseUrl() {
  // Server-side calls back into this same app.
  // Prefer an explicit base URL when deployed.
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit) return explicit;

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  const zeaburUrl = process.env.ZEABUR_URL || process.env.ZEABUR_DOMAIN;
  if (zeaburUrl) return zeaburUrl.startsWith("http") ? zeaburUrl : `https://${zeaburUrl}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL is required");
  return baseUrl;
}

/**
 * Get auth headers for admin API calls.
 * JWT token 優先，fallback 到 ADMIN_SECRET（super admin）
 */
async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  // 1. Try JWT cookie (tenant admin)
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("tenant-admin-token");
    if (jwt?.value) {
      return { Authorization: `Bearer ${jwt.value}` };
    }
  } catch {
    // cookies() not available, fall through
  }

  // 2. Fallback to ADMIN_SECRET (super admin)
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret) {
    return { "x-admin-secret": adminSecret };
  }

  return {};
}

export async function fetchOrders(status?: string, search?: string, page?: number): Promise<FetchOrdersResult> {
  const authHeaders = await getAdminAuthHeaders();
  if (Object.keys(authHeaders).length === 0) {
    return { ok: false, code: "CONFIG_ERROR", message: "No admin credentials available" };
  }

  try {
    const url = new URL("/api/orders", getApiBaseUrl());
    if (status) {
      url.searchParams.set("status", status);
    }
    if (search) {
      url.searchParams.set("q", search);
    }
    if (page && page > 1) {
      url.searchParams.set("page", String(page));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<{ orders: OrderWithPayments[]; total: number; page: number; pageSize: number }>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to fetch orders",
      };
    }

    const result = json as ApiSuccessResponse<{ orders: OrderWithPayments[]; total: number; page: number; pageSize: number }>;
    return {
      ok: true,
      data: result.data.orders,
      total: result.data.total,
      page: result.data.page,
      pageSize: result.data.pageSize,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to fetch orders" };
  }
}

export async function updateOrderStatus(orderId: string, status: string, locale?: string): Promise<UpdateOrderResult> {
  const authHeaders = await getAdminAuthHeaders();
  if (Object.keys(authHeaders).length === 0) {
    return { ok: false, code: "CONFIG_ERROR", message: "No admin credentials available" };
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
        ...authHeaders,
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
