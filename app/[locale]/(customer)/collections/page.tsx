import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const l = locale as Locale;

  // Fetch all active products (client will filter by wishlist IDs)
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const productMap = products.map((p) => ({
    id: p.id,
    brand: p.brand || undefined,
    title: p.title,
    image: p.imageUrl || undefined,
    price: p.price,
    badges: p.badges && Array.isArray(p.badges) ? (p.badges as string[]) : undefined,
  }));

  return (
    <div className="px-4 py-6 pb-28">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold text-zinc-900">{l === "zh-HK" ? "我的清單" : "My Wishlist"}</h1>
        <p className="mt-1 text-zinc-500 text-sm">{l === "zh-HK" ? "你收藏嘅商品" : "Products you've saved"}</p>

        <CollectionsClient locale={l} allProducts={productMap} />

        {/* Fallback navigation */}
        <div className="mt-10 hidden">
          <Link href={`/${l}`}>Back</Link>
        </div>
      </div>
    </div>
  );
}
