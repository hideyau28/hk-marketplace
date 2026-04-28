import { prisma } from "@/lib/prisma";
import { getServerTenantId } from "@/lib/tenant";

export type TenantInfo = {
  id: string;
  slug: string;
  name: string;
  region: string;
  currency: string;
  whatsapp: string | null;
  instagram: string | null;
  socialLinks: Array<{ platform: string; url: string }>;
  description: string | null;
  coverPhoto: string | null;
};

/**
 * Fetch tenant info (slug, region, etc.) for server components.
 * Used by content pages to render tenant-specific content.
 */
export async function getTenantInfo(): Promise<TenantInfo> {
  const tenantId = await getServerTenantId();
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      slug: true,
      name: true,
      region: true,
      currency: true,
      whatsapp: true,
      instagram: true,
      socialLinks: true,
      description: true,
      coverPhoto: true,
    },
  });

  if (!tenant) {
    return {
      id: tenantId,
      slug: "maysshop",
      name: "WoWlix",
      region: "HK",
      currency: "HKD",
      whatsapp: null,
      instagram: null,
      socialLinks: [],
      description: null,
      coverPhoto: null,
    };
  }

  return {
    ...tenant,
    socialLinks:
      (tenant.socialLinks as Array<{ platform: string; url: string }>) || [],
  };
}
