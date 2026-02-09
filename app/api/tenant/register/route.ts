import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/admin/session";
import { signToken } from "@/lib/auth/jwt";
import { withApi, ok, ApiError } from "@/lib/api/route-helpers";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

const RESERVED_SLUGS = new Set([
  "admin", "api", "auth", "login", "start", "_next", "maysshop",
  "app", "checkout", "cart", "search", "orders", "profile",
  "collections", "settings", "signup", "about", "contact",
  "terms", "privacy", "favicon.ico",
]);

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
const WHATSAPP_REGEX = /^[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withApi(async (req: Request) => {
  let body: { name?: string; slug?: string; whatsapp?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const { name, slug, whatsapp, email, password } = body;

  // --- Validation ---
  if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 50) {
    throw new ApiError(400, "BAD_REQUEST", "店名需要 2-50 個字");
  }

  if (!slug || typeof slug !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "Slug 係必填");
  }

  const cleanSlug = slug.trim().toLowerCase();
  if (!SLUG_REGEX.test(cleanSlug)) {
    throw new ApiError(400, "BAD_REQUEST", "Slug 格式唔啱：3-30 個字，只可以用細楷英文、數字同連字號");
  }

  if (RESERVED_SLUGS.has(cleanSlug)) {
    throw new ApiError(400, "BAD_REQUEST", "呢個名係保留字，唔可以用");
  }

  if (!whatsapp || typeof whatsapp !== "string" || !WHATSAPP_REGEX.test(whatsapp.trim())) {
    throw new ApiError(400, "BAD_REQUEST", "WhatsApp 號碼需要 8 位數字");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "BAD_REQUEST", "請輸入有效嘅 email");
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    throw new ApiError(400, "BAD_REQUEST", "密碼最少 8 個字");
  }

  const cleanName = name.trim();
  const cleanWhatsapp = whatsapp.trim();
  const cleanEmail = email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(password, 10);

  // --- Create Tenant + TenantAdmin atomically ---
  try {
    // Create tenant first, then admin in a sequential transaction
    const tenant = await prisma.tenant.create({
      data: {
        name: cleanName,
        slug: cleanSlug,
        whatsapp: cleanWhatsapp,
        brandColor: "#FF9500",
        status: "active",
      },
    });

    let admin;
    try {
      admin = await prisma.tenantAdmin.create({
        data: {
          email: cleanEmail,
          name: cleanName,
          passwordHash: hashedPassword,
          tenantId: tenant.id,
        },
      });
    } catch (adminErr) {
      // Rollback: delete the tenant if admin creation fails
      await prisma.tenant.delete({ where: { id: tenant.id } }).catch(() => {});
      throw adminErr;
    }

    // --- Default payment config: FPS enabled ---
    await prisma.tenantPaymentConfig.create({
      data: {
        tenantId: tenant.id,
        providerId: "fps",
        enabled: true,
        displayName: "FPS 轉數快",
        sortOrder: 0,
      },
    }).catch(() => {}); // 非致命，唔好 block 整個 registration

    // --- Default store settings with delivery options ---
    await prisma.storeSettings.create({
      data: {
        tenantId: tenant.id,
        storeName: cleanName,
        whatsappNumber: cleanWhatsapp,
        // SF智能櫃
        sfLockerFee: 35,
        sfLockerFreeAbove: 600,
        // 順豐到付 / 送貨上門
        homeDeliveryFee: 40,
        homeDeliveryFreeAbove: 600,
        homeDeliveryIslandExtra: 20,
        // 一般運費
        shippingFee: 40,
        freeShippingThreshold: 600,
      },
    }).catch(() => {}); // 非致命

    // --- Auto-login: set admin_session cookie (middleware guard) ---
    const sessionToken = await createSession();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24h
      path: "/",
    });

    // --- Set tenant-admin-token cookie (API auth) ---
    const adminToken = signToken({
      tenantId: tenant.id,
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });
    cookieStore.set("tenant-admin-token", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return ok(req, { ok: true, tenantId: tenant.id, slug: tenant.slug });
  } catch (err: any) {
    // Handle unique constraint violations
    if (err?.code === "P2002" || err?.message?.includes("Unique constraint")) {
      const target = err?.meta?.target;
      if (typeof target === "string" && target.includes("email")) {
        throw new ApiError(409, "CONFLICT", "呢個 email 已經註冊咗");
      }
      if (typeof target === "string" && target.includes("slug")) {
        throw new ApiError(409, "CONFLICT", "呢個名已經有人用咗");
      }
      // Fallback: check which field by trying lookups
      const existingSlug = await prisma.tenant.findUnique({ where: { slug: cleanSlug } });
      if (existingSlug) {
        throw new ApiError(409, "CONFLICT", "呢個名已經有人用咗");
      }
      const existingEmail = await prisma.tenantAdmin.findUnique({ where: { email: cleanEmail } });
      if (existingEmail) {
        throw new ApiError(409, "CONFLICT", "呢個 email 已經註冊咗");
      }
      throw new ApiError(409, "CONFLICT", "資料重複，請檢查 slug 或 email");
    }
    throw err;
  }
});
