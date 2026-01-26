#!/usr/bin/env bash
set -euo pipefail

# BASE can be origin OR full endpoint.
BASE="${BASE:-http://localhost:3012}"
ADMIN_SECRET="${ADMIN_SECRET:-}"

# normalize BASE to full endpoint exactly once
if [[ "$BASE" != *"/api/orders" ]]; then
  BASE="${BASE%/}/api/orders"
fi

die() { echo "FAIL: $*" >&2; exit 1; }

curl_head() {
  # prints first status line only
  curl -sS -i "$@" | sed -n "1p"
}

curl_resp() {
  curl -sS -i "$@" || true
}

resp_body() {
  echo "$1" | awk 'BEGIN{body=0} /^[[:space:]]*$/{body=1; next} {if(body) print}'
}

must_have_request_id() {
  # body contains requestId
  echo "$1" | grep -q '"requestId"' || die "expected body.requestId"
}

must_have_error_code() {
  local resp="$1"; local code="$2"
  echo "$resp" | grep -q "\"code\":\"$code\"" || die "expected error.code=$code"
}

must_have_header() {
  local resp="$1"; local header="$2"
  echo "$resp" | grep -iq "^${header}:" || die "expected header ${header}"
}

ensure_jq() {
  command -v jq >/dev/null 2>&1 || die "jq is required for smoke-orders.sh"
}

if [ -z "${ADMIN_SECRET}" ]; then
  die "ADMIN_SECRET is not set"
fi

ensure_jq

echo "== Orders 1) Admin auth checks (GET list) =="

resp="$(curl_resp "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 401 " ]] || die "expected HTTP 401 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "ADMIN_AUTH_MISSING"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

resp="$(curl_resp -H "x-admin-secret: WRONG" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 403 " ]] || die "expected HTTP 403 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "ADMIN_AUTH_INVALID"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: GET list no secret -> 401 (+requestId + ADMIN_AUTH_MISSING)"
echo "OK: GET list wrong secret -> 403 (+requestId + ADMIN_AUTH_INVALID)"
echo

echo "== Orders 2) Create validations =="

PAYLOAD='{"customerName":"Ada Lovelace","phone":"+852-5555-0000","email":"ada@example.com","items":[{"productId":"p-1","name":"Product 1","unitPrice":199,"quantity":2}],"amounts":{"subtotal":398,"discount":0,"deliveryFee":0,"total":398,"currency":"HKD"},"fulfillment":{"type":"pickup"},"note":"Leave at counter"}'

resp="$(curl_resp -X POST -H "content-type: application/json" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected POST missing idempotency -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: POST missing idempotency -> 400 + BAD_REQUEST"
echo

echo "== Orders 3) Create with idempotency =="

IDEM="smoke-order-$(date +%s)"
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected POST create -> 200 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

body="$(resp_body "$resp")"
ORDER_ID="$(echo "$body" | jq -r '.data.id')"
[ -n "$ORDER_ID" ] && [ "$ORDER_ID" != "null" ] || die "expected order id"

resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected POST replay -> 200 but got: $h (URL=$BASE)"
body="$(resp_body "$resp")"
ORDER_ID_REPLAY="$(echo "$body" | jq -r '.data.id')"
[ "$ORDER_ID_REPLAY" = "$ORDER_ID" ] || die "expected same order id on idempotent replay"

PAYLOAD_ALT='{"customerName":"Ada Lovelace","phone":"+852-5555-0000","email":"ada@example.com","items":[{"productId":"p-2","name":"Product 2","unitPrice":199,"quantity":2}],"amounts":{"subtotal":398,"discount":0,"deliveryFee":0,"total":398,"currency":"HKD"},"fulfillment":{"type":"pickup"},"note":"Leave at counter"}'
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD_ALT}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 409 " ]] || die "expected POST conflict -> 409 but got: $h (URL=$BASE)"
must_have_error_code "$resp" "CONFLICT"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: POST create -> 200"
echo "OK: POST replay same key+payload -> 200"
echo "OK: POST same key different payload -> 409 + CONFLICT"
echo

echo "== Orders 4) Admin list/get/update =="

resp="$(curl_resp -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE?limit=10")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected GET list -> 200 but got: $h (URL=$BASE)"
body="$(resp_body "$resp")"
echo "$body" | jq -e --arg id "$ORDER_ID" '.data.orders | map(.id) | index($id) != null' >/dev/null || die "expected order in list"

resp="$(curl_resp -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE/$ORDER_ID")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected GET by id -> 200 but got: $h (URL=$BASE/$ORDER_ID)"
body="$(resp_body "$resp")"
echo "$body" | jq -e --arg id "$ORDER_ID" '.data.id == $id' >/dev/null || die "expected order id match"

resp="$(curl_resp -X PATCH -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" --data '{"status":"PAID"}' "$BASE/$ORDER_ID")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH -> 200 but got: $h (URL=$BASE/$ORDER_ID)"
body="$(resp_body "$resp")"
echo "$body" | jq -e '.data.status == "PAID"' >/dev/null || die "expected status PAID"

echo "OK: GET list -> 200"
echo "OK: GET by id -> 200"
echo "OK: PATCH status -> 200"
echo

echo "SMOKE PASS"