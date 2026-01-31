import { PrismaClient, CouponDiscountType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const coupons: Array<{
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrder: number | null;
  active: boolean;
}> = [
  {
    code: "WELCOME10",
    discountType: "PERCENTAGE" as CouponDiscountType,
    discountValue: 10,
    minOrder: 200,
    active: true,
  },
  {
    code: "SAVE50",
    discountType: "FIXED" as CouponDiscountType,
    discountValue: 50,
    minOrder: 500,
    active: true,
  },
  {
    code: "FREESHIP",
    discountType: "FIXED" as CouponDiscountType,
    discountValue: 30,
    minOrder: null,
    active: true,
  },
];

async function seedCoupons() {
  try {
    let upserted = 0;
    for (const coupon of coupons) {
      await prisma.coupon.upsert({
        where: { code: coupon.code },
        update: coupon,
        create: coupon,
      });
      upserted += 1;
    }

    console.log(`Upserted ${upserted} coupons.`);
  } catch (error) {
    console.error("Error seeding coupons:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCoupons();
