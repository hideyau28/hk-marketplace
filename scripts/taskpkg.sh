#!/usr/bin/env bash
set -euo pipefail

risk="${1:-}"
shift || true
objective="$*"

if [[ -z "$risk" ]]; then
  read -r -p "Risk (P0/P1/P2): " risk
fi

if [[ -z "$objective" ]]; then
  read -r -p "Objective: " objective
fi

template=$(
  printf '%s\n' \
    "TASK PACKAGE" \
    "" \
    "Objective:" \
    "$objective" \
    "" \
    "Constraints:" \
    "- No breaking changes" \
    "- Keep smoke green" \
    "- Follow existing patterns" \
    "" \
    "Risk: $risk" \
    "" \
    "Files/areas touched (expected):" \
    "-" \
    "" \
    "Non-goals:" \
    "-" \
    "" \
    "Acceptance criteria:" \
    "-" \
    "" \
    "Implementation steps:" \
    "1)" \
    "2)" \
    "3)" \
    "" \
    "Verification commands:" \
    "- npm run build" \
    "- npm run smoke:prod" \
    "- npm run ci:verify" \
    "" \
    "Single command to run:" \
    "-" \
    "" \
    "Evidence required:" \
    "- Paste key terminal outputs for build + smoke + ci verify" \
    "" \
    "Rollback plan:" \
    "- git revert <commit> (or restore prior files)" \
    "" \
    "Definition of Done:" \
    "- [ ] Objective met" \
    "- [ ] Constraints respected" \
    "- [ ] Verification commands pass" \
    "- [ ] Evidence attached" \
    "- [ ] Rollback plan documented"
)

printf "%s\n" "$template" | pbcopy
printf "%s\n" "$template"