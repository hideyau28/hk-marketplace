# YAU × CLAUDE × CLAUDE CODE — V5

## DECISION-FIRST · SSOT · EVIDENCE-DRIVEN · ADAPTIVE

> Production-ready workflow for a one-person AI studio
> Integrated with Claude Code team best practices (Boris Cherny, @bcherny)

---

## QUICK START — 我要做咩？

```
我要做咩？
│
├── Production down         → §7 HOTFIX H1（即時 fix，事後補 SPEC）
├── Bug fix                 → §7 HOTFIX H2/H3
├── XS batch（≤5 個小改動）  → §2.0 LIGHTWEIGHT MODE（無需 SPEC/PLAN）
├── 新 feature S/M/L        → Phase A → B → C → D
├── Resume 上次 session     → §3 P5 check HANDOFF.md
└── 唔肯定                  → 問自己：改動影唔影響 user flow / data / architecture？
    ├── Yes → 新 feature 流程
    └── No  → XS batch 或 HOTFIX
```

---

## 0) ROLES & RESPONSIBILITIES（不可違反）

### yau（Human Owner）

- Owns: product intent, priority, scope, acceptance, final decisions
- Approves: SPEC + PLAN（scope / acceptance 一經批准即具約束力）
- Reviews: Evidence Pack → 決定 APPROVED / CHANGES / ROLLBACK / PAUSE

### Claude（Chat · Strategy + Orchestration）

- Helps yau: 思考需求、挑戰假設、補 edge cases、設計驗收與風險
- Produces: SPEC、PLAN、Task Cards、Evidence Pack 整理、Session Handoff
- Runs: preflight checks、status tracking、risk flags
- Must: 將所有關鍵決策明確寫入 SPEC / PLAN（唔留腦內）
- Must NOT: 自行擴 scope、補需求、自行解釋歧義（unclear → 問 yau）
- Must: 每次 session 開始時檢查 HANDOFF.md（如存在）

### Claude Code（Coder / Runner）

- Owns: 編輯檔案、跑命令、貼 raw output
- Must NOT: 擴 scope、重構、升級依賴、改 DB schema（除非 SPEC / PLAN 明確寫明允許）
- 有歧義即停 → BLOCKED
- Must: 每次執行前讀取 CLAUDE.md 嘅 Common Mistakes section

---

## 1) SSOT + VERSIONING

### 檔案位置

| 檔案 | 用途 | 更新頻率 |
|------|------|----------|
| `/clawd/SPEC.md` | 需求 + 驗收 | per feature |
| `/clawd/PLAN.md` | 執行計劃 | per feature |
| `/clawd/CLAUDE.md` | 知識庫 + 規則 | continuous |
| `/clawd/HANDOFF.md` | Session context 傳遞 | per session end |

### Version 規則

- **Minor** (v1.1 → v1.2): wording、clarification、edge cases
- **Major** (v1.x → v2.0): scope 或 acceptance 改動
- 每次 bump 附 1 行 changelog

### 規則

- Claude Code 只可依 SSOT 行事
- 任何 scope / acceptance 改動 → 先更新 SPEC / PLAN 再執行
- 所有 Task Card 必須引用 SPEC vX / PLAN vX

---

## 2) PHASE A — DECISION

### 2.0 LIGHTWEIGHT MODE（XS batch）（NEW）

> 適用於：改 padding、換 copy、調 color、rename、加 tooltip 等唔影響 user flow / data / architecture 嘅改動

**觸發條件**（全部成立）：
- 唔涉及 user flow 改動
- 唔涉及 data / schema 改動
- 唔涉及新 API endpoint
- 唔涉及 architecture 或 dependency 改動
- 單次 batch ≤ 10 個改動

**流程**：

```
[XS BATCH]
Items:
  1. [file] — [change]
  2. [file] — [change]
  ...
Verify: build + lint + visual check
```

yau 回覆 `GO` → Claude Code 一次過執行 → verify → 完成。
任何一項觸及上述條件 → 升級為正常 feature 流程。

**XS 唔需要**：SPEC、PLAN、Task Card、Evidence Pack
**XS 需要**：verify pass + commit message 列出所有改動

### 2.1 SPEC TEMPLATE（S / M / L）

```
[SPEC vX]
TITLE:
PRIORITY: P0 / P1 / P2
SIZE: S / M / L
GOAL (1 sentence):
NON-GOALS (max 3):
USER FLOW (3–5 steps):
EDGE CASES: S=2-3 / M=4-5 / L=6+
ACCEPTANCE (verifiable checklist):
DATA / SCHEMA IMPACT: none | describe
DO NOT TOUCH (paths / systems):
CONSTRAINTS (time / cost / tech):
DEPENDS ON (feature / service, if any):
NOTES:
```

### 2.2 PLAN TEMPLATE

```
[PLAN vX]
SCOPE SUMMARY (in / out):
ASSUMPTIONS (explicit):
APPROACH (high-level):
TASK MAP (numbered):
  - ID:
  - Task name:
  - Allowed changes (UI / API / DB yes|no):
  - Files likely touched:
  - Shared files: [list → who owns edits]
  - Steps:
  - Verification commands:
  - Evidence required:
  - Depends on: T-XX | none
  - Time budget: S=15min / M=30min / L=60min
MODEL ROUTING:
  - ID → model + reason
  - S size 預設 Sonnet 全程；M/L 用 Sonnet draft + Opus review
RISK REGISTER (top 3–5 + mitigation):
SHARED FILE PROTOCOL: [shared files → owner task → others rebase]
ROLLBACK PLAN:
DEFINITION OF DONE (DoD):
```

### 2.3 DUAL-CLAUDE REVIEW（M/L size tasks）

1. **Session A**：寫 PLAN（Sonnet）
2. **Session B**：以 staff engineer 角色 review（Opus）

```
> Review this PLAN as a staff engineer.
> Review BOTH the SPEC and PLAN together.
> Challenge assumptions, flag risks, check for missing edge cases.
> Output: APPROVED / NEEDS CHANGES + numbered issues + suggestions
```

Session B output 列為 PLAN 附錄。最終決定權歸 yau。

### 2.4 APPROVAL（Binding）

- `APPROVED: SPEC vX + PLAN vX` → 可執行
- `APPROVED WITH NOTES: …` → 可執行但需注意
- 未批准 → Claude Code 不得執行

---

## 3) PHASE B — PREFLIGHT

> 全部通過先可進入 Phase C

| # | Check | Command / Action |
|---|-------|-----------------|
| P1 | Claude Code auth | `claude --print "ping"` |
| P2 | Repo runnable | `install` → `dev` → `test` |
| P3 | Git state | `branch` + `status` + record base SHA |
| P4 | Env / keys | 列出所需 env vars，確認齊全 |
| P5 | Session recovery | `cat /clawd/HANDOFF.md` → RESUME 或 DISCARD |
| P6 | Worktree setup | `git worktree add .claude/worktrees/feat-[title] origin/main` |
| P7 | Shell aliases | `za` / `zb` / `zc` → instant switching |

**Gate**：任一項 FAIL → STOP → BLOCKED

---

## 4) PHASE C — EXECUTION LOOP

> 原則：一次一張 Task Card｜最小 diff｜驗證先行

### 4.1 TASK CARD

```
[TASK CARD]
SPEC: vX / PLAN: vX
ID: / SIZE: S/M/L
TIME BUDGET: S=15min / M=30min / L=60min
Goal:
Do:
Do NOT:
Allowed changes:
Shared files: [if any, who owns]
Depends on: T-XX | none
Files:
Verification:
Evidence required:
Rollback step:
```

yau: `PROCEED` 或 `ADJUST: …`

### 4.2 IMPLEMENT

- 只做 Task Card 內容，不得超出 Allowed changes
- 有歧義即停 → BLOCKED
- Plan Mode（Shift+Tab）處理複雜改動
- Shared files：只有 owner task 可改；其他 rebase 吸收

### 4.3 VERIFY

```bash
npx tsc --noEmit && npx eslint . && npm test && npm run build && npm run dev
```

進階：

```
> Grill me on these changes and don't make a PR until I pass your test.
> Prove to me this works. Diff behavior between main and this feature branch.
```

### 4.4 EVIDENCE PACK

```
[EVIDENCE PACK]
Task ID:
Summary:
Files changed:
Key diff:
Commands run + raw output:
Evidence by type:
  - UI: preview URL（必須）+ screenshot（optional）
  - Logic/API: before / after test 或 curl output
  - DB: migration log + seed verification
Risks / notes:
Ready: Y / N
```

### 4.5 REVIEW GATE

| 回覆 | 動作 |
|------|------|
| `APPROVED` | 下一張 Task |
| `CHANGES: …` | 重做此 Task |
| `ROLLBACK` | 回退 + re-plan |
| `SCOPE CHANGE` | 回 Phase A |
| `PAUSE: [reason]` | 寫 HANDOFF.md → resume later |

---

## 5) FAILURE & ESCALATION

| Rule | 觸發 | 動作 |
|------|------|------|
| F1 | 同一 Task 連續 3 次 verify fail | (a) rollback + re-plan 或 (b) 拆細 |
| F1b | 超時（S=15m / M=30m / L=60m） | 觸發 F1 |
| F2 | 無法驗證 | Claude 提替代方案 → yau 批准 |
| F3 | 需要 refactor / deps / DB | 寫入 SPEC/PLAN → yau 批准 |
| F4 | 出現問題 | `Stop. Switch to plan mode. Re-analyze.` |
| F5 | Context 退化 | 見下方 signal list → trigger handoff |

### F5 Context 退化 signals（observable）（REVISED）

唔再用 80% threshold（難以人手判斷）。改為觀察以下 signals：

- Claude Code 開始 **repeat 已做過嘅步驟**
- Claude Code **漏咗 SPEC / PLAN 入面嘅條件**
- 回答質量明顯下降（**答非所問、忽略 edge case**）
- Claude Code **忘記之前 session 嘅決策**
- 要求 Claude Code 回顧之前嘅 context 時 **答唔出**

任何一個 signal 出現 → 立即 `/handoff` → 開新 session → `/resume`

---

## 6) PHASE D — DOCUMENTATION

### 6.1 即時更新

每次 Claude Code 犯錯：`> Update your CLAUDE.md so you don't make that mistake again.`

### 6.2 Feature 完成後

Claude 回答：`Update CLAUDE.md? Yes / No + 1 sentence reason`

```
[CLAUDE.md UPDATE]
Decision:
Context:
Chosen approach:
Rejected alternatives:
How to verify:
Pitfalls:
```

### 6.3 CLAUDE.md 結構

```markdown
# Project: [name]
## Architecture
## Patterns & Conventions
## Common Mistakes (Claude 踩過嘅坑)
## Commands
## Do NOT
```

### 6.4 SESSION HANDOFF

每次 session 結束 / PAUSE / context 退化時更新：

```
[SESSION HANDOFF]
Timestamp:
Phase: A / B / C / D
Current task: T-XX (in-progress / blocked / paused)
Last completed: T-XX
Pending: T-XX, T-XX
Key context (max 3 sentences):
Resume instruction: [exact next step]
Read: SPEC vX, PLAN vX, CLAUDE.md
```

位置：`/clawd/HANDOFF.md`（resume 後清空）

---

## 7) HOTFIX FAST PATH

若 yau 標記 `[HOTFIX]`：

| Level | 描述 | 流程 |
|-------|------|------|
| H1 | Production down | 即時 fix → verify → deploy → 補 SPEC |
| H2 | Feature broken | Fix → verify → Evidence Pack → 補 SPEC |
| H3 | Minor bug | Fix → 可併入下次正常 deploy |

```bash
> fix this https://slack.com/archives/C07VBSH.../p1234567890
> Go fix the failing CI tests.
```

唔使 micromanage — 俾 Claude 自己決定點 fix。

---

## 8) PARALLEL MODE（Git Worktrees）

### Setup

```bash
git worktree add .claude/worktrees/task-a origin/main
git worktree add .claude/worktrees/task-b origin/main
# analysis worktree（read-only）
git worktree add .claude/worktrees/analysis origin/main
```

### 並行條件

- 每個 task 獨立 worktree
- Shared files 遵循下方 protocol
- merge 前 + 後都要 verify

### SHARED FILE PROTOCOL

| 類型 | 例子 | 規則 |
|------|------|------|
| Type defs | `types.ts` | 1 個 worktree 改，其他 rebase |
| Config | `.env`, `next.config.js` | PLAN 寫明 + yau 批准 |
| Shared utils | `lib/utils.ts` | 新增 OK，改 existing → 指定 owner |
| Package | `package.json` | 只可加依賴，唔可刪/升級 |

### Merge priority

先 merge 者優先。後 merge 者 rebase 後 verify fail → 自行 fix。
禁止為咗追 merge 放寬 verify。Correctness 永遠優先。

---

## 9) SUBAGENTS（大型 task）

```bash
> Explore the codebase structure and summarize the key modules. Use subagents.
> Offload: analyze all test files and report coverage gaps. Use a subagent.
```

Subagent 完成後輸出：

```
[SUBAGENT REPORT]
Task: / Findings: / Files examined: / Recommendations:
```

主 agent 摘要入 Evidence Pack 或 CLAUDE.md。

---

## 10) CUSTOM COMMANDS

| Command | 用途 |
|---------|------|
| `/verify` | 一次過跑所有 checks |
| `/status` | 當前 task progress |
| `/techdebt` | session 尾搵 duplicated code / unused imports |
| `/handoff` | 生成 HANDOFF.md |
| `/resume` | 讀取 HANDOFF.md 恢復 context |

```
.claude/
├── commands/   (techdebt / verify / status / handoff / resume)
├── skills/     (prisma / testing / ...)
└── worktrees/  (task-a / task-b / analysis)
```

---

## 11) MODEL ROUTING

| 情境 | Model | 原因 |
|------|-------|------|
| XS batch | Sonnet | 唔需要深度推理 |
| S feature 全程 | Sonnet | Cost-efficient，足夠應付 |
| M/L — draft | Sonnet | 初稿唔需要 Opus |
| M/L — review / risk | Opus | 需要深度推理 + 挑戰假設 |
| Execution | Claude Code | 編輯 + 跑命令 |
| Complex review | Opus（subagent） | Architecture / DB / security |

有 architectural risk 時，S size 都可以升 Opus。

---

## 12) QUALITY GATES

| Gate | 位置 | Pass | Fail |
|------|------|------|------|
| G1 Approval | Phase A end | APPROVED | 唔可進 Phase B |
| G2 Preflight | Phase B end | All pass | BLOCKED |
| G3 Proceed | §4.1 | PROCEED | ADJUST |
| G4 Verify | §4.3 | All pass | ≤3 retry；>3 → F1 |
| G5 Evidence | §4.5 | APPROVED | CHANGES / ROLLBACK / PAUSE |
| G6 Merge | §8 | rebase + verify | 後 merge 者 fix |
| G7 Docs | Phase D | Updated | yau 提醒 |

---

## QUICK REFERENCE

```
XS BATCH:   GO → execute all → verify → commit（無需 SPEC/PLAN）

FEATURE:    Phase A (SPEC+PLAN+APPROVE)
            → Phase B (preflight)
            → Phase C (task card → implement → verify → evidence → review)
            → Phase D (CLAUDE.md + HANDOFF)

HOTFIX:     H1 production down → immediate fix → verify → deploy → 補 SPEC
            H2 feature broken → fix → evidence → 補 SPEC
            H3 minor → fix → batch deploy

PARALLEL:   worktrees → shared file protocol → verify → merge (先到先得)

SESSION:    /handoff → HANDOFF.md → new session → /resume
            context 退化 signals → auto handoff
```

---

## V4 → V5 CHANGELOG

| # | 改動 | 原因 |
|---|------|------|
| 1 | 加 Quick Start decision tree | 736 行太長，需要即時導航 |
| 2 | 新增 XS Lightweight Mode（§2.0） | 「改 5 個 button padding」唔值得寫 SPEC |
| 3 | 刪除 COST-LOG.md | 手動填 token usage 唔實際，overhead > value |
| 4 | F5 改為 observable signals | 80% threshold 難以人手判斷 |
| 5 | Preflight 改為 table format | 壓縮行數，保留所有資訊 |
| 6 | Failure rules 改為 table format | 同上 |
| 7 | Terminal & Environment section 刪除 | 屬個人偏好，唔係 workflow 核心 |
| 8 | 全文從 ~736 行壓縮至 ~420 行 | 可讀性 + 日常參考速度 |
