#!/usr/bin/env bash
set -euo pipefail

echo "=== Local Smoke Test Runner ==="

# Load .env.local if exists (allow env override)
if [ -f .env.local ]; then
  echo "Loading .env.local..."
  set -a
  source .env.local
  set +a
fi

echo ""
echo "0) Database healthcheck"
if ! node scripts/db-healthcheck.mjs >/dev/null 2>&1; then
  echo "ERROR: Database healthcheck failed."
  echo "Run: npm run dev:bootstrap"
  exit 1
fi
echo "Database healthcheck: ok"

PORT="${PORT:-3012}"
BASE="${BASE:-http://localhost:${PORT}}"
ADMIN_SECRET="${ADMIN_SECRET:-}"

export BASE
export ADMIN_SECRET

if [ -z "${ADMIN_SECRET}" ]; then
  echo "ERROR: ADMIN_SECRET is not set (set in .env.local or env)"
  exit 1
fi

echo ""
echo "1) Kill any existing listener on port ${PORT}"
PIDS=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)
if [ -n "${PIDS:-}" ]; then
  echo "Killing PIDs: $PIDS"
  kill $PIDS 2>/dev/null || true
  sleep 1
  PIDS2=$(lsof -t -iTCP:${PORT} -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "${PIDS2:-}" ]; then
    kill -9 $PIDS2 2>/dev/null || true
  fi
fi
echo "Port ${PORT} is clear"

echo ""
echo "2) Start dev server (background)"
npx next dev -p "${PORT}" &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

cleanup() {
  echo ""
  echo "Cleaning up: stopping server (PID: ${SERVER_PID:-})"
  if [ -n "${SERVER_PID:-}" ]; then
    kill $SERVER_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
  fi
}
trap cleanup EXIT

echo ""
echo "3) Wait for server readiness (max 60s)"
READY=false
for i in {1..60}; do
  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}/api/store-settings" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "Server is ready! (received ${HTTP_CODE} as expected)"
    READY=true
    break
  fi
  echo "Waiting for server... ($i/60) [HTTP $HTTP_CODE]"
  sleep 1
done

if [ "$READY" = "false" ]; then
  echo "ERROR: Server failed to become ready within 60 seconds"
  exit 1
fi

echo ""
echo "4) Run smoke tests"
BASE="$BASE" ADMIN_SECRET="$ADMIN_SECRET" bash scripts/smoke-store-settings.sh
BASE="$BASE" ADMIN_SECRET="$ADMIN_SECRET" bash scripts/smoke-orders.sh
BASE="$BASE" ADMIN_SECRET="$ADMIN_SECRET" bash scripts/smoke-products.sh

echo ""
echo "=== Local Smoke Complete ==="
