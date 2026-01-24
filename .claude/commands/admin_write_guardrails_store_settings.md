TITLE: admin_write_guardrails_store_settings
GOAL:
- 建立可重用 guardrails：RBAC + audit + request-id + idempotency（MVP）
- 並把 PUT /api/store-settings 套上 guardrails（最細可驗收 demo）

FILES TO READ FIRST:
- app/api/store-settings/route.ts OR src/app/api/store-settings/route.ts
- existing auth/rbac utilities (search: rbac role auth permission)

IMPLEMENTATION RULES:
- 只加 lib/guardrails.ts、lib/audit.ts（如不存在）
- RBAC 先用 header x-admin-token 作 stub（無則 401/403 + 統一 JSON error）
- 每個回應帶 x-request-id
- 支援 Idempotency-Key（MVP 用 in-memory Map 存 status+body）
- audit 先 console.log(JSON)

STEPS:
1) 判斷 app dir（app/ or src/app/）
2) 新增 lib/audit.ts（auditLog）
3) 新增 lib/guardrails.ts（getRequestId/jsonError/requireAdmin/withIdempotency/wrapAdminWrite）
4) 修改 store-settings route.ts：PUT 用 wrapAdminWrite + withIdempotency；GET 不改或只補 x-request-id
5) 確保 response 統一 JSON error shape：{ error: { code, message, requestId } }

ACCEPTANCE COMMANDS:
- npm run build
- curl -i http://localhost:3012/api/store-settings
- curl -i -X PUT http://localhost:3012/api/store-settings -H "content-type: application/json" -d "{}"
- curl -i -X PUT http://localhost:3012/api/store-settings -H "content-type: application/json" -H "x-admin-token: dev" -H "Idempotency-Key: demo1" -d "{\"storeName\":\"X\"}"
- curl -i -X PUT http://localhost:3012/api/store-settings -H "content-type: application/json" -H "x-admin-token: dev" -H "Idempotency-Key: demo1" -d "{\"storeName\":\"Y\"}"
EXPECTED:
- 無 token：401/403 + JSON error + x-request-id
- 有 token：成功 + x-request-id
- 同一 Idempotency-Key 第二次 replay（body/status 不變或至少不重覆寫）
