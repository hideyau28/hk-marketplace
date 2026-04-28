# STATUS — hk-marketplace

Updated: 2026-04-28

> Multi-tenant HK IG / WhatsApp 小店 + biolink SaaS. See `README.md` for overview.

---

## ✅ Recently completed (last ~30 days)

- **Admin product list**: auto-refresh after adding new product (#344)
- **Checkout / confirmation**: trust signals (#343)
- **Checkout flow**: order-first, pay-later — proof upload on confirmation page (#342)
- **Biolink**: social icons drag-reorder + multi-platform `socialLinks` Json field (#341)
- **Auth**: rate limiting on send-otp endpoint (#340)
- **Tenant admin**: forgot/reset password flow (#339)
- **Onboarding wizard**: WhatsApp dial code + international format (+852…) (#332–#336)

---

## 🚧 In progress

- `socialLinks` propagation to all read paths (`[slug]/page.tsx`, `lib/biolink-helpers.ts`, `lib/get-tenant-info.ts`, `prisma/schema.prisma`) — schema + helpers updated, migration + admin form + render still pending

---

## NEXT

_(empty — define when picking up next task)_
