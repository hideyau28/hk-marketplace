import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { getTenantId } from "@/lib/tenant";

type LogActivityParams = {
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
  tenantId?: string;
};

export async function logAdminActivity(params: LogActivityParams): Promise<void> {
  try {
    const { action, resource, resourceId, details, request } = params;

    // Resolve tenantId: explicit param > request header > default
    const tenantId = params.tenantId || await getTenantId(request);

    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (request) {
      // Get IP address
      const forwarded = request.headers.get("x-forwarded-for");
      ipAddress = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || undefined;

      // Get user agent
      userAgent = request.headers.get("user-agent") || undefined;
    }

    await prisma.adminLog.create({
      data: {
        tenantId,
        action,
        resource,
        resourceId,
        details: (details as Prisma.InputJsonValue) || undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't fail the main operation
    console.error("Failed to log admin activity:", error);
  }
}

export const ADMIN_ACTIONS = {
  // Auth
  LOGIN: "admin.login",
  LOGOUT: "admin.logout",

  // Products
  PRODUCT_CREATE: "product.create",
  PRODUCT_UPDATE: "product.update",
  PRODUCT_DELETE: "product.delete",
  PRODUCT_IMPORT: "product.import",

  // Orders
  ORDER_UPDATE: "order.update",
  ORDER_EXPORT: "order.export",

  // Settings
  SETTINGS_UPDATE: "settings.update",
} as const;
