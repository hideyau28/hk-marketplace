import { randomUUID } from "crypto";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL"
  | "ADMIN_AUTH_MISSING"
  | "ADMIN_AUTH_INVALID";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getRequestId(req: Request) {
  return req.headers.get("x-request-id") || randomUUID();
}

export function ok(req: Request, data: unknown, init?: ResponseInit) {
  const requestId = getRequestId(req);
  return Response.json(
    { ok: true, requestId, data },
    {
      ...init,
      headers: {
        "x-request-id": requestId,
        "content-type": "application/json; charset=utf-8",
        ...(init?.headers || {}),
      },
    }
  );
}

export function fail(req: Request, err: unknown, init?: ResponseInit) {
  const requestId = getRequestId(req);

  const apiErr =
    err instanceof ApiError
      ? err
      : new ApiError(500, "INTERNAL", "Internal Server Error");

  return Response.json(
    {
      ok: false,
      requestId,
      error: {
        code: apiErr.code,
        message: apiErr.message,
        details: apiErr.details ?? undefined,
      },
    },
    {
      status: apiErr.status,
      ...init,
      headers: {
        "x-request-id": requestId,
        "content-type": "application/json; charset=utf-8",
        ...(init?.headers || {}),
      },
    }
  );
}

type WithApiOptions = {
  admin?: boolean; // true = require admin secret
};

function assertAdmin(req: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    // 不設 secret 就當未啟用 guard（避免卡死 dev）
    return;
  }

  const headerSecret = req.headers.get("x-admin-secret");
  const auth = req.headers.get("authorization") ?? "";

  // 1) x-admin-secret header
  if (headerSecret) {
    if (headerSecret !== secret) throw new ApiError(403, "ADMIN_AUTH_INVALID", "Invalid admin credential");
    return;
  }

  // 2) Bearer token
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length);
    if (token !== secret) throw new ApiError(403, "ADMIN_AUTH_INVALID", "Invalid admin credential");
    return;
  }

  // 3) Basic Auth
  if (auth.toLowerCase().startsWith("basic ")) {
    const b64 = auth.slice(6).trim();
    let decoded = "";
    try {
      // Node runtime
      decoded = Buffer.from(b64, "base64").toString("utf8");
    } catch {
      // Fallback (non-Node): try atob if available
      try {
        decoded = (globalThis as any).atob ? (globalThis as any).atob(b64) : "";
      } catch {
        decoded = "";
      }
    }

    const idx = decoded.indexOf(":");
    const user = idx >= 0 ? decoded.slice(0, idx) : decoded;
    const pass = idx >= 0 ? decoded.slice(idx + 1) : "";

    const expectedUser = process.env.ADMIN_BASIC_USER || "admin";
    const expectedPass = process.env.ADMIN_BASIC_PASS || secret;

    if (user === expectedUser && pass === expectedPass) return;

    // Wrong basic auth -> 403
    throw new ApiError(403, "ADMIN_AUTH_INVALID", "Invalid admin credential");
  }

  // Missing credential -> 401
  throw new ApiError(401, "ADMIN_AUTH_MISSING", "Missing admin credential");
}

export function withApi(
  handler: (req: Request) => Promise<Response>,
  opts?: WithApiOptions
): (req: Request) => Promise<Response>;
export function withApi<C>(
  handler: (req: Request, ctx: C) => Promise<Response>,
  opts?: WithApiOptions
): (req: Request, ctx: C) => Promise<Response>;
export function withApi<C>(
  handler: ((req: Request) => Promise<Response>) | ((req: Request, ctx: C) => Promise<Response>),
  opts?: WithApiOptions
) {
  return async (req: Request, ctx?: C) => {
    try {
      if (opts?.admin) assertAdmin(req);
      // Call handler with ctx only if it expects 2 args; keep TS happy via casting.
      return await ((handler as any).length >= 2 ? (handler as any)(req, ctx) : (handler as any)(req));
    } catch (e) {
      return fail(req, e);
    }
  };
}

