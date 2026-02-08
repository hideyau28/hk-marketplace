export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";
import { getProvider } from "@/lib/payments/registry";

// PUT /api/admin/payment-config/:providerId
// Upsert 商戶 payment provider 設定
export const PUT = withApi(
  async (
    req: Request,
    { params }: { params: Promise<{ providerId: string }> }
  ) => {
    const { tenantId } = await authenticateAdmin(req);
    const { providerId } = await params;

    // Validate provider exists in registry
    const provider = getProvider(providerId);
    if (!provider) {
      throw new ApiError(404, "NOT_FOUND", `Provider "${providerId}" not found`);
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    if (!body || typeof body !== "object") {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    const { enabled, config, displayName, sortOrder } = body;

    if (typeof enabled !== "boolean") {
      throw new ApiError(400, "BAD_REQUEST", "enabled must be a boolean");
    }

    // Validate config against provider.configFields (required fields)
    if (enabled && provider.configFields.length > 0) {
      const configObj = config && typeof config === "object" ? config : {};
      for (const field of provider.configFields) {
        if (field.required) {
          const value = configObj[field.key];
          if (value === undefined || value === null || value === "") {
            throw new ApiError(
              400,
              "BAD_REQUEST",
              `Missing required config field: ${field.labelZh || field.label} (${field.key})`
            );
          }
        }
      }
    }

    // Upsert TenantPaymentConfig
    const result = await prisma.tenantPaymentConfig.upsert({
      where: {
        tenantId_providerId: { tenantId, providerId },
      },
      update: {
        enabled,
        config: config ?? {},
        displayName: displayName ?? null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
      create: {
        tenantId,
        providerId,
        enabled,
        config: config ?? {},
        displayName: displayName ?? null,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return ok(req, result);
  }
);
