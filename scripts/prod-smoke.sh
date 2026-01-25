#!/usr/bin/env bash
set -euo pipefail

echo "=== Production Smoke Test Runner ==="

# Load .env.local if exists (CI will override with env vars)
if [ -f .env.local ]; then
  echo "Loading .env.local..."
  set -a
  source .env.local
  set +a
fi

# Verify ADMIN_SECRET is set
if [ -z "${ADMIN_SECRET:-}" ]; then
  echo "ERROR: ADMIN_SECRET is not set"
  exit 1
fi

# Set BASE if not provided (allow override from env)
BASE="${BASE:-http://localhost:3012}"
export BASE

echo ""
echo "1) Kill any existing listener on port 3012"
PIDS=$(lsof -t -iTCP:3012 -sTCP:LISTEN 2>/dev/null || true)
if [ -n "${PIDS:-}" ]; then
  echo "Killing PIDs: $PIDS"
  kill $PIDS 2>/dev/null || true
  sleep 1
  # Force kill if still alive
  PIDS2=$(lsof -t -iTCP:3012 -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "${PIDS2:-}" ]; then
    kill -9 $PIDS2 2>/dev/null || true
  fi
fi
echo "Port 3012 is clear"

echo ""
echo "2) Build production bundle"
npm run build

echo ""
echo "3) Start production server (background)"
npm run start &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Trap to ensure cleanup
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
echo "4) Wait for server readiness (max 60s)"
READY=false
for i in {1..60}; do
  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/store-settings" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "401" ]; then
    echo "Server is ready! (received 401 as expected)"
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
echo "5) Run smoke tests"
bash scripts/smoke-store-settings.sh

echo ""
echo "=== Production Smoke Complete ==="
