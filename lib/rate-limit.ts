/**
 * Database-backed rate limiter using sliding window algorithm.
 * Each request hit is stored as a row in the RateLimitEntry table.
 */
import { prisma } from "@/lib/prisma";

type RateLimitConfig = {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
};

export async function rateLimit(
  key: string,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - config.interval);

  // Count existing requests in the current window
  const currentCount = await prisma.rateLimitEntry.count({
    where: {
      key,
      timestamp: { gt: windowStart },
    },
  });

  const allowed = currentCount < config.maxRequests;

  if (allowed) {
    // Record this request
    await prisma.rateLimitEntry.create({
      data: { key, timestamp: now },
    });
  }

  // Opportunistic cleanup: ~5% of requests trigger deletion of old entries
  if (Math.random() < 0.05) {
    const cleanupCutoff = new Date(now.getTime() - 15 * 60 * 1000);
    prisma.rateLimitEntry
      .deleteMany({ where: { timestamp: { lt: cleanupCutoff } } })
      .catch(() => {
        // Fire-and-forget cleanup
      });
  }

  const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0));

  // Calculate resetAt from the oldest entry in the window
  const oldestEntry = await prisma.rateLimitEntry.findFirst({
    where: {
      key,
      timestamp: { gt: windowStart },
    },
    orderBy: { timestamp: "asc" },
    select: { timestamp: true },
  });

  const resetAt = oldestEntry
    ? oldestEntry.timestamp.getTime() + config.interval
    : now.getTime() + config.interval;

  return { allowed, remaining, resetAt };
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Strict limits for auth endpoints
  AUTH: {
    interval: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
  },
  // Standard API limits
  API: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // Generous limits for reads
  READ: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 120,
  },
  // Stricter limits for writes
  WRITE: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
};
