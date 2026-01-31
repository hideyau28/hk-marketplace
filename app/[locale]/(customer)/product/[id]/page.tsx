import { getDict, type Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;

  const product = await prisma.product.findUnique({
    where: { id, active: true },
  });

  if (!product) {
    return {
      title: "Product Not Found - HK•Market",
    };
  }

  return {
    title: `${product.title} - HK•Market`,
    description: `Shop ${product.title}${product.brand ? ` by ${product.brand}` : ""} at HK•Market. Premium sports gear for Hong Kong.`,
    openGraph: {
      title: `${product.title} - HK•Market`,
      description: `Shop ${product.title}${product.brand ? ` by ${product.brand}` : ""} at HK•Market. Premium sports gear for Hong Kong.`,
      type: "website",
      locale: locale === "zh-HK" ? "zh_HK" : "en_US",
      images: product.imageUrl ? [product.imageUrl] : [],
    },
  };
}

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
    brand: product.brand || "—",
    title: product.title,
    price: product.price,
    image: product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    category: product.category,
  };

  // Fetch related products (same category, max 4)
  const relatedProducts = product.category
    ? await prisma.product.findMany({
        where: {
          active: true,
          category: product.category,
          id: { not: product.id },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
      })
    : [];

  const related = relatedProducts.map((rp) => ({
    id: rp.id,
    brand: rp.brand || "",
    title: rp.title,
    price: rp.price,
    image: rp.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
  }));

  return (
    <div className="px-4 pb-24 pt-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
        <Link href={`/${locale}`} className="hover:text-zinc-900">
          {locale === "zh-HK" ? "首頁" : "Home"}
        </Link>
        {p.category && (
          <>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}?category=${p.category}`} className="hover:text-zinc-900">
              {p.category}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900">{p.title}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white aspect-square">
          <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
        </div>
        <div>
          <div className="text-zinc-600 text-sm">{p.brand}</div>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{p.title}</h1>
          <div className="mt-3 text-xl font-semibold text-zinc-900">HK$ {p.price}</div>
          <div className="mt-4 text-zinc-600 text-sm leading-6">Placeholder description. Shipping calculated at checkout.</div>

          <div className="mt-6 hidden gap-3 md:flex">
            <AddToCartButton
              product={{ id: p.id, title: p.title, price: p.price, image: p.image }}
              label={t.product.addToCart}
              addedLabel={t.product.addedToCart}
            className="rounded-2xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700"
            />
            <button className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 hover:bg-zinc-50">{t.product.buyNow}</button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-zinc-900 mb-4">
            {locale === "zh-HK" ? "相關產品" : "Related Products"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/product/${item.id}`}
                className="group rounded-2xl border border-zinc-200 bg-white overflow-hidden hover:border-zinc-300 transition-colors"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <div className="text-xs text-zinc-500">{item.brand}</div>
                  <div className="mt-1 text-sm font-medium text-zinc-900 line-clamp-2">{item.title}</div>
                  <div className="mt-2 text-sm font-semibold text-zinc-900">HK$ {item.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white/90 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="text-zinc-900 font-semibold">HK$ {p.price}</div>
          <AddToCartButton
            product={{ id: p.id, title: p.title, price: p.price, image: p.image }}
            label={t.product.addToCart}
            addedLabel={t.product.addedToCart}
            className="flex-1 rounded-2xl bg-olive-600 px-4 py-3 text-white font-semibold hover:bg-olive-700"
          />
        </div>
      </div>
    </div>
  );
}
