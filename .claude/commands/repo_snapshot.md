TITLE: repo_snapshot
GOAL:
- 生成 REPO_SNAPSHOT.md：列出 repo 結構、技術棧、路由/API、DB/Prisma 狀態、已做/未做核心、風險缺口。

STEPS:
1) 確認 repo root（package.json 所在）。
2) 掃描技術棧與 scripts：讀 package.json、next.config.*、tsconfig.json；記錄 Node/Next/TS/Tailwind/Prisma 版本與 scripts。
3) 掃描 routing（App Router）：列出 app/ 或 src/app/ 下所有 page.tsx、layout.tsx、route.ts；標記 [locale]、admin pages、api routes。
4) 掃描 DB/Prisma：是否存在 prisma/schema.prisma、prisma.config.ts、migrations；檢查 Prisma 7 config；檢查 .env / .env.local 是否有 DATABASE_URL / DATABASE_URL_DIRECT；檢測 Neon pooler（host 含 -pooler）。
5) 掃描關鍵字（ripgrep）：rbac/role/auth/permission、audit/audit_log、idempotency、tenant/shop/store scope、webhook/signature/retry、orders/inventory/payment/checkout。
6) 輸出 REPO_SNAPSHOT.md（可 commit），格式固定：Overview、Stack & Tooling、Routes、API、Data Layer、Done/Not Done matrix、Risks & Gaps、Recommended next cuts。

ACCEPTANCE COMMANDS:
- npm run build
OUTPUT:
- REPO_SNAPSHOT.md
