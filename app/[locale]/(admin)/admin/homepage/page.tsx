import { prisma } from "@/lib/prisma";
import { getAdminTenantId } from "@/lib/tenant";
import SidebarToggle from "@/components/admin/SidebarToggle";
import HomepageCMS from "./homepage-cms";
import { getDict, type Locale } from "@/lib/i18n";

export default async function AdminHomepage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDict(locale as Locale);

  const tenantId = await getAdminTenantId();

  // Fetch sections and banners
  const [sections, banners, products] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { tenantId },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageBanner.findMany({
      where: { tenantId },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        imageUrl: true,
        title: true,
        subtitle: true,
        linkUrl: true,
        images: true,
        sortOrder: true,
        active: true,
        position: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    // Fetch products for manual selection with filters
    prisma.product.findMany({
      where: { tenantId, active: true },
      select: { id: true, title: true, imageUrl: true, category: true, shoeType: true, sku: true },
      orderBy: { title: "asc" },
      take: 500,
    }),
  ]);

  // Transform banners to match Banner type (images is JsonValue from Prisma)
  const bannersFormatted = banners.map((b) => ({
    ...b,
    images: b.images as any, // Cast JsonValue to BannerSlide[]
  }));

  return (
    <div className="p-4 pb-16">
      <div className="flex items-center gap-4 mb-6">
        <SidebarToggle />
        <div>
          <div className="text-zinc-500 text-sm">Admin</div>
          <h1 className="text-2xl font-semibold text-zinc-900">Homepage CMS</h1>
          <div className="text-zinc-500 text-sm">管理首頁 Sections 同 Banners</div>
        </div>
      </div>

      <HomepageCMS
        initialSections={sections}
        initialBanners={bannersFormatted}
        products={products}
        locale={locale}
      />
    </div>
  );
}
