import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * NOTE:
 * - Do NOT use @prisma/extension-accelerate here unless you provide accelerateUrl.
 * - For Neon Postgres, adapter-pg is sufficient.
 */

const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof makeClient>; pool?: Pool };

function isLocalhost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function normalizeDbUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isLocal = isLocalhost(parsed.hostname);

    // If localhost or already has sslmode, keep as-is
    if (isLocal || parsed.searchParams.has("sslmode")) {
      return url;
    }

    // For remote hosts without sslmode, add sslmode=require
    parsed.searchParams.set("sslmode", "require");
    return parsed.toString();
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

function makeClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  const accelerateUrl = process.env.PRISMA_ACCELERATE_URL || process.env.ACCELERATE_URL;
  if (accelerateUrl) {
    try {
      // Use dynamic module name to avoid bundlers resolving it when unused.
      const moduleName = ["@prisma", "extension-accelerate"].join("/");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { withAccelerate } = require(moduleName);
      return new PrismaClient().$extends(withAccelerate());
    } catch (err) {
      throw new Error("PRISMA_ACCELERATE_URL is set but @prisma/extension-accelerate is missing.");
    }
  }

  const normalizedUrl = normalizeDbUrl(url);

  // Determine if we need SSL config for Pool
  let needsSsl = false;
  try {
    const parsed = new URL(normalizedUrl);
    needsSsl = !isLocalhost(parsed.hostname);
  } catch {
    // If parse fails, assume remote (safe default)
    needsSsl = true;
  }

  const poolConfig: any = {
    connectionString: normalizedUrl,
    // Serverless-friendly pool settings
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  };
  if (needsSsl) {
    // Neon Postgres: sslmode=require 已在 URL，rejectUnauthorized: false
    // 避免 Vercel 環境 CA trust store 與 Neon cert 不匹配導致連線失敗
    poolConfig.ssl = { rejectUnauthorized: false };
  }

  const pool = new Pool(poolConfig);
  globalForPrisma.pool = pool;

  return new PrismaClient({
    adapter: new PrismaPg(pool),
  });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
