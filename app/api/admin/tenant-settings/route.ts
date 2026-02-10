export const runtime = "nodejs";

import { ok, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

const TENANT_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  tagline: true,
  location: true,
  coverTemplate: true,
  coverPhoto: true,
  logoUrl: true,
  brandColor: true,
  whatsapp: true,
  instagram: true,
} as const;

// GET /api/admin/tenant-settings
export const GET = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: TENANT_SELECT,
  });
  return ok(req, tenant);
});

// PUT /api/admin/tenant-settings (partial update)
export const PUT = withApi(async (req) => {
  const { tenantId } = await authenticateAdmin(req);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  // Only allow updating specific tenant fields
  const updateData: Record<string, unknown> = {};

  if (body.tagline !== undefined) {
    updateData.tagline = typeof body.tagline === "string" ? body.tagline.trim() || null : null;
  }
  if (body.location !== undefined) {
    updateData.location = typeof body.location === "string" ? body.location.trim() || null : null;
  }
  if (body.coverTemplate !== undefined) {
    updateData.coverTemplate = typeof body.coverTemplate === "string" ? body.coverTemplate.trim() || null : null;
  }
  if (body.coverPhoto !== undefined) {
    updateData.coverPhoto = typeof body.coverPhoto === "string" && body.coverPhoto.trim() ? body.coverPhoto.trim() : null;
  }
  if (body.logoUrl !== undefined) {
    updateData.logoUrl = typeof body.logoUrl === "string" && body.logoUrl.trim() ? body.logoUrl.trim() : null;
  }
  if (body.brandColor !== undefined) {
    updateData.brandColor = typeof body.brandColor === "string" ? body.brandColor.trim() || null : null;
  }
  if (body.description !== undefined) {
    updateData.description = typeof body.description === "string" ? body.description.trim() || null : null;
  }

  if (Object.keys(updateData).length === 0) {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: TENANT_SELECT,
    });
    return ok(req, tenant);
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: updateData,
    select: TENANT_SELECT,
  });

  return ok(req, tenant);
});
