# IA Freeze (v1) — hk-marketplace (single-tenant merchant site)

Scope: Admin IA only. Goal: freeze navigation + page sectioning so UI/UX can iterate without breaking structure.

## Admin Navigation (fixed)
1) Orders
2) Products
3) Settings

Routes:
- /[locale]/admin/orders
- /[locale]/admin/products
- /[locale]/admin/settings

## Orders (Admin)

### Orders List (/admin/orders)
Primary table columns (left → right):
1) Order ID (short) / createdAt
2) Status
3) Total (amounts.total + currency)
4) Fulfillment type (PICKUP/DELIVERY)
5) Customer (name/phone/email if exists)
6) Last updatedAt

Table defaults:
- Default sort: createdAt desc
- Default filter: status=ALL
- Quick filters: PENDING, PAID, FULFILLING, SHIPPED, COMPLETED, CANCELLED

Row actions:
- Click row → Order Detail

### Order Detail (/admin/orders/{id})
Sections (top → bottom):

A) Summary (above the fold)
- Order ID, createdAt, current Status
- Total + currency
- Fulfillment type
- Primary action: Update status

B) Customer & Fulfillment
- Customer: name/phone/email
- If DELIVERY: address (line1, district), notes
- If PICKUP: pickup notes/time if any

C) Items & Notes
- Line items: product name, qty, unit price, line total
- Order note

D) Timeline (optional now, reserved)
- createdAt / updatedAt
- status changes (future)

Status update rules:
- Allowed statuses: PENDING, PAID, FULFILLING, SHIPPED, COMPLETED, CANCELLED, REFUNDED, DISPUTED
- Invalid status → 400 BAD_REQUEST (API already enforced)

## Products (Admin)
### Products List (/admin/products)
- Table: name, price, availability, updatedAt
- Primary action: create/edit product (existing behavior)

## Settings (Admin)
### Settings (/admin/settings)
Fixed sections:
1) Store Profile (name, contact)
2) Payments (future placeholder)
3) Fulfillment/Shipping (future placeholder)
4) Admin/Secrets usage notes (no NEXT_PUBLIC secrets)
