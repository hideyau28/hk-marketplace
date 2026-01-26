#!/usr/bin/env bash
set -euo pipefail

WF="${WF:-CI}"
BRANCH="${BRANCH:-main}"
EVENT="${EVENT:-}"   # optional: push / pull_request
SHA="${SHA:-$(git rev-parse HEAD)}"
LIMIT="${LIMIT:-60}"

echo "HEAD=$SHA"
echo "WF=$WF BRANCH=$BRANCH EVENT=${EVENT:-<any>} LIMIT=$LIMIT"
echo

q=(gh run list --workflow "$WF" --limit "$LIMIT" --json databaseId,headSha,status,conclusion,event,headBranch)
if [ -n "$BRANCH" ]; then q+=(--branch "$BRANCH"); fi

if [ -n "$EVENT" ]; then
  RUN_ID="$("${q[@]}" -q ".[] | select(.headSha==\"$SHA\" and .event==\"$EVENT\") | .databaseId" | head -n 1 || true)"
else
  RUN_ID="$("${q[@]}" -q ".[] | select(.headSha==\"$SHA\") | .databaseId" | head -n 1 || true)"
fi

if [ -z "${RUN_ID:-}" ]; then
  echo "CI run for this HEAD not found (workflow=$WF branch=$BRANCH event=${EVENT:-any})."
  exit 1
fi

echo "RUN_ID=$RUN_ID"
gh run view "$RUN_ID" --json status,conclusion,url,headSha,createdAt -q "\"status=\"+.status+\" conclusion=\"+.conclusion+\" url=\"+.url+\" sha=\"+.headSha+\" createdAt=\"+.createdAt"
echo
echo "---- SMOKE PASS ----"
gh run view "$RUN_ID" --log | grep -n "SMOKE PASS" || { echo "SMOKE PASS: NOT FOUND"; exit 1; }
