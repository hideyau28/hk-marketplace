#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# smoke-payments.sh — One-click payment flow verification
# ============================================================
# Tests the critical server-side payment path:
#   1. Create an order via POST /api/orders
#   2. Create a checkout session via POST /api/checkout/session
#   3. Verify response contains Stripe checkout URL
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

ensure_jq() {
  command -v jq >/dev/null 2>&1 || die "jq is required for smoke-payments.sh"
}

# ============================================================
# Pre-flight checks
# ============================================================

if [ -z "${ADMIN_SECRET}" ]; then
  echo "ERROR: ADMIN_SECRET is not set." >&2
  echo "Usage: ADMIN_SECRET=<secret> bash scripts/smoke-payments.sh" >&2
  exit 1
fi

ensure_jq

echo "== Payments Smoke Test =="
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

echo "== Step 1) Create order via POST /api/orders =="

IDEM_KEY="smoke-payments-$(date +%s)-$$"
ORDER_PAYLOAD='{
  "customerName": "Smoke Test",
  "phone": "+852-9999-0001",
  "email": "smoke-payments@example.com",
  "items": [
    {
      "productId": "smoke-p-1",
      "name": "Smoke Test Product",
      "unitPrice": 100,
      "quantity": 1
    }
  ],
  "amounts": {
    "subtotal": 100,
    "discount": 0,
    "deliveryFee": 0,
    "total": 100,
    "currency": "HKD"
  },
  "fulfillment": {
    "type": "pickup"
  },
  "note": "Smoke test order for payments"
}'

resp="$(curl_resp -X POST \
  -H "content-type: application/json" \
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

echo "OK: Order created"
echo "    orderId=$ORDER_ID"
echo

# ============================================================
# Step 2: Create checkout session
# ============================================================

echo "== Step 2) Create checkout session via POST /api/checkout/session =="

CHECKOUT_PAYLOAD="{\"orderId\":\"${ORDER_ID}\",\"locale\":\"zh-HK\"}"

resp="$(curl_resp -X POST \
  -H "content-type: application/json" \
  --data "${CHECKOUT_PAYLOAD}" \
  "${BASE}/api/checkout/session")"

h="$(echo "$resp" | sed -n "1p")"
if ! [[ "$h" =~ " 200 " ]]; then
  echo "Response:"
  resp_body "$resp" | head -20
  die "expected POST /api/checkout/session -> 200 but got: $h"
fi

body="$(resp_body "$resp")"

# Check ok=true
ok_val="$(echo "$body" | jq -r '.ok')"
if [ "$ok_val" != "true" ]; then
  echo "Response body:"
  echo "$body" | head -20
  die "expected ok=true in response"
fi

# Check data.url contains stripe checkout
checkout_url="$(echo "$body" | jq -r '.data.url')"
if [ -z "$checkout_url" ] || [ "$checkout_url" = "null" ]; then
  echo "Response body:"
  echo "$body" | head -20
  die "expected data.url in response"
fi

if ! [[ "$checkout_url" =~ ^https://checkout\.stripe\.com/ ]]; then
  echo "Response body:"
  echo "$body" | head -20
  die "expected data.url to start with https://checkout.stripe.com/ but got: $checkout_url"
fi

echo "OK: Checkout session created"
echo "    url=$checkout_url"
echo

# ============================================================
# Optional: Stripe CLI hint
# ============================================================

if command -v stripe >/dev/null 2>&1; then
  echo "== Optional: Stripe CLI detected =="
  echo "To test webhook locally, run in a separate terminal:"
  echo "  npm run stripe:listen"
  echo "Then trigger a test event:"
  echo "  npm run stripe:trigger:checkout"
  echo
fi

# ============================================================
# Success
# ============================================================

echo "SMOKE PASS (payments)"
echo "orderId=$ORDER_ID"
