TITLE: api_route_scaffold
GOAL:
- 新增 App Router API route 標準骨架：統一錯誤格式 + x-request-id + 可選 admin guard + runtime=nodejs。

INPUTS:
- route: app/api/<path>/route.ts
- methods: GET/POST/PUT/DELETE
- require_admin: true/false

STEPS:
1) 判斷 app dir（app/ or src/app/）
2) 建立 route.ts skeleton（runtime=nodejs、try/catch、JSON error shape、requestId helper）
3) require_admin=true 時呼叫 requireAdmin（若已存在 lib/guardrails.ts）
4) 留 TODO 驗參位（不強制引入新依賴）

ACCEPTANCE COMMANDS:
- npm run build
