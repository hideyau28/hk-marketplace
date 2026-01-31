#!/usr/bin/env bash
set -euo pipefail

# Defaults:
# - WF=CI
# - BRANCH=main
# - EVENT=push on main, otherwise pull_request
# Smoke markers: "SMOKE PASS" or "=== Production Smoke Complete ===" or "=== Local Smoke Complete ==="

WF="${WF:-CI}"
BRANCH="${BRANCH:-main}"
EVENT="${EVENT:-}"
HEAD_SHA="${HEAD:-}"
SHA="${SHA:-${HEAD_SHA:-$(git rev-parse HEAD)}}"
LIMIT="${LIMIT:-60}"

if [ -z "$EVENT" ]; then
  if [ "$BRANCH" = "main" ]; then
    EVENT="push"
  else
    EVENT="pull_request"
  fi
fi

echo "HEAD=$SHA"
echo "WF=$WF BRANCH=$BRANCH EVENT=$EVENT LIMIT=$LIMIT"
echo

RUN_ID="$(
  gh run list \
    --workflow "$WF" \
    --branch "$BRANCH" \
    --event "$EVENT" \
    --limit "$LIMIT" \
    --json databaseId,headSha \
    --jq ".[] | select(.headSha==\"$SHA\") | .databaseId" \
  | head -n 1 || true
)"

if [ -z "${RUN_ID:-}" ]; then
  echo "CI run for this HEAD not found (workflow=$WF branch=$BRANCH event=$EVENT)."
  exit 1
fi

RUN_INFO="$(gh run view "$RUN_ID" --json status,conclusion,headSha,url --jq "\"status=\"+.status+\" conclusion=\"+.conclusion+\" url=\"+.url+\" sha=\"+.headSha")"
echo "RUN_ID=$RUN_ID"
echo "$RUN_INFO"
echo

STATUS=""
CONCLUSION=""
URL=""
for _ in {1..30}; do
  STATUS="$(gh run view "$RUN_ID" --json status --jq ".status")"
  CONCLUSION="$(gh run view "$RUN_ID" --json conclusion --jq ".conclusion")"
  URL="$(gh run view "$RUN_ID" --json url --jq ".url")"
  if [ "$STATUS" = "completed" ]; then
    break
  fi
  sleep 3
done

if [ "$STATUS" != "completed" ]; then
  echo "Run not completed within timeout."
  echo "url=${URL:-$(echo "$RUN_INFO" | awk -F'url=' '{print $2}' | awk '{print $1}')}"
  exit 1
fi

if [ "$CONCLUSION" != "success" ]; then
  echo "Run conclusion is not success: ${CONCLUSION:-unknown}"
  gh run view "$RUN_ID" --log-failed
  exit 1
fi

echo "---- SMOKE CHECK ----"
LOG="$(gh run view "$RUN_ID" --log)"
MATCHES="$(echo "$LOG" | grep -n -E "SMOKE PASS|=== Production Smoke Complete ===|=== Local Smoke Complete ===" || true)"
if [ -n "$MATCHES" ]; then
  echo "$MATCHES"
  exit 0
fi

echo "SMOKE markers not found; tailing last 200 log lines"
echo "$LOG" | tail -n 200
exit 1
