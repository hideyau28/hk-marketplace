import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BioLinkPage from "@/components/biolink/BioLinkPage";
import { resolveTemplateId } from "@/lib/cover-templates";
import type { Metadata } from "next";
import type { ProductForBioLink, DualVariantData, DeliveryOption, OrderConfirmConfig } from "@/lib/biolink-helpers";
import { DEFAULT_DELIVERY_OPTIONS, DEFAULT_ORDER_CONFIRM } from "@/lib/biolink-helpers";

// Force dynamic rendering — tenant slug pages need DB access per request
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  let tenant;
  try {
    tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        whatsapp: true,
        instagram: true,
        brandColor: true,
        logoUrl: true,
        coverPhoto: true,
        coverTemplate: true,
        template: true,
        fpsEnabled: true,
        fpsAccountName: true,
        fpsAccountId: true,
        fpsQrCodeUrl: true,
        paymeEnabled: true,
        paymeLink: true,
        paymeQrCodeUrl: true,
        stripeAccountId: true,
        stripeOnboarded: true,
        // Checkout settings
        currency: true,
        deliveryOptions: true,
        freeShippingThreshold: true,
        orderConfirmMessage: true,
      },
    });
  } catch (err) {
    console.error(`[slug/${slug}] tenant query failed:`, err);
    notFound();
  }

  if (!tenant) notFound();

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, active: true, hidden: false, deletedAt: null },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
      imageUrl: true,
      images: true,
      videoUrl: true,
      sizes: true,
      sizeSystem: true,
      badges: true,
      featured: true,
      createdAt: true,
      variants: {
        where: { active: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          compareAtPrice: true,
          stock: true,
          active: true,
          imageUrl: true,
        },
      },
    },
  }).catch((err) => {
    console.error(`[slug/${slug}] products query failed:`, err);
    return [];
  });

  // Serialize for client component (dates → strings via JSON, Json fields → typed)
  const serialized: ProductForBioLink[] = products.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    originalPrice: p.originalPrice,
    imageUrl: p.imageUrl,
    images: p.images,
    videoUrl: p.videoUrl,
    sizes: p.sizes as Record<string, number> | DualVariantData | null,
    sizeSystem: p.sizeSystem,
    badges: p.badges as string[] | null,
    featured: p.featured,
    createdAt: p.createdAt,
    variants: p.variants,
  }));

  // Parse JSON checkout settings with defaults, resolve legacy template IDs
  const tenantForBioLink = {
    ...tenant,
    coverTemplate: resolveTemplateId(tenant.coverTemplate || tenant.template),
    currency: tenant.currency || "HKD",
    deliveryOptions: (tenant.deliveryOptions as DeliveryOption[] | null) || DEFAULT_DELIVERY_OPTIONS,
    freeShippingThreshold: tenant.freeShippingThreshold,
    orderConfirmMessage: (tenant.orderConfirmMessage as OrderConfirmConfig | null) || DEFAULT_ORDER_CONFIRM,
  };

  return <BioLinkPage tenant={tenantForBioLink} products={serialized} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { name: true, description: true, coverPhoto: true },
    });
    if (!tenant) return {};

    const title = `${tenant.name} | WoWlix`;
    const description = tenant.description || `Shop at ${tenant.name}`;
    const ogImage = tenant.coverPhoto || "https://wowlix.com/og-default.png";

    return {
      title,
      description,
      openGraph: {
        title: tenant.name,
        description,
        images: [ogImage],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: tenant.name,
        description,
        images: [ogImage],
      },
    };
  } catch (err) {
    console.error(`[slug/${slug}] metadata query failed:`, err);
    return {};
  }
}
