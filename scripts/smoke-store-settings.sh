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

echo "== 1) Auth checks =="
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

echo "== 2) Idempotency checks (PUT) =="
IDEM="smoke-$(date +%s)"
h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT first -> 200 but got: $h (URL=$BASE)"

h="$(curl_head -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"B\"}" "$BASE" || true)"
[[ "$h" =~ " 200 " ]] || die "expected PUT replay -> 200 but got: $h (URL=$BASE)"

# expect 409 + body code=CONFLICT
resp="$(curl -sS -i -X PUT -H "content-type: application/json" -H "x-admin-secret: ${ADMIN_SECRET}" -H "x-idempotency-key: ${IDEM}" --data "{\"id\":\"default\",\"storeName\":\"C\"}" "$BASE" || true)"
echo "$resp" | sed -n "1p" | grep -q " 409 " || die "expected PUT conflict -> 409 (URL=$BASE)"
echo "$resp" | grep -q "\"code\":\"CONFLICT\"" || die "expected error.code=CONFLICT (URL=$BASE)"

echo "OK: PUT first -> 200"
echo "OK: PUT replay same key+payload -> 200"
echo "OK: PUT same key different payload -> 409 + CONFLICT"
echo
echo "SMOKE PASS"
