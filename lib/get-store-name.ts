import { prisma } from "@/lib/prisma";
import { getServerTenantId } from "@/lib/tenant";

const DEFAULT_STORE_NAME = "May's Shop";

/**
 * Fetch store name from database with fallback.
 * Resolves tenantId from request headers (server component context).
 */
export async function getStoreName(): Promise<string> {
  try {
    const tenantId = await getServerTenantId();
    const settings = await prisma.storeSettings.findFirst({
      where: { tenantId },
      select: { storeName: true },
    });
    return settings?.storeName || DEFAULT_STORE_NAME;
  } catch (error) {
    console.error("Failed to fetch store name:", error);
    return DEFAULT_STORE_NAME;
  }
}

/**
 * Fetch store settings including name, tagline, etc.
 */
export async function getStoreSettings() {
  try {
    const tenantId = await getServerTenantId();
    const settings = await prisma.storeSettings.findFirst({
      where: { tenantId },
    });
    return {
      storeName: settings?.storeName || DEFAULT_STORE_NAME,
      tagline: settings?.tagline || "",
    };
  } catch (error) {
    console.error("Failed to fetch store settings:", error);
    return {
      storeName: DEFAULT_STORE_NAME,
      tagline: "",
    };
  }
}
