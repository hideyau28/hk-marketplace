#!/usr/bin/env bash
set -euo pipefail

# BASE can be origin OR full endpoint.
BASE="${BASE:-http://localhost:3012}"
ADMIN_SECRET="${ADMIN_SECRET:-}"

# normalize BASE to full endpoint exactly once
if [[ "$BASE" != *"/api/admin/products" ]]; then
  BASE="${BASE%/}/api/admin/products"
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
  command -v jq >/dev/null 2>&1 || die "jq is required for smoke-products.sh"
}

if [ -z "${ADMIN_SECRET}" ]; then
  die "ADMIN_SECRET is not set"
fi

ensure_jq

echo "== Products 1) Admin auth checks (GET list) =="

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

echo "== Products 2) Create validations =="

PAYLOAD='{"title":"Test Product","price":99.99,"imageUrl":"https://example.com/image.jpg","active":true}'

resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected POST missing idempotency -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: POST missing idempotency -> 400 + BAD_REQUEST"
echo

echo "== Products 2.1) Payload validation (negative cases) =="

PAYLOAD_BAD_PRICE='{"title":"Test Product","price":-10,"active":true}'
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: bad-price-$(date +%s)" --data "${PAYLOAD_BAD_PRICE}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected POST bad price -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

PAYLOAD_BAD_TITLE='{"title":"","price":99.99,"active":true}'
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: bad-title-$(date +%s)" --data "${PAYLOAD_BAD_TITLE}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected POST bad title -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: POST invalid price -> 400 + BAD_REQUEST"
echo "OK: POST invalid title -> 400 + BAD_REQUEST"
echo

echo "== Products 3) Create with idempotency =="

IDEM="smoke-product-$(date +%s)"
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected POST create -> 200 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

body="$(resp_body "$resp")"
PRODUCT_ID="$(echo "$body" | jq -r '.data.id')"
[ -n "$PRODUCT_ID" ] && [ "$PRODUCT_ID" != "null" ] || die "expected product id"

resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected POST replay -> 200 but got: $h (URL=$BASE)"
body="$(resp_body "$resp")"
PRODUCT_ID_REPLAY="$(echo "$body" | jq -r '.data.id')"
[ "$PRODUCT_ID_REPLAY" = "$PRODUCT_ID" ] || die "expected same product id on idempotent replay"

PAYLOAD_ALT='{"title":"Different Product","price":199.99,"active":true}'
resp="$(curl_resp -X POST -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "${PAYLOAD_ALT}" "$BASE")"
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

echo "== Products 4) Admin list/get/update =="

resp="$(curl_resp -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE?limit=10")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected GET list -> 200 but got: $h (URL=$BASE)"
body="$(resp_body "$resp")"
echo "$body" | jq -e --arg id "$PRODUCT_ID" '.data.products | map(.id) | index($id) != null' >/dev/null || die "expected product in list"

resp="$(curl_resp -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE/$PRODUCT_ID")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected GET by id -> 200 but got: $h (URL=$BASE/$PRODUCT_ID)"
body="$(resp_body "$resp")"
echo "$body" | jq -e --arg id "$PRODUCT_ID" '.data.id == $id' >/dev/null || die "expected product id match"

resp="$(curl_resp -X PATCH -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" --data '{"price":149.99,"active":false}' "$BASE/$PRODUCT_ID")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 200 " ]] || die "expected PATCH -> 200 but got: $h (URL=$BASE/$PRODUCT_ID)"
body="$(resp_body "$resp")"
echo "$body" | jq -e '.data.price == 149.99' >/dev/null || die "expected price 149.99"
echo "$body" | jq -e '.data.active == false' >/dev/null || die "expected active false"

echo "OK: GET list -> 200"
echo "OK: GET by id -> 200"
echo "OK: PATCH product -> 200"
echo

echo "SMOKE PASS"
