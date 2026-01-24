TITLE: admin_table_page_scaffold
GOAL:
- 生成 Shopify-like Admin table page（filters + table + pagination + bulk actions）
- 支援 [locale] route
- 沿用你現有 Tailwind 風格與 layout spacing

INPUTS:
- module: e.g. inventory, customers, refunds, webhooks, audit-logs
- route: e.g. [locale]/admin/inventory
- columns: list
- mock rows source: lib/mock or inline

STEPS:
1) 定位 app dir（app/ or src/app/）
2) 建立 page.tsx 到對應路徑
3) 若 repo 有 getDict/i18n，使用它；否則最小 stub（避免阻塞）
4) 不用正則硬插 TopNav；只在命令回覆中提示需要手動加 link 或用較安全方式改

ACCEPTANCE COMMANDS:
- npm run build
