"use server";

import { prisma } from "@/lib/prisma";
import { hasFeature } from "@/lib/plan";

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
      // Fetch tenant whatsapp + name for the WhatsApp contact button
      let tenantWhatsapp: string | null = null;
      let tenantName: string | null = null;
      let whatsappEnabled = false;

      const tenantId = result.data.tenantId;
      if (tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { whatsapp: true, name: true },
        });
        tenantWhatsapp = tenant?.whatsapp ?? null;
        tenantName = tenant?.name ?? null;
        whatsappEnabled = await hasFeature(tenantId, "whatsapp");
      }

      return {
        ok: true as const,
        data: result.data,
        tenantWhatsapp,
        tenantName,
        whatsappEnabled,
      };
    } else {
      return { ok: false as const, error: result.error.message };
    }
  } catch (error) {
    return { ok: false as const, error: "Failed to fetch order" };
  }
}
