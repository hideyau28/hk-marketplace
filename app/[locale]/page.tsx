import { getDict, type Locale } from "@/lib/i18n";
import { mockProducts } from "@/lib/mock";
import ShelfRow from "@/components/ShelfRow";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;
  const t = getDict(l);
  return (
    <div className="pb-16">
      <div className="px-4 pt-8">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6">
          <div className="text-white/80 text-sm">HK Marketplace</div>
          <div className="mt-2 text-2xl font-semibold">Deep dark, easy shopping</div>
          <div className="mt-2 text-white/60 text-sm">Spotify-like browsing, standard checkout.</div>
        </div>
      </div>

      <ShelfRow locale={l} title={t.home.featured} cta={t.home.viewAll} products={mockProducts.slice(0, 8)} />
      <ShelfRow locale={l} title={t.home.trending} cta={t.home.viewAll} products={mockProducts.slice(2, 10)} />
      <ShelfRow locale={l} title={t.home.forYou} cta={t.home.viewAll} products={mockProducts.slice(4, 12)} />
    </div>
  );
}
