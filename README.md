# hk-marketplace — HK IG / WhatsApp 小店 + Biolink SaaS

A multi-tenant SaaS platform that gives Hong Kong sellers an IG-bio-friendly storefront, a WhatsApp-driven checkout, and a full merchant admin — all under one slug like `/[shop]`. Each tenant gets a biolink page, a product catalog, and HK-local payment options (FPS, PayMe, Stripe).

## 🚀 Features

### Buyer-facing (per tenant `/[slug]`)
- **Biolink Page**: Branded landing with cover, logo, brand color, social links (IG, WhatsApp, drag-reorderable multi-platform icons)
- **Product Catalog**: Browse with category / brand / stock filters; supports single + dual-axis variants (e.g. colour × size)
- **Shopping Cart**: Persistent, variant-aware
- **Order-first Checkout**: Place order, then upload payment proof on the confirmation page (FPS / PayMe / bank transfer flows)
- **Stripe Checkout**: Optional card payment for tenants that connect Stripe
- **Order Tracking**: Status + fulfillment timestamps, WhatsApp follow-up template
- **Trust Signals**: Configurable badges on checkout / confirmation pages
- **Wishlist + Search**
- **i18n**: Traditional Chinese (zh-HK) + English
- **Mobile-first PWA**: Bottom nav, offline shell, opt-in push notifications
- **Dark mode**: Light / dark / system

### Merchant admin (per tenant `/admin`)
- **Onboarding Wizard** (`/start`): Tenant signup, WhatsApp / dial code, FPS, plan selection
- **Product Management**: CRUD, bulk CSV import/export, dual-variant editor
- **Order Management**: Status transitions with timestamps (PENDING → PAID → FULFILLING → SHIPPED → COMPLETED), payment-attempt history
- **Inventory Control**: Per-variant stock
- **Coupons**: % and fixed-amount codes
- **Receipts**: PDF generation
- **Storefront Settings**: Brand colour, cover template, hero, social links, delivery options, free-shipping threshold, order-confirm message
- **Audit Log**: All admin actions tracked
- **Auth**: Basic Auth + tenant-admin OTP / Google OAuth + forgot-password flow

### Multi-tenant / SaaS
- **Tenant Model**: Slug-based routing (`/[slug]`), optional custom domain
- **Plans + Billing**: Stripe subscription (free / paid tiers, trial, grace period)
- **Stripe Connect**: Tenants connect their own Stripe account for card payments
- **HK-local Payments**: FPS (account + QR), PayMe (link + QR)
- **Templates**: Biolink template engine (default: `mochi`)
- **Branding Hide**: Per-plan toggle for "Powered by" branding

### Technical Features
- **Analytics**: Google Analytics 4 and Meta Pixel integration
- **SEO Optimized**: Dynamic sitemaps, metadata, and robots.txt
- **Rate Limiting**: Protection against brute-force attacks
- **Webhook Handling**: Automatic order status updates from Stripe
- **Idempotency**: Duplicate request prevention
- **Type Safety**: Full TypeScript coverage
- **Database**: PostgreSQL with Prisma ORM
- **Image Optimization**: Next.js Image with Cloudinary CDN

## 🛠 Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL
- **ORM**: Prisma 7.3
- **Payments**: Stripe
- **Images**: Cloudinary
- **Icons**: Lucide React
- **Analytics**: Google Analytics 4, Meta Pixel
- **Deployment**: Vercel (recommended)

## 📦 Installation

### Prerequisites
- Node.js 20+ (LTS recommended)
- PostgreSQL 14+
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hk-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration:
   ```bash
   # Required
   DATABASE_URL=postgresql://user:password@localhost:5432/hk_marketplace
   ADMIN_SECRET=your-secret-key

   # Optional - Stripe (for payments)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Optional - Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Optional - Analytics
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_META_PIXEL_ID=123456789

   # Base URL (required for production)
   APP_URL=http://localhost:3012
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate deploy

   # Seed sample products (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3012](http://localhost:3012)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server on port 3012
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample products
- `npm run smoke:local` - Run smoke tests

### Stripe Webhook Testing (Local)

Terminal 1:
```bash
npm run dev
```

Terminal 2:
```bash
npm run stripe:listen
```

Copy the `whsec_...` webhook secret to `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

Test webhook delivery:
```bash
npm run stripe:trigger:checkout
```

### Admin Access

- **URL**: `/en/admin` or `/zh-HK/admin`
- **Default Login**: Basic Auth with `ADMIN_BASIC_USER` / `ADMIN_BASIC_PASS` from `.env.local`
- **Admin Secret**: Required for API requests (set `ADMIN_SECRET` in `.env.local`)

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm i -g vercel
   vercel
   ```

2. **Set environment variables in Vercel Dashboard**
   - `DATABASE_URL`
   - `ADMIN_SECRET`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `CLOUDINARY_*` (optional)
   - `NEXT_PUBLIC_GA_ID` (optional)
   - `NEXT_PUBLIC_META_PIXEL_ID` (optional)
   - `APP_URL` (e.g., `https://your-domain.vercel.app`)

3. **Run database migrations**
   ```bash
   vercel env pull .env.production
   DATABASE_URL=<your-production-db> npx prisma migrate deploy
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Database Requirements

- PostgreSQL 14+ (recommended)
- Connection pooling enabled (PgBouncer or Prisma Accelerate)
- SSL mode required for production

### Post-Deployment

1. **Set up Stripe webhook** in production:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.*`
   - Copy signing secret to `STRIPE_WEBHOOK_SECRET`

2. **Seed initial data** (if needed):
   ```bash
   npm run db:seed
   ```

3. **Configure admin credentials**:
   - Set `ADMIN_SECRET` to a strong random value
   - Set `ADMIN_BASIC_USER` and `ADMIN_BASIC_PASS` for Basic Auth

## 📚 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_SECRET` | ✅ | Secret key for admin authentication | `random-secure-string` |
| `ADMIN_BASIC_USER` | ⚠️ | Basic Auth username (defaults to "admin") | `admin` |
| `ADMIN_BASIC_PASS` | ⚠️ | Basic Auth password (defaults to `ADMIN_SECRET`) | `secure-password` |
| `STRIPE_SECRET_KEY` | ⚠️ | Stripe secret key | `sk_test_...` |
| `STRIPE_PUBLISHABLE_KEY` | ⚠️ | Stripe publishable key | `pk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | ⚠️ | Stripe webhook signing secret | `whsec_...` |
| `CLOUDINARY_CLOUD_NAME` | ⚠️ | Cloudinary cloud name | `your-cloud` |
| `CLOUDINARY_API_KEY` | ⚠️ | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | ⚠️ | Cloudinary API secret | `abcdef123` |
| `NEXT_PUBLIC_GA_ID` | ❌ | Google Analytics 4 Measurement ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_META_PIXEL_ID` | ❌ | Meta Pixel ID | `123456789` |
| `APP_URL` | ⚠️ | Base URL for the app | `https://your-domain.com` |

✅ = Required | ⚠️ = Optional but recommended | ❌ = Optional

## 🏗 Project Structure

```
hk-marketplace/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-based routing (en, zh-HK)
│   │   ├── (admin)/         # Tenant admin dashboard
│   │   ├── (customer)/      # Buyer-facing routes (cart, checkout, orders, etc.)
│   │   ├── (marketing)/     # Public marketing pages (pricing, etc.)
│   │   ├── [slug]/          # Per-tenant biolink storefront entry
│   │   └── start/           # Tenant onboarding wizard
│   ├── api/                 # API routes
│   ├── robots.ts            # Dynamic robots.txt
│   └── sitemap.ts           # Dynamic sitemap
├── components/              # React components
├── lib/                     # Utility functions
│   ├── admin/              # Admin authentication
│   ├── api/                # API helpers
│   ├── analytics.ts        # Analytics tracking
│   ├── biolink-helpers.ts  # Biolink data shape + variant/image helpers
│   ├── cart.ts             # Shopping cart logic
│   ├── currency.ts         # Multi-currency support
│   ├── get-tenant-info.ts  # Resolve current tenant from request context
│   ├── i18n.ts             # Internationalization
│   ├── prisma.ts           # Prisma client
│   ├── push-notifications.ts # Push notification handling
│   ├── theme-context.tsx   # Dark mode theme provider
│   └── translations.ts     # Translation strings
├── prisma/
│   └── schema.prisma       # Database schema (Tenant-rooted multi-tenancy)
├── public/                  # Static assets
│   └── sw.js               # Service worker
├── scripts/                 # Development + smoke scripts
├── .env.example            # Environment variables template
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vercel.json             # Vercel deployment config
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues or questions:
- Check existing GitHub Issues
- Create a new Issue with detailed information
- Contact the development team

---

Built for Hong Kong IG / WhatsApp sellers
