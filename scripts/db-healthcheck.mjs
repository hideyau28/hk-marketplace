import { createRequire } from "module";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

function summarizeDatabaseUrl(raw) {
  if (!raw) return "DATABASE_URL is not set";
  try {
    const url = new URL(raw);
    const host = url.hostname || "(local)";
    const port = url.port || "(default)";
    const db = url.pathname.replace(/^\//, "") || "(unknown)";
    const user = url.username ? `${url.username}@` : "";
    return `postgres://${user}${host}:${port}/${db}`;
  } catch {
    return "DATABASE_URL is invalid";
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("Database healthcheck failed: DATABASE_URL is not set.");
    process.exit(1);
  }
  if (url.startsWith("file:") || url.startsWith("sqlite:")) {
    console.error("Database healthcheck failed: DATABASE_URL must be Postgres (not sqlite/file).");
    process.exit(1);
  }

  const require = createRequire(import.meta.url);
  let prisma;
  try {
    require("ts-node/register");
    ({ prisma } = require("../lib/prisma"));
  } catch (err) {
    console.error("Database healthcheck failed: could not load Prisma client.");
    const message = err && typeof err === "object" && "message" in err ? err.message : String(err);
    if (message) console.error(message);
    process.exit(1);
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database healthcheck: ok");
  } catch (err) {
    console.error("Database healthcheck failed.");
    console.error(`Target: ${summarizeDatabaseUrl(url)}`);
    const code = err && typeof err === "object" && "code" in err ? err.code : undefined;
    if (code) console.error(`Error code: ${code}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error("Database healthcheck failed.");
  process.exit(1);
});
