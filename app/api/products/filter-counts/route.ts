import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandsParam = searchParams.get("brand");
    const categoriesParam = searchParams.get("category");
    const shoeTypeParam = searchParams.get("shoeType");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sizesParam = searchParams.get("sizes");

    const brands = brandsParam ? brandsParam.split(",").filter(Boolean) : [];
    const categories = categoriesParam ? categoriesParam.split(",").filter(Boolean) : [];
    const shoeTypes = shoeTypeParam ? shoeTypeParam.split(",").filter(Boolean) : [];
    const sizes = sizesParam ? sizesParam.split(",").filter(Boolean) : [];
    const minPrice = minPriceParam ? parseFloat(minPriceParam) : null;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : null;

    // Build where clause
    const where: any = { active: true };

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

    // For sizes, we need to do a more complex query since sizes is a JSON field
    // We'll fetch products and filter in memory for now
    let count = 0;

    if (sizes.length > 0) {
      // Fetch products matching other criteria
      const products = await prisma.product.findMany({
        where,
        select: { sizes: true },
      });

      // Filter by sizes - check if any of the selected sizes exist in the product's sizes
      count = products.filter((p) => {
        if (!p.sizes || typeof p.sizes !== "object") return false;
        const productSizes = Object.keys(p.sizes as Record<string, number>);
        return sizes.some((size) => productSizes.includes(size));
      }).length;
    } else {
      count = await prisma.product.count({ where });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching filter counts:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
