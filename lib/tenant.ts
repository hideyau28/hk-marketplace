import { prisma } from "@/lib/prisma";

export type TenantContext = {
  id: string;
  slug: string;
  name: string;
  currency: string;
  region: string;
  timezone: string;
  languages: string[];
  themeColor: string;
  status: string;
};

const DEFAULT_SLUG = "hk-marketplace";

export async function resolveTenant(req?: Request): Promise<TenantContext> {
  let slug = DEFAULT_SLUG;

  // Future: subdomain / custom domain routing
  // const host = req?.headers.get("host") || "";
  // const subdomain = host.split(".")[0];
  // if (subdomain && subdomain !== "www") slug = subdomain;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      currency: true,
      region: true,
      timezone: true,
      languages: true,
      themeColor: true,
      status: true,
    },
  });

  if (!tenant || tenant.status !== "active") {
    throw new Error("Tenant not found or inactive");
  }

  return tenant as TenantContext;
}

export async function getTenantId(req?: Request): Promise<string> {
  const tenant = await resolveTenant(req);
  return tenant.id;
}
