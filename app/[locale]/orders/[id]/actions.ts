"use server";

export async function getOrderById(orderId: string) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return { ok: false as const, error: "Admin secret not configured" };
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const response = await fetch(`${apiUrl}/api/orders/${orderId}`, {
      headers: {
        "x-admin-secret": adminSecret,
      },
      cache: "no-store",
    });

    const result = await response.json();

    if (result.ok) {
      return { ok: true as const, data: result.data };
    } else {
      return { ok: false as const, error: result.error.message };
    }
  } catch (error) {
    return { ok: false as const, error: "Failed to fetch order" };
  }
}
