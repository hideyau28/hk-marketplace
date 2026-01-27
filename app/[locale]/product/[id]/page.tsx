import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const t = getDict(locale as Locale);

  // Fetch product from database
  const product = await prisma.product.findUnique({
    where: { id, active: true },
  });

  if (!product) {
    notFound();
  }

  const p = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    shopName: "HK Marketplace",
  };

  return (
    <div className="px-4 pb-24 pt-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-white/60 text-sm">{p.shopName}</div>
          <h1 className="mt-2 text-2xl font-semibold">{p.title}</h1>
          <div className="mt-3 text-xl font-semibold">HK$ {p.price}</div>
          <div className="mt-4 text-white/60 text-sm leading-6">Placeholder description. Shipping calculated at checkout.</div>

          <div className="mt-6 hidden gap-3 md:flex">
            <AddToCartButton
              product={{ id: p.id, title: p.title, price: p.price, image: p.image }}
              label={t.product.addToCart}
              addedLabel={t.product.addedToCart}
              className="rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90"
            />
            <button className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white hover:bg-white/10">{t.product.buyNow}</button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-black/80 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-white font-semibold">HK$ {p.price}</div>
          <AddToCartButton
            product={{ id: p.id, title: p.title, price: p.price, image: p.image }}
            label={t.product.addToCart}
            addedLabel={t.product.addedToCart}
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-black font-semibold hover:bg-white/90"
          />
        </div>
      </div>
    </div>
  );
}
