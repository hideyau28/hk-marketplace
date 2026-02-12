import { getTokenFromRequest, verifyToken } from "./jwt";
import { getSessionFromCookie } from "@/lib/admin/session";
import { ApiError } from "@/lib/api/route-helpers";

export type AdminContext = {
  type: "super" | "tenant";
  tenantId: string;
  adminId?: string;
  email?: string;
  role?: string;
};

/**
 * Get tenantId for super admin without DEFAULT_SLUG fallback.
 * Only accepts explicit tenant specification via x-tenant-id header.
 */
function getExplicitTenantId(req: Request): string {
  const tenantId = req.headers.get("x-tenant-id");
  if (tenantId) {
    return tenantId;
  }
  throw new ApiError(
    400,
    "BAD_REQUEST",
    "Tenant context required. Use tenant selection or pass x-tenant-id header."
  );
}

/**
 * Unified admin authentication.
 * Priority: JWT (cookie/bearer) → x-admin-secret header → admin_session cookie.
 * Throws ApiError(401) when no valid credential is found.
 *
 * 重要：唔再用 DEFAULT_SLUG fallback。Super admin 必須通過 JWT（select-tenant 設嘅）
 * 或者 x-tenant-id header 指定 tenant。
 */
export async function authenticateAdmin(req: Request): Promise<AdminContext> {
  // 1) Check JWT token (bearer header or tenant-admin-token cookie)
  const token = getTokenFromRequest(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return {
        type: payload.role === "super" ? "super" : "tenant",
        tenantId: payload.tenantId,
        adminId: payload.adminId,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  // 2) Check x-admin-secret header (external API callers must pass x-tenant-id)
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret) {
    if (headerSecret === process.env.ADMIN_SECRET) {
      const tenantId = getExplicitTenantId(req);
      return { type: "super", tenantId };
    }
    throw new ApiError(403, "ADMIN_AUTH_INVALID", "Invalid admin credential");
  }

  // 3) Check existing admin_session cookie (should have JWT from select-tenant)
  const sessionValid = await getSessionFromCookie();
  if (sessionValid) {
    // admin_session 存在但冇 JWT → super admin 未揀 tenant
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Please select a tenant first"
    );
  }

  // 4) No valid credential found
  throw new ApiError(401, "ADMIN_AUTH_MISSING", "Authentication required");
}
