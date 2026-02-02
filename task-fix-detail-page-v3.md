# Task: Fix Product Detail Page + UI Issues (Comprehensive v3)

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
  - Use sport/shoe/clothing related Unsplash photos with ?w=800&q=80
  - First image = current imageUrl (main image)
  - Add 2 more related images per product
- Image carousel on detail page:
  - Swipe left/right to switch images
  - Use CSS transform translateX (NOT scroll-based, to avoid scroll jump issues)
  - Bottom dot indicators: active = bg-olive-600 w-2 h-2, inactive = bg-zinc-300 w-2 h-2
  - Dots centered below image, gap-2
- Floating effect:
  - Image container: mx-4 rounded-2xl overflow-hidden
  - Shadow: shadow-[0_8px_30px_rgba(0,0,0,0.12)]
  - Background behind image: bg-zinc-50 dark:bg-zinc-900
  - Image NOT edge-to-edge, has margin around it for floating card look
- Ensure images.unsplash.com is in next.config.ts remotePatterns

## Fix 2: Sticky Bottom Bar - Add to Cart + Wishlist (Nike/Adidas Style)
- Remove current Add to Cart button from scrollable content
- Remove Quantity selector (not needed - users add quantity in cart)
- Create a sticky bottom bar ABOVE the bottom navigation:
  ```
  ┌─────────────────────────────────────┐
  │  [     加入購物車      ]  [  ♡  ]   │
  └─────────────────────────────────────┘
  ```
- Sticky bar styling:
  - fixed bottom-[56px] left-0 right-0 (56px = bottom nav height)
  - bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800
  - px-4 py-3
  - z-index: 40
  - flex gap-3
- Add to Cart button:
  - flex-1 bg-olive-600 text-white rounded-lg py-3.5 text-base font-semibold text-center
  - Text: "加入購物車" / "Add to Cart" (i18n)
  - Disabled state if no size selected: bg-zinc-300 text-zinc-500, text "請先選擇尺碼" / "Select a size"
- Wishlist heart button:
  - w-14 h-14 border border-zinc-300 dark:border-zinc-600 rounded-lg flex items-center justify-center
  - Heart icon: 24px, default text-zinc-400
  - Tap to toggle: text-red-500 fill-red-500 when saved
  - Save to localStorage wishlist
- ONLY show this sticky bar on product detail page
- Ensure page content has enough bottom padding (pb-40) to not be hidden behind sticky bar + bottom nav

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
- Remove from product detail page (/products/[id]), cart, checkout, all other pages
- Check layout.tsx where filter bar renders
- Use pathname check or move filter bar into specific page components only

## Fix 5: Remove Pink Promo Bar from Detail Page
- The pink/red bar at top of detail page should not appear on detail page
- Only show promo bar on homepage
- Check the promo bar component and conditionally render based on route

## Fix 6: Shoe Sizes - UK System (Nike/Adidas Grid Style)
- ALL shoe products (category "Shoes") use UK sizes
- Full range: UK 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12
- Header row: "選擇尺碼 (UK)" on left + "尺碼表" link on right
  - "選擇尺碼 (UK)" / "Select Size (UK)": text-base font-bold
  - "尺碼表" / "Size Guide": text-sm text-olive-600 underline, tappable
- Grid layout: 5 columns per row (following Adidas style)
- Each size button:
  - border border-zinc-200 dark:border-zinc-700
  - text-sm text-center py-3
  - Display: "UK 3", "UK 3.5", "UK 4" etc.
  - Selected: bg-olive-600 text-white border-olive-600
  - Unselected: bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100
  - Out of stock: text-zinc-300 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900 cursor-not-allowed line-through
  - NO rounded corners (square grid like Nike/Adidas)
- Update seed data: all shoe products get UK 3-12 half sizes
- Some sizes can be randomly marked as out of stock for realism

## Fix 7: Clothing Sizes - Letter System
- Products in category "Tops", "Pants", "Jackets" use: S, M, L, XL, XXL
- Products in category "Socks", "Accessories" use: One Size, S, M, L
- Same grid style as shoes but fewer columns (4 columns for clothing)
- Header: "選擇尺碼" / "Select Size" + "尺碼表" / "Size Guide"
- Update seed data for clothing products with letter sizes

## Fix 8: Size Guide Modal (尺碼表)
- Create components/SizeGuideModal.tsx
- Opens when user taps "尺碼表" / "Size Guide" link
- Bottom sheet style (slides up from bottom):
  - Overlay: bg-black/50 fixed inset-0 z-50
  - Panel: bg-white dark:bg-zinc-900 rounded-t-2xl max-h-[70vh] overflow-y-auto
  - Header: "尺碼指南" / "Size Guide" + X close button
- Content: conversion table

  | UK   | EU   | US   | CM   |
  |------|------|------|------|
  | 3    | 35.5 | 4    | 22   |
  | 3.5  | 36   | 4.5  | 22.5 |
  | 4    | 36.5 | 5    | 23   |
  | 4.5  | 37   | 5.5  | 23.5 |
  | 5    | 37.5 | 6    | 24   |
  | 5.5  | 38   | 6.5  | 24.5 |
  | 6    | 39   | 7    | 25   |
  | 6.5  | 39.5 | 7.5  | 25.5 |
  | 7    | 40   | 8    | 26   |
  | 7.5  | 40.5 | 8.5  | 26.5 |
  | 8    | 41   | 9    | 27   |
  | 8.5  | 42   | 9.5  | 27.5 |
  | 9    | 42.5 | 10   | 28   |
  | 9.5  | 43   | 10.5 | 28.5 |
  | 10   | 44   | 11   | 29   |
  | 10.5 | 44.5 | 11.5 | 29.5 |
  | 11   | 45   | 12   | 30   |
  | 11.5 | 46   | 12.5 | 30.5 |
  | 12   | 47   | 13   | 31   |

- Table styling:
  - Header row: bg-zinc-100 dark:bg-zinc-800 font-bold text-sm
  - Data rows: text-sm, alternate bg for readability
  - border-b border-zinc-100 dark:border-zinc-800
  - UK column highlighted (bold) since that's our primary system
- For clothing, show a different table:
  
  | Size | Chest (cm) | Waist (cm) | Hip (cm) |
  |------|-----------|-----------|---------|
  | S    | 86-91     | 71-76     | 86-91   |
  | M    | 91-97     | 76-81     | 91-97   |
  | L    | 97-102    | 81-86     | 97-102  |
  | XL   | 102-107   | 86-91     | 102-107 |
  | XXL  | 107-112   | 91-97     | 107-112 |

- Auto-detect which table to show based on product category

## Fix 9: Remove Floating WhatsApp Button (Global)
- Delete the floating green WhatsApp button entirely
- Remove from layout or wherever it's rendered globally
- Delete the component file (WhatsAppButton.tsx or similar)
- Should NOT appear on any page

## Fix 10: Footer - Add WhatsApp Icon
- Replace floating WhatsApp with a footer icon
- Footer social icons row: [IG] [FB] [WA] - three icons, centered
- All three icons same style:
  - w-10 h-10 rounded-full bg-zinc-700 dark:bg-zinc-600 flex items-center justify-center
  - Icon color: text-white, size 20px
  - gap-3 between icons
- WhatsApp link: https://wa.me/85200000000 (placeholder)
- Instagram link: https://instagram.com (placeholder)
- Facebook link: https://facebook.com (placeholder)

## Fix 11: Remove Empty Space Below Quantity / Size Selection
- On detail page, large blank space exists between content and Related Products
- Find and remove extra padding/margin/empty divs
- Flow should be: Size selection → (py-6) → Related Products → Footer
- No large gaps anywhere

## Fix 12: Remove Breadcrumb on Mobile or Fix i18n
- Breadcrumb shows English on Chinese pages
- Solution: Remove breadcrumb on mobile entirely (hidden on mobile, show on desktop only)
- Use: hidden md:flex for breadcrumb container
- On desktop, make it i18n aware:
  - "首頁 > 鞋款 > Nike Air Max 270" in Chinese
  - "Home > Shoes > Nike Air Max 270" in English

## Fix 13: Bottom Nav - Fix Home Icon Overlap
- Bottom nav Home icon has an N logo overlapping it
- Ensure bottom nav z-index is z-50
- All icons fully visible and tappable
- If the overlap is from the sticky Add to Cart bar, adjust z-index layering:
  - Bottom nav: z-50
  - Sticky Add to Cart bar: z-40
  - Page content: z-0

---

## i18n Additions
Add to lib/translations.ts for both en and zh-HK:

product.addToCart: "Add to Cart" / "加入購物車"
product.selectSize: "Select Size" / "選擇尺碼"
product.selectSizeUK: "Select Size (UK)" / "選擇尺碼 (UK)"
product.selectSizeFirst: "Select a size" / "請先選擇尺碼"
product.sizeGuide: "Size Guide" / "尺碼表"
product.sizeGuideTitle: "Size Guide" / "尺碼指南"
product.outOfStock: "Out of Stock" / "缺貨"
product.relatedProducts: "Related Products" / "相關產品"
breadcrumb.home: "Home" / "首頁"

## Files to Create
- components/ProductImageCarousel.tsx (Fix 1)
- components/StickyAddToCart.tsx (Fix 2)
- components/SizeGuideModal.tsx (Fix 8)
- components/SizeSelector.tsx (Fix 6, 7 - reusable size grid)

## Files to Modify
- prisma/schema.prisma (images field if needed)
- app/[locale]/(customer)/products/[id]/page.tsx (Fix 1,2,3,6,7,11,12)
- app/[locale]/(customer)/layout.tsx (Fix 4,5,9)
- components/Footer.tsx (Fix 10)
- components/BottomTab.tsx (Fix 13)
- lib/translations.ts (i18n)
- Seed script (images, UK sizes, clothing sizes, some out-of-stock sizes)

## Files to Delete
- components/WhatsAppButton.tsx or FloatingWhatsApp.tsx (Fix 9)

## On completion:
1. npm run build (must pass, fix any errors until it does)
2. git add -A && git commit -m "feat: product detail redesign - image carousel, sticky cart+wishlist, UK sizes, size guide, sale prices"
3. Output completion report listing all files changed and what was fixed
