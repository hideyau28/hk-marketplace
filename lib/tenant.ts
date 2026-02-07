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

/**
 * Known hostnames that should resolve to the default tenant
 * rather than being treated as a subdomain slug.
 */
const DEFAULT_HOSTS = new Set(["hk-marketplace", "www", "localhost", "127.0.0.1"]);

/**
 * Extract tenant slug from a hostname string.
 * Pattern: {slug}.hk-marketplace.vercel.app
 * Returns DEFAULT_SLUG for bare domain, www, or localhost.
 */
export function resolveSlugFromHostname(hostname: string): string {
  // Strip port if present (e.g. localhost:3012)
  const host = hostname.split(":")[0];

  // Single-label host (no dots) — e.g. "localhost"
  if (!host.includes(".")) {
    return DEFAULT_SLUG;
  }

  const subdomain = host.split(".")[0];

  if (DEFAULT_HOSTS.has(subdomain)) {
    return DEFAULT_SLUG;
  }

  return subdomain;
}

/**
 * Resolve the current tenant.
 *
 * Priority:
 * 1. x-tenant-slug header (set by middleware)
 * 2. Hostname-based subdomain parsing
 * 3. ?tenant= query param (dev fallback)
 * 4. Default slug "hk-marketplace"
 */
export async function resolveTenant(req?: Request): Promise<TenantContext> {
  let slug = DEFAULT_SLUG;

  if (req) {
    // 1. Middleware already resolved the slug
    const headerSlug = req.headers.get("x-tenant-slug");
    if (headerSlug) {
      slug = headerSlug;
    } else {
      // 2. Parse subdomain from host header
      const host = req.headers.get("host") || "";
      if (host) {
        slug = resolveSlugFromHostname(host);
      }

      // 3. Dev fallback: ?tenant= query param
      try {
        const url = new URL(req.url);
        const tenantParam = url.searchParams.get("tenant");
        if (tenantParam) {
          slug = tenantParam;
        }
      } catch {
        // Ignore URL parsing errors
      }
    }
  }

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
  // Fast path: if middleware already resolved the tenant ID
  if (req) {
    const cachedId = req.headers.get("x-tenant-id");
    if (cachedId) {
      return cachedId;
    }
  }

  const tenant = await resolveTenant(req);
  return tenant.id;
}
