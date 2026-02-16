import { MetadataRoute } from "next";

const BASE_URL = "https://wowlix.com";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/zh-HK`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/en/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/zh-HK/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Dynamic tenant store pages — lazy-import prisma to avoid build-time crash when DATABASE_URL is unset
  let tenantPages: MetadataRoute.Sitemap = [];
  try {
    const { prisma } = await import("@/lib/prisma");
    const tenants = await prisma.tenant.findMany({
      where: { status: "active" },
      select: { slug: true, updatedAt: true },
    });

    tenantPages = tenants.flatMap((t) => [
      {
        url: `${BASE_URL}/en/${t.slug}`,
        lastModified: t.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/zh-HK/${t.slug}`,
        lastModified: t.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      },
    ]);
  } catch (err) {
    console.error("[sitemap] tenant query failed:", err);
  }

  return [...staticPages, ...tenantPages];
}
