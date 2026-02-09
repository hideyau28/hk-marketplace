import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const EXPIRY = "24h";

export type SessionPayload = {
  valid: boolean;
  tenantId?: string;
};

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(tenantId?: string): Promise<string> {
  const payload: Record<string, string> = { role: "admin" };
  if (tenantId) {
    payload.tenantId = tenantId;
  }
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(getSecretKey());
  return token;
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecretKey());
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify session JWT and extract payload including tenantId.
 * Returns { valid: false } for invalid/expired tokens.
 * Backward compat: old JWTs without tenantId return { valid: true } with no tenantId.
 */
export async function verifySessionWithPayload(token: string): Promise<SessionPayload> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      valid: true,
      tenantId: typeof payload.tenantId === "string" ? payload.tenantId : undefined,
    };
  } catch {
    return { valid: false };
  }
}

export async function getSessionFromCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return false;
    return verifySession(sessionCookie.value);
  } catch {
    return false;
  }
}

/**
 * Read admin_session cookie, verify JWT, return tenantId or null.
 * Used by server components to resolve the admin's tenant from session.
 */
export async function getSessionTenantId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    const result = await verifySessionWithPayload(sessionCookie.value);
    if (!result.valid) return null;
    return result.tenantId ?? null;
  } catch {
    return null;
  }
}

/**
 * Read the raw admin_session cookie token and verify it, returning the full payload.
 * Used by authenticateAdmin() to extract tenantId from cookie-based sessions.
 */
export async function getSessionPayloadFromCookie(): Promise<SessionPayload> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    if (!sessionCookie?.value) return { valid: false };
    return verifySessionWithPayload(sessionCookie.value);
  } catch {
    return { valid: false };
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function validateAdminSecret(secret: string): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) return false;
  return secret === adminSecret;
}
