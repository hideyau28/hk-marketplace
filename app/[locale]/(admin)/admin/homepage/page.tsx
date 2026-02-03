import { prisma } from "@/lib/prisma";
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

  // Fetch sections and banners
  const [sections, banners, products] = await Promise.all([
    prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageBanner.findMany({
      orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
    }),
    // Fetch products for manual selection
    prisma.product.findMany({
      where: { active: true },
      select: { id: true, title: true, imageUrl: true, category: true },
      orderBy: { title: "asc" },
      take: 500,
    }),
  ]);

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
        initialBanners={banners}
        products={products}
        locale={locale}
      />
    </div>
  );
}
