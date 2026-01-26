# hk-marketplace Workflow Protocol (1-page)

Goal: reduce back-and-forth between ChatGPT and coding agents by using a single, complete task package per change.

Deployment model note: hk-marketplace is a single-tenant merchant site template (“B” model). Each merchant = one deployment + DB + ADMIN_SECRET.

## 1) Routing Rule (L1/L2/L3)
- L1 (cheap): planning/spec only. No code changes, no commands run.
- L2 (primary): implement + tests + small refactors. Default for most tasks.
- L3 (expensive): hard debugging/architecture. Only when L2 fails or scope is unclear.

Model routing: L1 = DeepSeek, L2 = OpenAI Codex, L3 = Claude (Wildcard/Anthropic).

When to escalate:
- L1 → L2 once spec is agreed and execution is needed.
- L2 → L3 only after L2 attempts fail or the architecture is uncertain.
- Escalation evidence required: paste key logs/errors, failed hypotheses, and why L2 is blocked.

## 2) Task Slicing Rules (P0/P1/P2)
- P0 (must): security, data integrity, auth/guard correctness, idempotency, migration safety, CI green, smoke pass.
- P1 (should): observability, DX improvements, meaningful logs/metrics, helpful error codes, docs/runbook updates.
- P2 (nice): UI polish, refactors, performance tuning, extra tests beyond smoke.

Max scope per task:
- One domain or feature area, <= 5 files (unless migrations/tests require more).
- One change request per task package. No drive-by fixes.

Stop rules:
- Any new requirement or second feature = new task package.
- If blocked after one clarifying question, proceed with safest default and document assumptions.

## 3) Task Package Template (copy/paste)
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

## 4) Implementer Output (5 lines)
1) Done/Not done + why
2) Files changed (list)
3) Commands run + results
4) Risks/notes (max 3 bullets)
5) Next step (ONE command only)
