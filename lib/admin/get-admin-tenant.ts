import { prisma } from "@/lib/prisma";
import { getSessionTenantId } from "./session";

export type AdminTenant = {
  id: string;
  name: string;
  slug: string;
  brandColor: string;
};

/**
 * Get the current admin's tenant from the session cookie.
 * Used by server components (dashboard, sidebar, etc.) to resolve tenant-scoped data.
 * Returns null if no valid session or tenant not found.
 */
export async function getAdminTenant(): Promise<AdminTenant | null> {
  const tenantId = await getSessionTenantId();
  if (!tenantId) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, slug: true, brandColor: true },
  });

  if (!tenant) return null;
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    brandColor: tenant.brandColor ?? "#FF9500",
  };
}
