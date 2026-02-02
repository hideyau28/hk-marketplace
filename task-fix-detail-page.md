# Task: Fix Product Detail Page Issues

Project: /Users/ngyau/hk-marketplace
DATABASE_URL: postgresql://ngyau@localhost:5432/hk_marketplace

## Rules
1. Fully autonomous, do not ask any questions
2. Fix all errors yourself
3. npm run build + git commit at the end

## Fix 1: Add to Cart Button Missing
- Product detail page must have a prominent "Add to Cart" button
- Position: below size selection, full width
- Style: w-full bg-olive-600 text-white rounded-full py-3 text-lg font-semibold
- Text: "加入購物車" / "Add to Cart" (i18n)
- Must be visible above bottom nav (not hidden behind it)
- Add quantity selector (- / 1 / +) above the button
- Disabled state if no size selected: bg-zinc-300 text-zinc-500
- Ensure enough bottom padding (pb-32) so button is not hidden behind bottom nav

## Fix 2: Sale Price Not Showing on Detail Page
- When a product has originalPrice AND originalPrice > price, show:
  - Original price: line-through text-zinc-400 text-lg
  - Sale price: text-red-600 font-bold text-2xl
  - Discount badge: bg-red-500 text-white text-sm px-2 py-0.5 rounded-full "-XX%"
  - Layout: ~~HK$1,599~~ HK$1,299 -19%
- When product has NO originalPrice, show price normally:
  - text-2xl font-bold text-zinc-900 dark:text-zinc-100
- Discount calc: Math.round((1 - price / originalPrice) * 100)
- Ensure the product query on detail page includes originalPrice field

## Fix 3: Remove Filter Bar from Detail Page
- The filter bar (篩選 button + quick pills like Shoes/Tops/Pants) should ONLY appear on:
  - Homepage (/)
  - Products listing page (/products)
- It should NOT appear on:
  - Product detail page (/products/[id])
  - Cart page
  - Checkout page
  - Any other non-listing page
- Check where CategoryBar / FilterBar is rendered (likely in layout.tsx)
- Conditionally render it based on route, or move it out of the layout into specific pages

## Fix 4: Remove Pink Promo Bar from Detail Page
- The pink/red promo bar at the top should ONLY appear on homepage
- Or if it should appear everywhere, fix its styling (should be olive-600 bg, not pink)
- Check the promo bar component and fix either:
  - Its visibility (only on homepage)
  - Or its color (bg-olive-600 text-white, not pink)

## Fix 5: Clothing Size Format
- Products in category "Tops", "Pants", "Jackets" should use letter sizes: S, M, L, XL, XXL
- Products in category "Shoes" should keep EU number sizes: 38, 39, 40, 41, 42, 43, 44
- Products in category "Socks", "Accessories" should use: One Size / S / M / L
- Update seed data to assign correct size format per category
- Update the size display on detail page to show the correct sizes based on product category

## i18n Additions
product.addToCart: "加入購物車" / "Add to Cart"
product.selectSize: "選擇尺碼" / "Select Size"
product.quantity: "數量" / "Quantity"
product.off: "折" / "off"

## Files to Check/Modify
- app/[locale]/(customer)/products/[id]/page.tsx (Fix 1, 2, 5)
- app/[locale]/(customer)/layout.tsx (Fix 3, 4 - check where filter bar and promo bar render)
- components/CategoryBar.tsx or FilterBar (Fix 3)
- components/PromoBanner or PromoBar (Fix 4)
- prisma seed script (Fix 5 - clothing sizes)
- lib/translations.ts (i18n)

## On completion:
1. npm run build (must pass)
2. git add -A && git commit -m "fix: product detail - add to cart, sale price, filter bar, promo bar, clothing sizes"
