import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BioLinkPage from "@/components/biolink/BioLinkPage";
import type { Metadata } from "next";
import type { ProductForBioLink, DeliveryOption } from "@/lib/biolink-helpers";

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
      socialLinks: true,
      deliveryOptions: true,
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
      sizes: true,
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
    sizes: p.sizes as Record<string, number> | null,
    badges: p.badges as string[] | null,
    featured: p.featured,
    createdAt: p.createdAt,
    variants: p.variants,
  }));

  const tenantData = {
    ...tenant,
    socialLinks: (tenant.socialLinks ?? []) as Array<{ url: string }>,
    deliveryOptions: (tenant.deliveryOptions ?? null) as DeliveryOption[] | null,
  };

  return <BioLinkPage tenant={tenantData} products={serialized} />;
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
