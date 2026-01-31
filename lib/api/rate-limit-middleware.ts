import { NextRequest, NextResponse } from "next/server";
import { rateLimit, type RATE_LIMITS } from "@/lib/rate-limit";

type RateLimitConfig = typeof RATE_LIMITS[keyof typeof RATE_LIMITS];

/**
 * Get a unique identifier for the request (IP address or user identifier)
 */
function getIdentifier(req: NextRequest): string {
  // Try to get IP from headers
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return "anonymous";
}

/**
 * Apply rate limiting to a request
 */
export function withRateLimit(
  config: RateLimitConfig,
  options?: {
    keyPrefix?: string;
    getKey?: (req: NextRequest) => string;
  }
) {
  return (req: NextRequest): NextResponse | null => {
    const identifier = options?.getKey ? options.getKey(req) : getIdentifier(req);
    const key = options?.keyPrefix ? `${options.keyPrefix}:${identifier}` : identifier;

    const result = rateLimit(key, config);

    if (!result.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": config.maxRequests.toString(),
            "X-RateLimit-Remaining": result.remaining.toString(),
            "X-RateLimit-Reset": result.resetAt.toString(),
            "Retry-After": Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Rate limit passed - return null to allow the request to continue
    return null;
  };
}
