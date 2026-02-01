import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandsParam = searchParams.get("brand");
    const categoriesParam = searchParams.get("category");

    const brands = brandsParam ? brandsParam.split(",").filter(Boolean) : [];
    const categories = categoriesParam ? categoriesParam.split(",").filter(Boolean) : [];

    // Build where clause
    const where: any = { active: true };

    if (brands.length > 0) {
      where.brand = { in: brands };
    }

    if (categories.length > 0) {
      where.category = { in: categories };
    }

    const count = await prisma.product.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching filter counts:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
