#!/usr/bin/env bash
set -euo pipefail

echo "== Dev DB Bootstrap =="

# Load .env.local/.env if present (allow env override)
if [ -f .env.local ]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi
if [ -z "${DATABASE_URL:-}" ] && [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

if [[ "${DATABASE_URL}" == file:* || "${DATABASE_URL}" == sqlite:* ]]; then
  echo "ERROR: DATABASE_URL must be Postgres (not sqlite/file)."
  exit 1
fi

DB_INFO="$(node - <<'NODE'
const url = process.env.DATABASE_URL;
try {
  const parsed = new URL(url);
  const db = parsed.pathname.replace(/^\//, "");
  const host = parsed.hostname || "localhost";
  const port = parsed.port || "5432";
  const user = parsed.username || process.env.USER || "postgres";
  const password = parsed.password || "";
  const adminDb = process.env.DEV_DB_NAME || db;
  console.log(JSON.stringify({ db, host, port, user, password, adminDb }));
} catch {
  console.log(JSON.stringify({ error: "invalid" }));
}
NODE
)"

if echo "${DB_INFO}" | grep -q '"error"'; then
  echo "ERROR: DATABASE_URL is invalid."
  exit 1
fi

DB_NAME="$(echo "${DB_INFO}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); console.log(d.adminDb || d.db || "");')"
DB_HOST="$(echo "${DB_INFO}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); console.log(d.host || "localhost");')"
DB_PORT="$(echo "${DB_INFO}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); console.log(d.port || "5432");')"
DB_USER="$(echo "${DB_INFO}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); console.log(d.user || "postgres");')"
DB_PASS="$(echo "${DB_INFO}" | node -e 'const d=JSON.parse(require("fs").readFileSync(0,"utf8")); console.log(d.password || "");')"

if [ -z "${DB_NAME}" ]; then
  echo "ERROR: Could not determine database name from DATABASE_URL."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql not found. Install Postgres and ensure it's running."
  exit 1
fi

export PGPASSWORD="${DB_PASS}"
if ! psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1 && brew services list | grep -q "^postgresql@14[[:space:]]"; then
    echo "Starting Postgres via Homebrew (postgresql@14)..."
    brew services start postgresql@14 >/dev/null
    sleep 1
  fi
fi

if ! psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -c "SELECT 1" >/dev/null 2>&1; then
  echo "ERROR: Postgres is not reachable at ${DB_HOST}:${DB_PORT}."
  echo "Start your local Postgres service, then re-run: npm run dev:bootstrap"
  exit 1
fi

DB_EXISTS="$(psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true)"
if [ "${DB_EXISTS}" != "1" ]; then
  echo "Creating database: ${DB_NAME}"
  createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" "${DB_NAME}"
else
  echo "Database exists: ${DB_NAME}"
fi

echo "Running migrations..."
npx prisma migrate deploy

echo "Checking products..."
PRODUCT_COUNT="$(node -r ts-node/register - <<'NODE'
const { prisma } = require("./lib/prisma");
(async () => {
  try {
    const count = await prisma.product.count();
    console.log(String(count));
  } catch {
    console.log("0");
  } finally {
    await prisma.$disconnect();
  }
})();
NODE
)"

if [ "${PRODUCT_COUNT}" = "0" ]; then
  echo "Seeding products..."
  npx ts-node scripts/seed-products.ts
else
  echo "Products already seeded (${PRODUCT_COUNT})."
fi

echo "Dev DB bootstrap complete."
