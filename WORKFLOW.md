# hk-marketplace Workflow Protocol (1-page)

This document defines how to cut tasks and hand them off so work can be completed in one pass with minimal back-and-forth.

## 1) Task Levels (P0/P1/P2)
P0 (must): security, data integrity, auth/guard correctness, idempotency, migration safety, CI green, smoke pass.
P1 (should): observability, DX improvements, meaningful logs/metrics, helpful error codes, docs/runbook updates.
P2 (nice): UI polish, refactors, performance tuning, additional tests beyond smoke.

## 2) Definition of Done (DoD)
A task is "done" only if all of the following pass:
- `npm run build`
- `npm run smoke:prod`
- `npm run ci:verify` (must find CI run for HEAD and include "SMOKE PASS")

If any fails, fix before reporting completion.

## 3) How to Cut a Task (single package)
Every task request MUST include:
A) Goal (1 sentence)
B) Scope (what files/modules are allowed to change)
C) Non-goals (what NOT to touch)
D) Acceptance checks (commands to run)
E) Risk notes (top 1-3 things that could break)

## 4) Handoff Format (you → implementer)
Copy/paste this template:

TITLE:
LEVEL: P0/P1/P2
GOAL:
SCOPE:
NON-GOALS:
ACCEPTANCE:
- npm run build
- npm run smoke:prod
- npm run ci:verify
RISKS:

## 5) Implementer Output Format (fixed 5 lines)
1) Done/Not done + why
2) Files changed (list)
3) Commands run + results
4) Risks/notes (max 3 bullets)
5) Next step (ONE command only)

## 6) Back-and-forth Rule
Implementer may ask at most ONE clarifying question.
If still ambiguous, proceed with the safest default and note assumptions.
