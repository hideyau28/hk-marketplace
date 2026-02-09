"use server";

import { revalidatePath } from "next/cache";
import type { Product } from "@prisma/client";

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

type FetchProductsOk = { ok: true; data: Product[] };
type FetchProductsResult = FetchProductsOk | ActionFail;

type CreateProductOk = { ok: true; data: Product };
type CreateProductResult = CreateProductOk | ActionFail;

type UpdateProductOk = { ok: true; data: Product };
type UpdateProductResult = UpdateProductOk | ActionFail;

type ToggleFeaturedOk = { ok: true };
type ToggleFeaturedResult = ToggleFeaturedOk | ActionFail;

type ToggleHotSellingOk = { ok: true };
type ToggleHotSellingResult = ToggleHotSellingOk | ActionFail;

type UpdatePriceOk = { ok: true };
type UpdatePriceResult = UpdatePriceOk | ActionFail;

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

export async function fetchProducts(active?: boolean): Promise<FetchProductsResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL("/api/admin/products", getApiBaseUrl());
    if (active !== undefined) {
      url.searchParams.set("active", String(active));
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<{ products: Product[] }>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to fetch products",
      };
    }

    const result = json as ApiSuccessResponse<{ products: Product[] }>;
    return { ok: true, data: result.data.products };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to fetch products" };
  }
}

export async function createProduct(
  data: {
    brand: string;
    title: string;
    price: number;
    originalPrice?: number | null;
    imageUrl?: string;
    images?: string[];
    badges?: string[];
    category?: string | null;
    active?: boolean;
    featured?: boolean;
    shoeType?: string | null;
    sizeSystem?: string | null;
    sizes?: Record<string, number> | null;
    stock?: number;
    promotionBadges?: string[];
    variantLabel?: string | null;
    variants?: Record<string, { qty: number; status: string }> | null;
    promoEndDate?: string | null;
  },
  locale?: string
): Promise<CreateProductResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL("/api/admin/products", getApiBaseUrl());
    const idempotencyKey = `create-product-${Date.now()}-${Math.random()}`;

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "x-admin-secret": adminSecret,
        "x-idempotency-key": idempotencyKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Product>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to create product",
      };
    }

    const result = json as ApiSuccessResponse<Product>;
    if (locale) revalidatePath(`/${locale}/admin/products`, "page");
    return { ok: true, data: result.data };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to create product" };
  }
}

export async function updateProduct(
  productId: string,
  data: {
    brand?: string | null;
    title?: string;
    price?: number;
    originalPrice?: number | null;
    imageUrl?: string | null;
    images?: string[];
    badges?: string[];
    category?: string | null;
    active?: boolean;
    featured?: boolean;
    shoeType?: string | null;
    sizeSystem?: string | null;
    sizes?: Record<string, number> | null;
    stock?: number;
    promotionBadges?: string[];
    variantLabel?: string | null;
    variants?: Record<string, { qty: number; status: string }> | null;
    promoEndDate?: string | null;
  },
  locale?: string
): Promise<UpdateProductResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL(`/api/admin/products/${productId}`, getApiBaseUrl());
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Product>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to update product",
      };
    }

    const result = json as ApiSuccessResponse<Product>;
    if (locale) revalidatePath(`/${locale}/admin/products`, "page");
    return { ok: true, data: result.data };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to update product" };
  }
}

export async function toggleFeatured(
  productId: string,
  featured: boolean
): Promise<ToggleFeaturedResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL(`/api/admin/products/${productId}`, getApiBaseUrl());
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ featured }),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Product>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to toggle featured",
      };
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Failed to toggle featured:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to toggle featured" };
  }
}

export async function toggleHotSelling(
  productId: string,
  currentBadges: string[],
  add: boolean
): Promise<ToggleHotSellingResult> {
  const adminSecret = process.env.ADMIN_SECRET;
  const HOT_SELLING_BADGE = "今期熱賣";

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    // Calculate new badges array
    let newBadges: string[];
    if (add) {
      newBadges = currentBadges.includes(HOT_SELLING_BADGE)
        ? currentBadges
        : [...currentBadges, HOT_SELLING_BADGE];
    } else {
      newBadges = currentBadges.filter((b) => b !== HOT_SELLING_BADGE);
    }

    const url = new URL(`/api/admin/products/${productId}`, getApiBaseUrl());
    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ promotionBadges: newBadges }),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Product>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to toggle hot selling",
      };
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Failed to toggle hot selling:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to toggle hot selling" };
  }
}

export async function updatePrice(
  productId: string,
  price: number,
  originalPrice?: number | null
): Promise<UpdatePriceResult> {
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret) {
    return { ok: false, code: "CONFIG_ERROR", message: "Admin secret not configured" };
  }

  try {
    const url = new URL(`/api/admin/products/${productId}`, getApiBaseUrl());
    const body: Record<string, any> = { price };
    if (originalPrice !== undefined) {
      body.originalPrice = originalPrice;
    }

    const response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        "x-admin-secret": adminSecret,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const json = (await response.json()) as ApiErrorResponse | ApiSuccessResponse<Product>;

    if (!response.ok) {
      const errorData = json as ApiErrorResponse;
      return {
        ok: false,
        code: errorData.error?.code || "UNKNOWN_ERROR",
        message: errorData.error?.message || "Failed to update price",
      };
    }

    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    console.error("Failed to update price:", error);
    return { ok: false, code: "NETWORK_ERROR", message: "Failed to update price" };
  }
}
