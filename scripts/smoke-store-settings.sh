#\!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://localhost:3012}"
ENDPOINT="${ENDPOINT:-/api/store-settings}"
URL="${BASE}${ENDPOINT}"

ADMIN_SECRET="${ADMIN_SECRET:-}"
if [ -z "$ADMIN_SECRET" ]; then
  echo "ERROR: ADMIN_SECRET is empty. Export it or source .env.local before running."
  exit 1
fi

IDEM="${IDEM:-smoke-$(date +%s)}"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "OK: $*"; }

# helper: curl with headers, output both headers+body
req() {
  local method="$1"; shift
  curl -sS -i -X "$method" "$@"
}

expect_status() {
  local resp="$1"
  local want="$2"
  local got
  got="$(printf "%s" "$resp" | head -n 1 | awk "{print \$2}")"
  [ "$got" = "$want" ] || fail "expected HTTP $want but got $got. first line: $(printf "%s" "$resp" | head -n 1)"
}

expect_json_has() {
  local resp="$1"
  local needle="$2"
  printf "%s" "$resp" | tr -d "\r\n" | grep -q "$needle" || fail "missing JSON fragment: $needle"
}

echo "== 1) Auth checks =="
r="$(req GET "$URL")"
expect_status "$r" "401"
expect_json_has "$r" "\"code\":\"UNAUTHORIZED\""
pass "GET no secret -> 401 UNAUTHORIZED"

r="$(req GET -H "x-admin-secret: WRONG" "$URL")"
expect_status "$r" "403"
expect_json_has "$r" "\"code\":\"FORBIDDEN\""
pass "GET wrong secret -> 403 FORBIDDEN"

r="$(req GET -H "x-admin-secret: $ADMIN_SECRET" "$URL")"
expect_status "$r" "200"
expect_json_has "$r" "\"ok\":true"
pass "GET correct secret -> 200 OK"

echo
echo "== 2) Idempotency checks (PUT) =="

payloadB="{\"id\":\"default\",\"storeName\":\"B\"}"
payloadC="{\"id\":\"default\",\"storeName\":\"C\"}"

r="$(req PUT \
  -H "content-type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "x-idempotency-key: $IDEM" \
  --data "$payloadB" \
  "$URL")"
expect_status "$r" "200"
expect_json_has "$r" "\"ok\":true"
expect_json_has "$r" "\"storeName\":\"B\""
pass "PUT first (idem=$IDEM, payload=B) -> 200"

r2="$(req PUT \
  -H "content-type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "x-idempotency-key: $IDEM" \
  --data "$payloadB" \
  "$URL")"
expect_status "$r2" "200"
expect_json_has "$r2" "\"ok\":true"
expect_json_has "$r2" "\"storeName\":\"B\""
pass "PUT replay same key+payload -> 200"

r3="$(req PUT \
  -H "content-type: application/json" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "x-idempotency-key: $IDEM" \
  --data "$payloadC" \
  "$URL")"
expect_status "$r3" "409"
expect_json_has "$r3" "\"code\":\"CONFLICT\""
pass "PUT same key different payload -> 409 + CONFLICT"

echo
echo "SMOKE PASS"
