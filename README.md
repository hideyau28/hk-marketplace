# hk-marketplace

Single-tenant marketplace template (Next.js + Prisma + Postgres) with:
- Orders + admin dashboard
- Stripe Checkout + webhook to update order status

## Local dev (recommended)

1) Create `.env.local` from `.env.example`
2) Start app:

```bash
npm run dev
# http://localhost:3012
```

### Stripe (optional)

Terminal A:
```bash
npm run dev
```

Terminal B (webhook forward to local):
```bash
npm run stripe:listen
```

The Stripe CLI prints a `whsec_...` signing secret. Put it into `.env.local` as:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Smoke-test webhook delivery:
```bash
npm run stripe:trigger:checkout
```

## Config notes

- Never commit `.env.local` (repo ignores `.env*` except `.env.example`).
- Set `APP_URL` (e.g. `http://localhost:3012` in dev, `https://your-domain` in prod) so Stripe success/cancel URLs are always correct.
