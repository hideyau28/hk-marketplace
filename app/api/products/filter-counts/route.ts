import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParam = searchParams.get("q");
    const brandsParam = searchParams.get("brand");
    const categoriesParam = searchParams.get("category");
    const shoeTypeParam = searchParams.get("shoeType");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sizesParam = searchParams.get("sizes");
    const badgeParam = searchParams.get("badge");
    const saleParam = searchParams.get("sale");

    const query = queryParam?.trim() || "";
    const brands = brandsParam ? brandsParam.split(",").filter(Boolean) : [];
    const categories = categoriesParam ? categoriesParam.split(",").filter(Boolean) : [];
    const shoeTypes = shoeTypeParam ? shoeTypeParam.split(",").filter(Boolean) : [];
    const sizes = sizesParam ? sizesParam.split(",").filter(Boolean) : [];
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;
    const badge = badgeParam?.trim() || "";
    const sale = saleParam === "true";

    // Build where clause
    const where: any = { active: true };

    // Text search filter
    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
      ];
    }

    if (brands.length > 0) {
      where.brand = { in: brands };
    }

    if (categories.length > 0) {
      where.category = { in: categories };
    }

    if (shoeTypes.length > 0) {
      where.shoeType = { in: shoeTypes };
    }

    if (minPrice !== null || maxPrice !== null) {
      where.price = {};
      if (minPrice !== null) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== null) {
        where.price.lte = maxPrice;
      }
    }

    // Badge filter (e.g., 今期熱賣)
    if (badge) {
      where.promotionBadges = { has: badge };
    }

    // For sizes and sale, we need to filter in memory
    const needsMemoryFilter = sizes.length > 0 || sale;

    let count = 0;

    if (needsMemoryFilter) {
      // Fetch products matching other criteria
      const products = await prisma.product.findMany({
        where,
        select: { sizes: true, price: true, originalPrice: true },
      });

      // Apply memory filters
      let filtered = products;

      // Filter by sizes - check if any of the selected sizes exist in the product's sizes
      if (sizes.length > 0) {
        filtered = filtered.filter((p) => {
          if (!p.sizes || typeof p.sizes !== "object") return false;
          const productSizes = Object.keys(p.sizes as Record<string, number>);
          return sizes.some((size) => productSizes.includes(size));
        });
      }

      // Filter by sale (originalPrice > price)
      if (sale) {
        filtered = filtered.filter((p) => {
          if (!p.originalPrice) return false;
          return p.originalPrice > p.price;
        });
      }

      count = filtered.length;
    } else {
      count = await prisma.product.count({ where });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching filter counts:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
