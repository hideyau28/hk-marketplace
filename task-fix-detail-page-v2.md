# Task: Fix Product Detail Page + UI Issues (Comprehensive)

Project: /Users/ngyau/hk-marketplace
DATABASE_URL: postgresql://ngyau@localhost:5432/hk_marketplace

## Rules
1. Fully autonomous - do NOT ask any questions, make all decisions yourself
2. Fix ALL errors yourself - do not stop and ask for help
3. If a fix doesn't work, try a different approach automatically
4. If you need data, check the DB directly, don't ask the user
5. Run npm run build at the end - if it fails, fix until it passes
6. git add -A && git commit when everything works
7. Output a completion report listing all files changed

---

## Fix 1: Product Image Carousel + Floating Effect
- Product detail page should support multiple images per product
- Check if Product model has an images field (array/JSON). If not, add one:
  - Add to Prisma schema: images String[] (array of URLs)
  - npx prisma db push
- Seed each product with 3 Unsplash images (different angles/views of similar items):
  - Use sport/shoe/clothing related Unsplash photos
  - First image = current imageUrl (main image)
  - Add 2 more related images per product
- Image carousel on detail page:
  - Swipe left/right to switch images
  - Use CSS transform translateX (NOT scroll-based, to avoid scroll jump issues)
  - Bottom dot indicators: active = bg-olive-600, inactive = bg-zinc-300
  - Dots centered below image
- Floating effect:
  - Image container: mx-4 rounded-2xl overflow-hidden
  - Shadow: shadow-[0_8px_30px_rgba(0,0,0,0.12)]
  - Background behind image: bg-zinc-50 dark:bg-zinc-900
  - Image NOT edge-to-edge, has margin around it
  - This creates a "floating card" look
- Ensure images.unsplash.com is in next.config.ts remotePatterns

## Fix 2: Add to Cart - Sticky Bottom Bar
- Remove current Add to Cart button from scrollable content
- Create a sticky bottom bar that sits ABOVE the bottom navigation
- Layout:
  ```
  ┌─────────────────────────────────┐
  │  (scrollable content above)      │
  ├─────────────────────────────────┤
  │  [Add to Cart]  ← sticky bar    │  ← fixed, above bottom nav
  ├─────────────────────────────────┤
  │  🏠  🔍  ❤️  📦  👤             │  ← bottom nav
  └─────────────────────────────────┘
  ```
- Sticky bar styling:
  - fixed bottom-[56px] (above bottom nav height) left-0 right-0
  - bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800
  - px-4 py-3
  - z-index: 40
  - Button: w-full bg-olive-600 text-white rounded-full py-3 text-base font-semibold
  - Text: "加入購物車" / "Add to Cart" (i18n)
  - Disabled if no size selected: bg-zinc-300 text-zinc-500, text "請先選擇尺碼" / "Select a size"
- Add safe area padding: pb-[env(safe-area-inset-bottom)] on bottom nav
- Ensure page content has enough bottom padding to not be hidden (pb-36 or similar)
- ONLY show this sticky bar on product detail page, not other pages

## Fix 3: Sale Price Display on Detail Page
- When product has originalPrice AND originalPrice > price, show:
  ```
  ~~HK$1,599~~  HK$1,299  -19%
  ```
  - Original price: text-lg text-zinc-400 line-through mr-2
  - Sale price: text-2xl font-bold text-red-600
  - Discount badge: bg-red-500 text-white text-sm font-medium px-2 py-0.5 rounded-full ml-2
  - Discount calc: Math.round((1 - price / originalPrice) * 100)
- When product has NO originalPrice or originalPrice <= price:
  - Just show: HK$1,299 (text-2xl font-bold text-zinc-900 dark:text-zinc-100)
- Ensure product detail query includes originalPrice field from DB
- All prices: no decimal points, use Math.round().toLocaleString()

## Fix 4: Remove Filter Bar from Detail Page
- The filter bar (篩選 button + quick pills) should ONLY appear on:
  - Homepage (/)
  - Products listing page (/products)
- Remove from:
  - Product detail page (/products/[id])
  - Cart, Checkout, and all other pages
- Check layout.tsx - the filter bar is likely rendered in a shared layout
- Move it to only render on specific pages, or use pathname check to conditionally show

## Fix 5: Remove Pink Promo Bar from Detail Page
- The pink/red bar at top of detail page should not be there
- Either:
  - Only show promo bar on homepage
  - Or fix its color to bg-olive-600 text-white if it should appear everywhere
- Check where this component renders and restrict to homepage only

## Fix 6: Shoe Sizes - UK System
- ALL shoe products (category "Shoes") should use UK sizes
- Full range: UK 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12
- Display format on buttons: "UK 3" "UK 3.5" "UK 4" etc.
- Size buttons: smaller text to fit more per row
  - 4 per row on mobile
  - text-sm, rounded-lg, py-2
  - Selected: bg-olive-600 text-white
  - Unselected: bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700
- Update seed data for all shoe products with these UK sizes

## Fix 7: Clothing Sizes - Letter System
- Products in category "Tops", "Pants", "Jackets" use: S, M, L, XL, XXL
- Products in category "Socks", "Accessories" use: One Size, S, M, L
- Size buttons same styling as shoes but fewer options (fit in 1-2 rows)
- Update seed data for clothing products with letter sizes

## Fix 8: Remove Floating WhatsApp Button (Global)
- Delete the floating green WhatsApp button component entirely
- Remove from layout or wherever it's rendered
- It should NOT appear on any page anymore
- Delete the component file if it exists (e.g. WhatsAppButton.tsx or FloatingWhatsApp.tsx)

## Fix 9: Footer - Add WhatsApp Icon
- Add WhatsApp icon next to Instagram and Facebook in footer
- Layout: [IG] [FB] [WA] - three icons in a row, centered
- WhatsApp icon: use a WhatsApp SVG or lucide MessageCircle as fallback
- All three icons same size and style:
  - w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center
  - Icon color: text-white, size 20px
- WhatsApp link: https://wa.me/852XXXXXXXX (placeholder, can be changed later)
- Gap: gap-3 between icons

## Fix 10: Remove Empty Space Below Quantity
- On detail page, there's a large blank space between Quantity selector and Related Products
- Find and remove:
  - Extra padding/margin
  - Empty divs or spacers
  - Any hidden/empty sections
- Content should flow: Quantity → (small gap py-4) → Related Products

## Fix 11: Bottom Nav - Fix Home Icon Overlap
- The N logo (Anthropic/app logo) is overlapping the Home icon in bottom nav
- This is likely the browser's own UI overlapping, but check:
  - Bottom nav z-index is high enough (z-50)
  - No absolute positioned elements overlapping
  - Home icon is fully visible and tappable
- If the N logo is part of the app, remove it or reposition it

## Fix 12: Detail Page - Remove Breadcrumb or Fix Language
- Breadcrumb shows "Home > Shoes > Nike Air Max 270" in English even in Chinese mode
- Either:
  - Make breadcrumb i18n aware: "首頁 > 鞋款 > Nike Air Max 270"
  - Or remove breadcrumb on mobile (only show on desktop)
- Breadcrumb styling if kept: text-sm text-zinc-500, px-4 py-2

---

## i18n Additions
Add to lib/translations.ts for both en and zh-HK:

product.addToCart: "Add to Cart" / "加入購物車"
product.selectSize: "Select Size" / "選擇尺碼"
product.selectSizeFirst: "Select a size" / "請先選擇尺碼"
product.quantity: "Quantity" / "數量"
product.relatedProducts: "Related Products" / "相關產品"
breadcrumb.home: "Home" / "首頁"

## Files to Create/Modify
- prisma/schema.prisma (images field if needed)
- app/[locale]/(customer)/products/[id]/page.tsx (Fix 1,2,3,6,7,10,12)
- components/ProductImageCarousel.tsx (NEW - Fix 1)
- components/StickyAddToCart.tsx (NEW - Fix 2)
- components/WhatsAppButton.tsx (DELETE - Fix 8)
- components/Footer.tsx (Fix 9)
- components/BottomTab.tsx (Fix 11)
- app/[locale]/(customer)/layout.tsx (Fix 4,5,8)
- Seed script (Fix 1,6,7 - images + sizes)
- lib/translations.ts (i18n)

## On completion:
1. npm run build (must pass, fix any errors)
2. git add -A && git commit -m "feat: product detail redesign - image carousel, sticky cart, UK sizes, sale prices, remove WhatsApp float"
3. Output completion report listing all files changed and what was fixed
