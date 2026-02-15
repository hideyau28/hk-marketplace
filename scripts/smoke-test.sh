#!/usr/bin/env bash
set -euo pipefail

# E2E smoke test — curl all public endpoints, check response codes.
#
# Usage:
#   BASE=https://wowlix.com bash scripts/smoke-test.sh
#
# Defaults to https://wowlix.com if BASE is not set.

BASE="${BASE:-https://wowlix.com}"
BASE="${BASE%/}"

PASS=0
FAIL=0

check_status() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"

  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 "$url" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" = "$expected" ]; then
    echo "  PASS  ${label} (${HTTP_CODE})"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  ${label} — expected ${expected}, got ${HTTP_CODE}"
    FAIL=$((FAIL + 1))
  fi
}

check_json() {
  local label="$1"
  local url="$2"
  local jq_expr="$3"

  BODY=$(curl -sS -L --max-time 15 "$url" 2>/dev/null || echo "")
  HTTP_CODE=$(curl -sS -o /dev/null -w "%{http_code}" -L --max-time 15 "$url" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" != "200" ]; then
    echo "  FAIL  ${label} — expected 200, got ${HTTP_CODE}"
    FAIL=$((FAIL + 1))
    return
  fi

  if ! command -v jq >/dev/null 2>&1; then
    echo "  WARN  ${label} — jq not installed, skipping body check (HTTP ${HTTP_CODE} OK)"
    PASS=$((PASS + 1))
    return
  fi

  RESULT=$(echo "$BODY" | jq -r "$jq_expr" 2>/dev/null || echo "error")
  if [ "$RESULT" = "true" ]; then
    echo "  PASS  ${label} (${HTTP_CODE}, body OK)"
    PASS=$((PASS + 1))
  else
    echo "  FAIL  ${label} — body check failed (jq: ${jq_expr} → ${RESULT})"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== E2E Smoke Test (${BASE}) ==="
echo ""

check_status "Homepage (root)"          "${BASE}/"
check_status "English locale"            "${BASE}/en"
check_status "zh-HK pricing page"       "${BASE}/zh-HK/pricing"
check_status "Tenant storefront"         "${BASE}/maysshop"
check_json   "Payment config API"        "${BASE}/api/payment-config?tenant=maysshop" \
             '(.providers | length) > 0'

echo ""
echo "  Results: ${PASS} passed, ${FAIL} failed"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "SMOKE FAIL"
  exit 1
fi

echo "SMOKE PASS"
