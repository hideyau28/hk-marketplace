import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import ShelfRow from "@/components/ShelfRow";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);

  // Fetch products from DB
  const dbProducts = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  // Map DB products to expected format (with image and shopName)
  const products = dbProducts.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    shopName: "HK Marketplace",
  }));

  return (
    <div className="pb-16">
      <div className="px-4 pt-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6">
          <div className="text-zinc-600 text-sm">HK Marketplace</div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900">Deep dark, easy shopping</div>
          <div className="mt-2 text-zinc-600 text-sm">Spotify-like browsing, standard checkout.</div>
        </div>
      </div>

      <ShelfRow locale={l} title={t.home.featured} cta={t.home.viewAll} products={products.slice(0, 8)} />
      <ShelfRow locale={l} title={t.home.trending} cta={t.home.viewAll} products={products.slice(2, 10)} />
      <ShelfRow locale={l} title={t.home.forYou} cta={t.home.viewAll} products={products.slice(4, 12)} />
    </div>
  );
}
