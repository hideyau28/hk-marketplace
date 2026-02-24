import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { resolveTemplateId, getCoverTemplate } from "@/lib/cover-templates";
import { TemplateProvider } from "@/lib/template-context";
import OrderTracker from "@/components/biolink/OrderTracker";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string; locale: string; id: string }>;
};

export default async function OrderTrackPage({ params }: PageProps) {
  const { slug, id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      coverTemplate: true,
      template: true,
      currency: true,
    },
  });

  if (!tenant) notFound();

  // Verify order exists and belongs to this tenant
  const order = await prisma.order.findFirst({
    where: { id, tenantId: tenant.id },
    select: { id: true },
  });

  if (!order) notFound();

  const tmpl = getCoverTemplate(
    resolveTemplateId(tenant.coverTemplate || tenant.template),
  );

  return (
    <TemplateProvider value={tmpl}>
      <OrderTracker
        orderId={id}
        storeSlug={slug}
        storeName={tenant.name}
        logoUrl={tenant.logoUrl}
        currency={tenant.currency || "HKD"}
      />
    </TemplateProvider>
  );
}
