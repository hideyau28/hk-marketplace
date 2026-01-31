/**
 * Simple in-memory rate limiter using sliding window algorithm
 */

type RateLimitConfig = {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests allowed in the window
};

type RequestLog = {
  timestamps: number[];
};

const requestLogs = new Map<string, RequestLog>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  for (const [key, log] of requestLogs.entries()) {
    // Remove timestamps older than 5 minutes
    log.timestamps = log.timestamps.filter(t => t > fiveMinutesAgo);

    // Remove empty entries
    if (log.timestamps.length === 0) {
      requestLogs.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowStart = now - config.interval;

  // Get or create request log for this key
  let log = requestLogs.get(key);
  if (!log) {
    log = { timestamps: [] };
    requestLogs.set(key, log);
  }

  // Remove timestamps outside the current window
  log.timestamps = log.timestamps.filter(t => t > windowStart);

  const currentCount = log.timestamps.length;
  const allowed = currentCount < config.maxRequests;

  if (allowed) {
    log.timestamps.push(now);
  }

  const remaining = Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0));
  const oldestTimestamp = log.timestamps[0] || now;
  const resetAt = oldestTimestamp + config.interval;

  return {
    allowed,
    remaining,
    resetAt,
  };
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
