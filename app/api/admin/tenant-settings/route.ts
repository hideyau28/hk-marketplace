export const runtime = "nodejs";

import { ApiError, ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

const ROUTE = "/api/admin/tenant-settings";

// GET /api/admin/tenant-settings (admin)
export const GET = withApi(
  async (req) => {
    const { tenantId, adminId } = await authenticateAdmin(req);

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        name: true,
        slug: true,
        tagline: true,
        location: true,
        whatsapp: true,
        instagram: true,
        coverTemplate: true,
        coverPhoto: true,
        logoUrl: true,
        template: true,
        // Checkout settings
        currency: true,
        deliveryOptions: true,
        freeShippingThreshold: true,
        orderConfirmMessage: true,
      },
    });

    if (!tenant) {
      throw new ApiError(404, "NOT_FOUND", "Tenant not found");
    }

    // Get admin email
    const admin = await prisma.tenantAdmin.findUnique({
      where: { id: adminId },
      select: { email: true },
    });

    return ok(req, {
      ...tenant,
      email: admin?.email || null,
      logo: tenant.logoUrl,
    });
  }
);

// PUT /api/admin/tenant-settings (admin)
export const PUT = withApi(
  async (req) => {
    const { tenantId } = await authenticateAdmin(req);

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
    }

    // Validate slug if provided
    if (body.slug !== undefined) {
      if (typeof body.slug !== "string" || body.slug.trim().length === 0) {
        throw new ApiError(400, "BAD_REQUEST", "slug must be a non-empty string");
      }

      // Check if slug is changing
      const currentTenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { slug: true },
      });

      if (currentTenant && body.slug !== currentTenant.slug) {
        // Check if new slug is already taken
        const existing = await prisma.tenant.findUnique({
          where: { slug: body.slug },
        });

        if (existing) {
          throw new ApiError(409, "CONFLICT", "Slug already taken");
        }
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.tagline !== undefined) updateData.tagline = body.tagline;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.instagram !== undefined) updateData.instagram = body.instagram;
    if (body.coverTemplate !== undefined) updateData.coverTemplate = body.coverTemplate;
    if (body.coverPhoto !== undefined) updateData.coverPhoto = body.coverPhoto;
    if (body.logo !== undefined) updateData.logoUrl = body.logo;
    if (body.template !== undefined) updateData.template = body.template;
    // Checkout settings
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.deliveryOptions !== undefined) updateData.deliveryOptions = body.deliveryOptions;
    if (body.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = body.freeShippingThreshold;
    // Allow explicitly setting to null
    if (body.freeShippingThreshold === null) updateData.freeShippingThreshold = null;
    if (body.orderConfirmMessage !== undefined) updateData.orderConfirmMessage = body.orderConfirmMessage;

    const updated = await prisma.tenant.update({
      where: { id: tenantId },
      data: updateData,
      select: {
        name: true,
        slug: true,
        tagline: true,
        location: true,
        whatsapp: true,
        instagram: true,
        coverTemplate: true,
        coverPhoto: true,
        logoUrl: true,
        template: true,
        currency: true,
        deliveryOptions: true,
        freeShippingThreshold: true,
        orderConfirmMessage: true,
      },
    });

    return ok(req, {
      ...updated,
      logo: updated.logoUrl,
    });
  }
);
