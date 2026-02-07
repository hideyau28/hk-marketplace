import { getTokenFromRequest, verifyToken } from "./jwt";
import { getSessionFromCookie } from "@/lib/admin/session";
import { getTenantId } from "@/lib/tenant";
import { ApiError } from "@/lib/api/route-helpers";

export type AdminContext = {
  type: "super" | "tenant";
  tenantId: string;
  adminId?: string;
  email?: string;
  role?: string;
};

/**
 * Unified admin authentication.
 * Priority: JWT (cookie/bearer) → x-admin-secret header → admin_session cookie.
 * Throws ApiError(401) when no valid credential is found.
 */
export async function authenticateAdmin(req: Request): Promise<AdminContext> {
  // 1) Check JWT token (bearer header or tenant-admin-token cookie)
  const token = getTokenFromRequest(req);
  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      return {
        type: "tenant",
        tenantId: payload.tenantId,
        adminId: payload.adminId,
        email: payload.email,
        role: payload.role,
      };
    }
  }

  // 2) Check x-admin-secret header
  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret) {
    if (headerSecret === process.env.ADMIN_SECRET) {
      const tenantId = await getTenantId(req);
      return { type: "super", tenantId };
    }
    throw new ApiError(403, "ADMIN_AUTH_INVALID", "Invalid admin credential");
  }

  // 3) Check existing admin_session cookie
  const sessionValid = await getSessionFromCookie();
  if (sessionValid) {
    const tenantId = await getTenantId(req);
    return { type: "super", tenantId };
  }

  // 4) No valid credential found
  throw new ApiError(401, "ADMIN_AUTH_MISSING", "Authentication required");
}
