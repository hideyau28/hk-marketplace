import { randomUUID } from "crypto";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

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

  const provided =
    req.headers.get("x-admin-secret") ||
    (req.headers.get("authorization")?.startsWith("Bearer ")
      ? req.headers.get("authorization")!.slice("Bearer ".length)
      : null);

  if (!provided) throw new ApiError(401, "UNAUTHORIZED", "Missing admin credential");
  if (provided !== secret) throw new ApiError(403, "FORBIDDEN", "Invalid admin credential");
}

export function withApi(
  handler: (req: Request) => Promise<Response>,
  opts?: WithApiOptions
) {
  return async (req: Request) => {
    try {
      if (opts?.admin) assertAdmin(req);
      return await handler(req);
    } catch (e) {
      return fail(req, e);
    }
  };
}
