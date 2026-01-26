#!/usr/bin/env bash
set -euo pipefail

risk="${1:-}"
shift || true
objective="$*"

if [[ -z "$risk" || -z "$objective" ]]; then
  echo "Usage: bash scripts/taskpkg.sh <P0|P1|P2> \"<objective text>\"" >&2
  exit 2
fi

template=$'TASK PACKAGE\n\nObjective:\n'
template+="$objective"$'\n\nConstraints:\n- No breaking changes\n- Keep smoke green\n- Follow existing patterns\n\nRisk: '
template+="$risk"$'\n\nFiles/areas touched (expected):\n-\n\nNon-goals:\n-\n\nAcceptance criteria:\n-\n\nImplementation steps:\n1)\n2)\n3)\n\nVerification commands:\n- npm run build\n- npm run smoke:prod\n- npm run ci:verify\n\nSingle command to run:\n-\n\nEvidence required:\n- Paste key terminal outputs for build + smoke + ci verify\n\nRollback plan:\n- git revert <commit> (or restore prior files)\n\nDefinition of Done:\n- [ ] Objective met\n- [ ] Constraints respected\n- [ ] Verification commands pass\n- [ ] Evidence attached\n- [ ] Rollback plan documented\n'

if command -v pbcopy >/dev/null 2>&1; then
  printf "%s" "$template" | pbcopy
else
  echo "Note: pbcopy not found; skipping clipboard copy." >&2
fi

printf "%s" "$template"