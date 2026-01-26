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

echo "== 1) Auth checks (header secret) =="
h="$(curl_head "$BASE" || true)"
[[ "$h" =~ " 401 " ]] || die "expected HTTP 401 but got: $h (URL=$BASE)"

h="$(curl_head -H "x-admin-secret: WRONG" "$BASE" || true)"
[[ "$h" =~ " 403 " ]] || die "expected HTTP 403 but got: $h (URL=$BASE)"

h="$(curl_head -H "x-admin-secret: ${ADMIN_SECRET}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected HTTP 200 but got: $h (URL=$BASE)"

echo "OK: GET no secret -> 401"
echo "OK: GET wrong secret -> 403"
echo "OK: GET correct secret -> 200"
echo

echo "== 1b) Basic auth checks =="
h="$(curl_head -u "admin:${ADMIN_SECRET}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected HTTP 200 (basic ok) but got: $h (URL=$BASE)"

h="$(curl_head -u "admin:WRONG" "$BASE" || true)"
[[ "$h" =~ " 403 " ]] || die "expected HTTP 403 (basic wrong) but got: $h (URL=$BASE)"

echo "OK: GET basic ok -> 200"
echo "OK: GET basic wrong -> 403"
echo

echo "== 2) Idempotency checks (PUT: header/bearer/basic) =="

# --- PUT via x-admin-secret (header) ---
IDEM="smoke-hdr-$(date +%s)"
h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(header) first -> 200 but got: $h (URL=$BASE)"

h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT(header) replay -> 200 but got: $h (URL=$BASE)"

resp="$(curl -sS -i -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"C\"}" "$BASE" || true)"
echo "$resp" | sed -n "1p" | grep -q " 409 " || die "expected PUT(header) conflict -> 409 (URL=$BASE)"
echo "$resp" | grep -q "\"code\":\"CONFLICT\"" || die "expected error.code=CONFLICT (URL=$BASE)"

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

echo "OK: PUT(basic) first -> 200"
echo "OK: PUT(basic) replay same key+payload -> 200"
echo "OK: PUT(basic) same key different payload -> 409 + CONFLICT"
echo

echo "SMOKE PASS"
