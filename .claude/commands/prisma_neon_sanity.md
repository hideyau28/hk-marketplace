TITLE: prisma_neon_sanity
GOAL:
- 穩定化 Prisma 7 + Neon：
  - 檢查 DATABASE_URL 是否 pooler（含 -pooler）
  - migrate 用 Direct（無 -pooler）
  - 跑 validate + generate（必要時 migrate）
  - 修復 ".prisma/client/default" missing

RULES:
- 建議兩個 env：
  - DATABASE_URL（runtime）
  - DATABASE_URL_DIRECT（migrate 專用，必須無 -pooler）

STEPS:
1) 檢查 .env / .env.local：DATABASE_URL 是否存在
2) 如 DATABASE_URL 含 -pooler：提示必須提供 DATABASE_URL_DIRECT
3) 確保 Prisma CLI 讀到 migrate 用的 direct：
- 若你只想保留 .env.local 作 runtime，CLI 專用的 direct 寫入 .env
4) 跑：
- npx prisma validate
- npx prisma generate
5) 若 DATABASE_URL_DIRECT 存在，跑：
- DATABASE_URL=$DATABASE_URL_DIRECT npx prisma migrate dev --name init

ACCEPTANCE COMMANDS:
- npx prisma -v
- npx prisma validate
- npx prisma generate
