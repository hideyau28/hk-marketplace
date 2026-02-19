# Wowlix — Claude Code Task Protocol V2

> 放喺 repo `CLAUDE.md` 或 `docs/claude-code-protocol.md`。
> Claude Code 每次開 session 自動讀 `CLAUDE.md`。

---

## 📐 Task 結構

每個 Task 包含 5 個部分：

| 部分 | 說明 |
|------|------|
| **Model** | `OPUS`（複雜/多檔案/routing）或 `SONNET`（直接/單一邏輯）|
| **問題描述** | 現狀 vs 預期，附截圖或 error log |
| **改動範圍** | 列明要改嘅檔案同方向 |
| **Smoke Test** | 自動驗證 script，隨 code commit |
| **Output** | `BRANCH` / `PR` / `STATUS` 三行 |

---

## 🔁 執行流程

```
┌─────────────────────────────┐
│  git checkout main          │
│  git pull                   │
│  git checkout -b <branch>   │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│  做改動                      │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│  npm run ci:build            │
│  Build fail → 修到 pass      │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│  npm run dev &               │
│  sleep 15                    │
│  node scripts/smoke-test-*.js│
└──────────┬──────────────────┘
           ↓
      ┌────┴────┐
      │ PASS?   │
      └────┬────┘
     ✅    │    ❌
     │     │    ↓
     │     │  修 code → 重跑
     │     │  （最多 3 次）
     │     │    ↓
     │     │  第 3 次仲 fail？
     │     │    ↓
     │     │  停止修改，照 push
     │     │  PR body 寫明：
     │     │  - 邊個 test fail
     │     │  - 試過咩修法
     │     │  STATUS=FAIL
     ↓     
┌─────────────────────────────┐
│  git add -A                  │
│  git commit -m "<message>"   │
│  git push -u origin <branch> │
│  gh pr create ...            │
│  （如果 gh CLI 冇，print     │
│   branch name 叫人手開 PR）   │
└──────────┬──────────────────┘
           ↓
┌─────────────────────────────┐
│  print:                      │
│  BRANCH=<branch name>        │
│  PR=<PR number 或 N/A>       │
│  STATUS=OPEN / FAIL          │
└─────────────────────────────┘
```

---

## 🔍 Plan Mode

有時唔應該直接改 code，應該先分析。

### 幾時用 Plan Mode
- 上次 fix 引發新 bug（例如修 A 壞 B）
- 唔確定實際 code 結構，靠猜會出事
- 涉及 3+ 檔案互動，唔知邊個影響邊個
- 第一次接觸呢個 codebase 嘅區域

### 幾時唔使 Plan
- Root cause 清楚，改邊個檔案都知
- 跟住現有 pattern 加嘢
- 之前做過類似嘅改動

### Plan Mode Prompt Template
```
Plan mode — 唔好改任何 code，只分析同回報。

[描述問題]

請分析以下檔案，回報：
1. [檔案 1] — [要了解咩]
2. [檔案 2] — [要了解咩]
3. grep -r "[關鍵字]" --include="*.ts" --include="*.tsx" app/ lib/

回報格式：
- 每個檔案列出關鍵 code snippet
- 標明邊度係問題所在
- 建議修法（但唔好執行）
```

---

## ‼️ 規則

### Output（每個 Task 必須）
```
BRANCH=<branch name>
PR=<PR number 或 N/A>
STATUS=<OPEN/FAIL>
```

- `OPEN` = build pass + smoke test 全部 ✅
- `FAIL` = smoke test 重試 3 次仲有 fail
- `N/A` = gh CLI 唔 work，已 push branch，需要人手開 PR
- **永遠唔好自己 merge PR。等人 review。**

### Smoke Test 重試上限
- **最多 3 次**
- 每次 fail → 讀 error → 修 code → kill dev server → 重開 → 重跑
- 第 3 次仲 fail → **停止修改**，照 push 現有 code
- PR body 寫明邊個 test fail 同試過嘅修法

### Smoke Test Script
- 放喺 `scripts/smoke-test-<task-name>.js`
- 隨 code 一齊 commit（之後可重用做 regression）
- Exit code: `0` = 全部 pass，`1` = 有 fail

### Dev Server 管理
```bash
# 開
npm run dev &
DEV_PID=$!
sleep 15

# 跑 test
node scripts/smoke-test-<task>.js
TEST_EXIT=$?

# 關
kill $DEV_PID

# 判斷
if [ $TEST_EXIT -ne 0 ]; then
  echo "❌ Attempt N/3 failed"
fi
```

---

## 🏷️ Model 分配指引

| 用 OPUS | 用 SONNET |
|---------|-----------|
| 涉及 3+ 檔案互動 | 改 1-2 個檔案 |
| Routing / middleware / layout | 加 guard / validation |
| 需要理解 request flow | 邏輯明確，有明確 pattern |
| 修 bug 但 root cause 唔確定 | Root cause 已知，要 implement fix |
| 新架構 / 新 pattern | 跟住現有 pattern 加嘢 |
| 上次 fix 搞壞嘢，要小心改 | UI 文案 / 樣式調整 |

---

## 📝 Smoke Test Template

### ⚠️ 重要：Strip `<script>` tags
Next.js 會將所有 page 嘅文字放入 JS bundle。
Check HTML content 時必須先移除 `<script>` tags，否則會 false positive。

```javascript
// scripts/smoke-test-<task>.js
const BASE = 'http://localhost:3000';

const tests = [
  {
    name: '描述',
    url: `${BASE}/path`,
    shouldContain: ['keyword1', 'keyword2'],     // 至少 match 一個 = pass
    shouldNotContain: ['unwanted1', 'unwanted2'], // 任何一個 match = fail
    expectStatus: null,                           // optional: check HTTP status
  },
];

// 移除 <script> tags，避免 JS bundle 造成 false positive
function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

async function run() {
  let passed = 0, failed = 0;

  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: 'follow' });

      // Status check
      if (t.expectStatus && !t.expectStatus.includes(res.status)) {
        console.log(`❌ ${t.name} — status ${res.status}`);
        failed++;
        continue;
      }

      const rawHtml = await res.text();
      const html = stripScripts(rawHtml).toLowerCase();
      let ok = true;
      const errs = [];

      if (t.shouldContain) {
        const found = t.shouldContain.some(s => html.includes(s.toLowerCase()));
        if (!found) { ok = false; errs.push(`Missing all of: ${t.shouldContain.join(', ')}`); }
      }

      if (t.shouldNotContain) {
        for (const s of t.shouldNotContain) {
          if (html.includes(s.toLowerCase())) {
            ok = false;
            errs.push(`Should NOT contain: "${s}"`);
          }
        }
      }

      if (ok) { console.log(`✅ ${t.name}`); passed++; }
      else { console.log(`❌ ${t.name}`); errs.forEach(e => console.log(`   → ${e}`)); failed++; }
    } catch (err) {
      console.log(`❌ ${t.name} — ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
```

### Dev 環境限制
- 冇真實 DB → slug route 會 404 → 唔好依賴 DB data 做 assertion
- 主要測 routing 同 render 邏輯，唔好測 data content
- 如果 test 因為冇 DB 而 fail，喺 PR body 寫明屬於 expected dev limitation

---

## 🚨 Regression 防護

每次改動嘅 smoke test **必須包含以下 baseline routes**，確保唔會修一個壞另一個：

```javascript
const BASELINE = [
  { name: '/en → 唔 500', url: `${BASE}/en`, expectStatus: [200, 307, 302] },
  { name: '/en/admin → 唔 500', url: `${BASE}/en/admin`, expectStatus: [200, 307, 302] },
  { name: '/en/start → 唔 500', url: `${BASE}/en/start`, expectStatus: [200, 307, 302] },
];

// 將 BASELINE 加入每個 smoke test 嘅 tests array
```

---

## 🔙 出事點算（Rollback）

### Fix 搞壞其他嘢
1. 去 GitHub → Pull Requests → Closed → 搵啱啱 merge 嘅 PR
2. 撳入去 → 捲到底 → 撳 **「Revert」**
3. Create revert PR → **Squash and merge**
4. 等 Vercel deploy（1-2 分鐘）
5. 用無痕驗證恢復正常
6. 用 **Plan Mode** 分析點解上次會壞，再出修正版 Task

### Vercel Deploy 問題
- Deploy 後 500 → 先check Vercel Dashboard → Runtime Logs
- `DYNAMIC_SERVER_USAGE` error → 有 component 喺 static render 用 `headers()`
  - 修法 A：加 `export const dynamic = 'force-dynamic'`
  - 修法 B：try-catch wrap `headers()` call
- Build pass 但 runtime 500 → 可能係 Vercel cache
  - Vercel Dashboard → Deployments → Redeploy（clear cache）

---

## 🧹 DB 操作

### Prisma CLI 唔 work
P1013 error — 所有 DB 改動用 **Neon SQL Editor** 手動跑。

### 測試 Tenant 清理
```sql
-- 搵出所有 tenant
SELECT id, slug, mode, "createdAt" FROM "Tenant";

-- 刪除測試 tenant（保留 maysshop + yy3）
DELETE FROM "Tenant" WHERE slug = '<test-slug>';
```

### 常用 DB 操作
```sql
-- 改 tenant mode
UPDATE "Tenant" SET mode = 'biolink' WHERE slug = '<slug>';

-- 查 tenant 詳情
SELECT * FROM "Tenant" WHERE slug = '<slug>';
```

---

## 🔐 已知環境限制

| 限制 | 影響 | Workaround |
|------|------|-----------|
| Prisma CLI P1013 | 唔可以 `prisma db push` | Neon SQL Editor |
| `gh` CLI 可能冇 | 唔可以自動開 PR | Push branch → 人手開 PR |
| Dev 環境冇 DB | Slug routes 404 | 唔測 data content，只測 routing |
| GitHub OAuth `gho_*` 唔 work | Auth fail | 用 PAT token `ghp_*` |

---

## 📋 Task Package Template

```markdown
## 🔴/🟡/🟢 Task X — 標題（MODEL）

**問題：** 一句描述

**現狀：** 而家發生咩事
**預期：** 應該係點

**需要改嘅檔案：**
1. `path/to/file.ts` — 改咩
2. `path/to/file2.ts` — 改咩

**⚠️ 唔好改：**
- 列明唔好掂嘅檔案/設定

**Smoke Test：** `scripts/smoke-test-<n>.js`
- ✅ /path → 預期結果
- ✅ /path2 → 預期結果
- ❌ /path3 → 唔應該出現嘅嘢

（自動包含 baseline routes 防 regression）
```

---

## 📊 Task 優先度標記

| 標記 | 意思 | 例子 |
|------|------|------|
| 🔴 | Blocking — 唔修就冇辦法繼續 | Landing page 顯示錯誤 |
| 🟡 | Important — 要修但唔 block | Admin mode guard |
| 🟢 | Nice to have — 有時間先做 | A11y 改善 |

---

## ⚡ 多 Task 執行

### 順序規則
- 🔴 tasks 先做
- 涉及相同檔案嘅 tasks → 順序做（避免 conflict）
- 互不相關嘅 tasks → 可以平行做
- 每個 task merge 後先開始下一個（除非明確標明可平行）

### Task 之間嘅依賴
```
Task A（merge 後）→ Task B（基於 A 嘅 code）
Task C（獨立）→ 可以同 A 平行
```

---

## 🗂️ 工作流程總覽

```
claude.ai                    Claude Code                 GitHub
  │                              │                          │
  ├── Plan Mode ──────────────→  │ 分析 code                │
  │   （如需要）                  │ 回報結果                  │
  │ ←─────────────────────────── │                          │
  │                              │                          │
  ├── Task Package ───────────→  │ 改 code                  │
  │                              │ build                    │
  │                              │ smoke test               │
  │                              │ push branch ──────────→  │
  │                              │                          │
  │ ←── BRANCH/PR/STATUS ─────  │                          │
  │                              │                          │
  ├── Review ─────────────────────────────────────────────→ │ merge PR
  │                              │                          │ Vercel deploy
  │                              │                          │
  ├── 無痕驗證 ←───────────────────────────────────────────  │
  │                              │                          │
  │   如果壞咗 → Revert PR ──────────────────────────────→  │
  │              Plan Mode → 修正版 Task                    │
  └──────────────────────────────────────────────────────────┘
```

---

## 🎯 品牌 / 項目 Context

```
產品名：  Wowlix
域名：    wowlix.com
公司：    Flow Studio HK (flowstudiohk.com)
品牌色：  #FF9500（亮橙）
Stack：   Next.js / Prisma / Neon PostgreSQL / Vercel
Repo：    hideyau28/hk-marketplace
兩個產品：Bio Link（Free/$38/$79）+ Full Store（$199+）
```

---

*Protocol V2 — 最後更新：2026-02-13*
