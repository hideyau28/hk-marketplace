# AI Routing & Handoff Protocol (Cross-Project, 1–2 pages)

Purpose: minimize back-and-forth by enforcing one complete task package and clear routing rules. Works across repos; copy as-is.
Scope: L1/L2/L3 routing, P0/P1/P2 slicing, scope limits, stop rules, handoff templates, and a 6-line kickstart for new AIs.

## New AI Kickstart (copy/paste once)
1) Read task + constraints; restate objective in 1 line.
2) Identify level (L1/L2/L3) + priority (P0/P1/P2) and say why.
3) List plan as checkboxes; ask ONE clarifying question max, then proceed with safest defaults if no reply.
4) Show intended files/areas; keep scope ≤5 files and one change request.
5) Execute per level rules; surface risks/assumptions explicitly.
6) Report with Implementer Output (5 lines) and evidence asked in TASK PACKAGE.

## Routing Levels (L1/L2/L3)
- L1 (planning/spec only; cheap): no code changes, no commands. Output: clarified spec/plan.
- L2 (default; implement + tests + small refactors): allowed to edit code, run tests/build. Output: working change + evidence.
- L3 (expensive; deep debug/architecture): use only if L2 is blocked or architecture unclear. Output: diagnosis/design + evidence.

### Escalation / Downgrade Rules (evidence required)
- L1 → L2 when spec is settled and execution is needed.
- L2 → L3 only after L2 attempts fail or architecture is uncertain.
- Provide evidence when escalating: key logs/errors, failed hypotheses/attempts, and why blocked. If uncertainty clears, downgrade back to L2.

## Priority Slicing (P0/P1/P2)
- P0 (must): security, data integrity, auth/guards, idempotency, migration safety, CI green, smoke pass.
- P1 (should): observability, DX, meaningful logs/metrics, helpful errors, docs/runbook updates.
- P2 (nice): UI polish, refactors, perf tuning, extra tests beyond smoke.

## Scope & Stop Rules
- Max scope: one domain/feature, ≈≤5 files (tests/migrations may add a few), one change request per package.
- Stop rules: any new requirement → new task package. If blocked after one clarifying question, proceed with safest default and document assumptions.

## TASK PACKAGE (copy/paste)
```
TASK PACKAGE

Objective:

Constraints:
- No breaking changes
- Keep smoke green
- Follow existing patterns

Risk: Low / Medium / High

Files/areas touched (expected):
-

Non-goals:
-

Acceptance criteria:
-

Implementation steps:
1)
2)
3)

Verification commands:
- npm run build
- npm run smoke:prod
- npm run ci:verify

Single command to run:
-

Evidence required:
- Paste key terminal outputs for build + smoke + ci verify

Rollback plan:
- git revert <commit> (or restore prior files)

Definition of Done:
- [ ] Objective met
- [ ] Constraints respected
- [ ] Verification commands pass
- [ ] Evidence attached
- [ ] Rollback plan documented
```

## Implementer Output (5 lines)
1) Done/Not done + why
2) Files changed (list)
3) Commands run + results
4) Risks/notes (max 3 bullets)
5) Next step (ONE command only)

## Working Rules (per level)
- L1: Plan only; do not touch code/commands.
- L2: Default path; implement, keep changes minimal, follow patterns, keep tests/smoke green.
- L3: Use for deep debugging/architecture; explain hypotheses, branches tried, and decisions.

## Safety & Defaults
- Prefer least privilege and reversible changes; avoid breaking behavior.
- Document assumptions when user is silent; pick safest default.
- Keep migrations/idempotency guarded; never risk data corruption.

## Evidence & Verification
- Honor the TASK PACKAGE “Evidence required”.
- If no commands are required, note “No commands run; docs-only change”.
- If commands fail, include logs and what you tried.

## Notes for Repo Owners
- To reuse elsewhere, copy this file; adjust only repo-specific commands if needed.
- Optional entry point: add one line in README/CONTRIBUTING linking to this file.
