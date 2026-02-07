import jwt from "jsonwebtoken";

export type JwtPayload = {
  tenantId: string;
  adminId: string;
  email: string;
  role: string;
};

function getSecret(): string {
  const secret = process.env.TENANT_JWT_SECRET;
  if (!secret) {
    throw new Error("TENANT_JWT_SECRET environment variable is not set");
  }
  return secret;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: Request): string | null {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to cookie
  const cookie = req.headers.get("cookie");
  if (cookie) {
    const match = cookie.match(/(?:^|;\s*)tenant-admin-token=([^;]*)/);
    if (match) {
      return match[1];
    }
  }

  return null;
}
