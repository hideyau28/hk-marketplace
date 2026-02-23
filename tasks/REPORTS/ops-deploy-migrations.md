# ops/deploy-migrations

## Goal
Add a deployment guide for Prisma migrations and a helper script.

## Files changed
- RUNBOOK.md: Added “Deploying with Prisma migrations” section
- package.json: Added db:migrate:deploy script

## How to deploy
1) Ensure DATABASE_URL is set in production.
2) Backup DB.
3) Run: npm run db:migrate:deploy (or npx prisma migrate deploy)

## Notes
- migrate deploy is safe to run multiple times; it only applies pending migrations.
