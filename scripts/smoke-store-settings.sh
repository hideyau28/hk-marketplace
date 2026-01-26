#!/usr/bin/env bash
set -euo pipefail

# BASE can be origin OR full endpoint.
BASE="${BASE:-http://localhost:3012}"
ADMIN_SECRET="${ADMIN_SECRET:-}"

# normalize BASE to full endpoint exactly once
if [[ "$BASE" != *"/api/store-settings" ]]; then
  BASE="${BASE%/}/api/store-settings"
fi

die() { echo "FAIL: $*" >&2; exit 1; }

curl_head() {
  # prints first status line only
  curl -sS -i "$@" | sed -n "1p"
}

curl_resp() {
  curl -sS -i "$@" || true
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

echo "== 1) Auth checks (header secret) =="

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

h="$(curl_head -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected HTTP 200 but got: $h (URL=$BASE)"

echo "OK: GET no secret -> 401 (+requestId + ADMIN_AUTH_MISSING)"
echo "OK: GET wrong secret -> 403 (+requestId + ADMIN_AUTH_INVALID)"
echo "OK: GET correct secret -> 200"
echo

echo "== 1b) Basic auth checks =="

h="$(curl_head -u "admin:${ADMIN_SECRET}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected HTTP 200 (basic ok) but got: $h (URL=$BASE)"

resp="$(curl_resp -u "admin:WRONG" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 403 " ]] || die "expected HTTP 403 (basic wrong) but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "ADMIN_AUTH_INVALID"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: GET basic ok -> 200"
echo "OK: GET basic wrong -> 403 (+requestId + ADMIN_AUTH_INVALID)"
echo

echo "== 2) Idempotency checks (PUT: header/bearer/basic) =="

echo "== 2a) PUT validation errors (missing header / invalid JSON) =="

resp="$(curl_resp -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" --data "{}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected PUT missing idempotency -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

resp="$(curl_resp -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: smoke-badjson" --data "{bad json" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 400 " ]] || die "expected PUT invalid JSON -> 400 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "BAD_REQUEST"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: PUT missing idempotency -> 400 + BAD_REQUEST"
echo "OK: PUT invalid JSON -> 400 + BAD_REQUEST"
echo

# --- PUT via x-admin-secret (header) ---
IDEM="smoke-hdr-$(date +%s)"
h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(header) first -> 200 but got: $h (URL=$BASE)"

h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(header) replay -> 200 but got: $h (URL=$BASE)"

resp="$(curl -sS -i -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"C\"}" "$BASE" || true)"
echo "$resp" | sed -n "1p" | grep -q " 409 " || die "expected PUT(header) conflict -> 409 (URL=$BASE)"
echo "$resp" | grep -q "\"code\":\"CONFLICT\"" || die "expected error.code=CONFLICT (URL=$BASE)"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: PUT(header) first -> 200"
echo "OK: PUT(header) replay same key+payload -> 200"
echo "OK: PUT(header) same key different payload -> 409 + CONFLICT"
echo

# --- PUT via Bearer ---
IDEM_BEARER="smoke-bearer-$(date +%s)"
h="$(curl_head -X PUT -H "content-type: application/json" -H "Authorization: Bearer ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM_BEARER}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(bearer) first -> 200 but got: $h (URL=$BASE)"

h="$(curl_head -X PUT -H "content-type: application/json" -H "Authorization: Bearer ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM_BEARER}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(bearer) replay -> 200 but got: $h (URL=$BASE)"

resp="$(curl -sS -i -X PUT -H "content-type: application/json" -H "Authorization: Bearer ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM_BEARER}" --data "{\"id\":\"default\",\"storeName\":\"C\"}" "$BASE" || true)"
echo "$resp" | sed -n "1p" | grep -q " 409 " || die "expected PUT(bearer) conflict -> 409 (URL=$BASE)"
echo "$resp" | grep -q "\"code\":\"CONFLICT\"" || die "expected error.code=CONFLICT (URL=$BASE)"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: PUT(bearer) first -> 200"
echo "OK: PUT(bearer) replay same key+payload -> 200"
echo "OK: PUT(bearer) same key different payload -> 409 + CONFLICT"
echo

# --- PUT via Basic ---
IDEM_BASIC="smoke-basic-$(date +%s)"
h="$(curl_head -X PUT -u "admin:${ADMIN_SECRET}" -H "content-type: application/json" -H "x-idempotency-key: ${IDEM_BASIC}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(basic) first -> 200 but got: $h (URL=$BASE)"

h="$(curl_head -X PUT -u "admin:${ADMIN_SECRET}" -H "content-type: application/json" -H "x-idempotency-key: ${IDEM_BASIC}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(basic) replay -> 200 but got: $h (URL=$BASE)"

resp="$(curl -sS -i -X PUT -u "admin:${ADMIN_SECRET}" -H "content-type: application/json" -H "x-idempotency-key: ${IDEM_BASIC}" --data "{\"id\":\"default\",\"storeName\":\"C\"}" "$BASE" || true)"
echo "$resp" | sed -n "1p" | grep -q " 409 " || die "expected PUT(basic) conflict -> 409 (URL=$BASE)"
echo "$resp" | grep -q "\"code\":\"CONFLICT\"" || die "expected error.code=CONFLICT (URL=$BASE)"
must_have_request_id "$resp"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "== 3) PUT auth failures =="

resp="$(curl_resp -X PUT -H "content-type: application/json" -H "x-idempotency-key: smoke-missing-auth" --data "{}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 401 " ]] || die "expected PUT missing auth -> 401 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "ADMIN_AUTH_MISSING"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

resp="$(curl_resp -X PUT -H "content-type: application/json" -H "x-admin-secret: WRONG" -H "x-idempotency-key: smoke-badauth" --data "{}" "$BASE")"
h="$(echo "$resp" | sed -n "1p")"
[[ "$h" =~ " 403 " ]] || die "expected PUT wrong auth -> 403 but got: $h (URL=$BASE)"
must_have_request_id "$resp"
must_have_error_code "$resp" "ADMIN_AUTH_INVALID"
must_have_header "$resp" "x-request-id"
must_have_header "$resp" "content-type"

echo "OK: PUT missing auth -> 401 + ADMIN_AUTH_MISSING"
echo "OK: PUT wrong auth -> 403 + ADMIN_AUTH_INVALID"
echo

echo "OK: PUT(basic) first -> 200"
echo "OK: PUT(basic) replay same key+payload -> 200"
echo "OK: PUT(basic) same key different payload -> 409 + CONFLICT"
echo

echo "SMOKE PASS"
