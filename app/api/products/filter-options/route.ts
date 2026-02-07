import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export async function GET(request: Request) {
  try {
    const tenantId = await getTenantId(request);
    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { active: true, tenantId },
      select: { brand: true, category: true },
    });

    // Extract distinct brands (non-null, non-empty)
    const brands = [...new Set(
      products
        .map((p) => p.brand)
        .filter((b): b is string => !!b && b.trim() !== "")
    )].sort();

    // Extract distinct categories (non-null, non-empty)
    const categories = [...new Set(
      products
        .map((p) => p.category)
        .filter((c): c is string => !!c && c.trim() !== "")
    )].sort();

    return NextResponse.json({ brands, categories });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json({ brands: [], categories: [] }, { status: 500 });
  }
}
