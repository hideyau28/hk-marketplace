# CLAUDE.md — hk-marketplace agent rules

This repo is optimized for fast iteration *without* sacrificing quality.
Follow these rules strictly.

## Operating model
- You (Claude Code) write code.
- Cynthia (reviewer) runs verification and acceptance checks.

## Hard rules (must)
1) **Scope control**
   - Only touch files directly required for the task.
   - If you need to expand scope, stop and ask.

2) **One task = one commit**
   - Keep commits small and reversible.
   - No drive-by refactors.

3) **No secrets**
   - Never add API keys, tokens, webhook secrets, `.env.local`, or any credentials.
   - Do not create or commit secret files (e.g. `.claude.env`, `.env.*`).

4) **Plan → Implement → Verify**
   - Before editing: write a short plan (files to change + what changes).
   - After editing: run verification (at least `npm run ci:build`).
   - If verification fails: fix or revert before committing.

5) **Backward compatibility**
   - If legacy fields exist, prefer the new canonical model but keep fallbacks.
   - Example: prefer `paymentAttempts`, fallback to legacy Stripe fields when attempts are missing.

## Default verification commands
Run these unless the task says otherwise:

```bash
npm run ci:build
```

If the change affects orders APIs/admin:

```bash
npm run smoke:local
```

## Delivery checklist (must include in your final response)
- Commit hash + message
- List of files changed
- Verification output (tail) showing PASS
- Any follow-ups / known limitations

## Style
- Minimal, readable code.
- Prefer explicit types where helpful.
- Avoid adding dependencies unless necessary.
