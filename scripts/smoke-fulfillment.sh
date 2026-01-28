#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# smoke-fulfillment.sh — Fulfillment status + timestamps smoke test
# ============================================================
# Tests:
#   1. Admin auth for PATCH
#   2. Valid status transitions with timestamp auto-set
#   3. Timestamp write-once (second PATCH same status won't overwrite)
#   4. Invalid status value -> 400 BAD_REQUEST
# ============================================================

BASE="${BASE:-http://localhost:3012}"
ADMIN_SECRET="${ADMIN_SECRET:-}"

# Normalize BASE (strip trailing slash)
BASE="${BASE%/}"

die() { echo "FAIL: $*" >&2; exit 1; }

curl_resp() {
  curl -sS -i "$@" || true
}

resp_body() {
  echo "$1" | awk 'BEGIN{body=0} /^[[:space:]]*$/{body=1; next} {if(body) print}'
}

must_have_error_code() {
  local resp="$1"; local code="$2"
  echo "$resp" | grep -q "\"code\":\"$code\"" || die "expected error.code=$code"
}

ensure_jq() {
  command -v jq >/dev/null 2>&1 || die "jq is required for smoke-fulfillment.sh"
}

# ============================================================
# Pre-flight checks
# ============================================================

if [ -z "${ADMIN_SECRET}" ]; then
  echo "ERROR: ADMIN_SECRET is not set." >&2
  echo "Usage: ADMIN_SECRET=<secret> bash scripts/smoke-fulfillment.sh" >&2
  exit 1
fi

ensure_jq

echo "== Fulfillment Smoke Test =="
echo "BASE: $BASE"
echo

# Check server reachability
if ! curl -sS --connect-timeout 3 -o /dev/null "${BASE}/api/orders" 2>/dev/null; then
  echo "ERROR: Cannot reach ${BASE}" >&2
  echo "Please start the dev server first: npm run dev" >&2
  exit 1
fi

# ============================================================
# Step 1: Create an order
# ============================================================

echo "== Step 1) Create order =="

IDEM_KEY="smoke-fulfillment-$(date +%s)-$$"
ORDER_PAYLOAD='{
  "customerName": "Fulfillment Test",
  "phone": "+852-9999-0002",
  "email": "smoke-fulfillment@example.com",
  "items": [
    {
      "productId": "smoke-p-2",
      "name": "Fulfillment Test Product",
      "unitPrice": 50,
      "quantity": 2
    }
  ],
  "amounts": {
    "subtotal": 100,
    "total": 100,
    "currency": "HKD"
  },
  "fulfillment": {
    "type": "delivery"
  },
  "note": "Smoke test for fulfillment"
}'

resp="$(curl_resp -X POST \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  -H "x-idempotency-key: ${IDEM_KEY}" \
  --data "${ORDER_PAYLOAD}" \
  "${BASE}/api/orders")"

h="$(echo "$resp" | sed -n "1p")"
if ! [[ "$h" =~ " 200 " ]]; then
  echo "Response:"
  resp_body "$resp" | head -20
  die "expected POST /api/orders -> 200 but got: $h"
fi

body="$(resp_body "$resp")"
ORDER_ID="$(echo "$body" | jq -r '.data.id')"

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
  echo "Response body:"
  echo "$body" | head -20
  die "failed to extract orderId from response"
fi

echo "OK: Order created (orderId=$ORDER_ID)"
echo

# ============================================================
# Step 2: Admin auth check for PATCH
# ============================================================

echo "== Step 2) Admin auth for PATCH =="

resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  --data '{"status":"PAID"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 401 " ]] || die "expected PATCH without secret -> 401 but got: $h"
must_have_error_code "$resp" "ADMIN_AUTH_MISSING"

resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: WRONG" \
  --data '{"status":"PAID"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 403 " ]] || die "expected PATCH with wrong secret -> 403 but got: $h"
must_have_error_code "$resp" "ADMIN_AUTH_INVALID"

echo "OK: PATCH no secret -> 401 ADMIN_AUTH_MISSING"
echo "OK: PATCH wrong secret -> 403 ADMIN_AUTH_INVALID"
echo

# ============================================================
# Step 3: Valid status sequence with timestamps
# ============================================================

echo "== Step 3) Valid status transitions + timestamps =="

# PENDING -> FULFILLING (sets fulfillingAt)
resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  --data '{"status":"FULFILLING"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH FULFILLING -> 200 but got: $h"

body="$(resp_body "$resp")"
echo "$body" | jq -e '.data.status == "FULFILLING"' >/dev/null || die "expected status FULFILLING"
FULFILLING_AT_1="$(echo "$body" | jq -r '.data.fulfillingAt')"
[ "$FULFILLING_AT_1" != "null" ] && [ -n "$FULFILLING_AT_1" ] || die "expected fulfillingAt to be set"

echo "OK: PENDING -> FULFILLING (fulfillingAt=$FULFILLING_AT_1)"

# PATCH FULFILLING again -> timestamp should NOT change (write-once)
sleep 1  # ensure time difference if it were to change
resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  --data '{"status":"FULFILLING"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH FULFILLING again -> 200 but got: $h"

body="$(resp_body "$resp")"
FULFILLING_AT_2="$(echo "$body" | jq -r '.data.fulfillingAt')"
[ "$FULFILLING_AT_2" = "$FULFILLING_AT_1" ] || die "expected fulfillingAt unchanged (write-once), was $FULFILLING_AT_1, now $FULFILLING_AT_2"

echo "OK: FULFILLING again -> fulfillingAt unchanged (write-once)"

# FULFILLING -> SHIPPED (sets shippedAt)
resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  --data '{"status":"SHIPPED"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH SHIPPED -> 200 but got: $h"

body="$(resp_body "$resp")"
echo "$body" | jq -e '.data.status == "SHIPPED"' >/dev/null || die "expected status SHIPPED"
SHIPPED_AT="$(echo "$body" | jq -r '.data.shippedAt')"
[ "$SHIPPED_AT" != "null" ] && [ -n "$SHIPPED_AT" ] || die "expected shippedAt to be set"

echo "OK: FULFILLING -> SHIPPED (shippedAt=$SHIPPED_AT)"

# SHIPPED -> COMPLETED (sets completedAt)
resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  --data '{"status":"COMPLETED"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH COMPLETED -> 200 but got: $h"

body="$(resp_body "$resp")"
echo "$body" | jq -e '.data.status == "COMPLETED"' >/dev/null || die "expected status COMPLETED"
COMPLETED_AT="$(echo "$body" | jq -r '.data.completedAt')"
[ "$COMPLETED_AT" != "null" ] && [ -n "$COMPLETED_AT" ] || die "expected completedAt to be set"

echo "OK: SHIPPED -> COMPLETED (completedAt=$COMPLETED_AT)"
echo

# ============================================================
# Step 4: Invalid status value -> 400 BAD_REQUEST
# ============================================================

echo "== Step 4) Invalid status value =="

resp="$(curl_resp -X PATCH \
  -H "content-type: application/json" \
  -H "x-admin-secret: ${ADMIN_SECRET}" \
  --data '{"status":"INVALID_STATUS"}' \
  "${BASE}/api/orders/${ORDER_ID}")"

h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected PATCH invalid status -> 400 but got: $h"
must_have_error_code "$resp" "BAD_REQUEST"

echo "OK: PATCH invalid status -> 400 BAD_REQUEST"
echo

# ============================================================
# Success
# ============================================================

echo "SMOKE PASS (fulfillment)"
echo "orderId=$ORDER_ID"
