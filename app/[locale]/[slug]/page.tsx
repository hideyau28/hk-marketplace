import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BioLinkPage from "@/components/biolink/BioLinkPage";
import type { Metadata } from "next";
import type { ProductForBioLink, DualVariantData, DeliveryOption, OrderConfirmConfig } from "@/lib/biolink-helpers";
import { DEFAULT_DELIVERY_OPTIONS, DEFAULT_ORDER_CONFIRM } from "@/lib/biolink-helpers";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
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

  if (!tenant) notFound();

  const products = await prisma.product.findMany({
    where: { tenantId: tenant.id, active: true },
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

  // Parse JSON checkout settings with defaults
  const tenantForBioLink = {
    ...tenant,
    currency: tenant.currency || "HKD",
    deliveryOptions: (tenant.deliveryOptions as DeliveryOption[] | null) || DEFAULT_DELIVERY_OPTIONS,
    freeShippingThreshold: tenant.freeShippingThreshold,
    orderConfirmMessage: (tenant.orderConfirmMessage as OrderConfirmConfig | null) || DEFAULT_ORDER_CONFIRM,
  };

  return <BioLinkPage tenant={tenantForBioLink} products={serialized} />;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { name: true, description: true, coverPhoto: true },
  });
  if (!tenant) return {};
  return {
    title: `${tenant.name} | Wowlix`,
    description: tenant.description || `Shop at ${tenant.name}`,
    openGraph: {
      title: tenant.name,
      description: tenant.description || `Shop at ${tenant.name}`,
      images: tenant.coverPhoto ? [tenant.coverPhoto] : [],
    },
  };
}
