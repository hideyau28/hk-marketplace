import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Use process.env directly so prisma generate works without DATABASE_URL
  // (e.g. CI builds that only need the client, not a live DB)
  datasource: { url: process.env.DATABASE_URL || "" },
});
