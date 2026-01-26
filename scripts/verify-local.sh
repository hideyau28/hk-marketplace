#!/usr/bin/env bash
set -euo pipefail

echo "== verify:local =="
echo "1) build"
npm run -s build

echo
echo "2) smoke:prod"
npm run -s smoke:prod

echo
echo "OK: verify:local passed"
