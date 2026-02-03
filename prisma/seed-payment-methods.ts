import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { prisma } from "../lib/prisma";

const paymentMethods = [
  {
    name: "FPS 轉數快",
    type: "fps",
    qrImage: "/images/placeholder-fps-qr.svg",
    accountInfo: "FPS ID: 1234567",
    sortOrder: 1,
  },
  {
    name: "PayMe",
    type: "payme",
    qrImage: "/images/placeholder-payme-qr.svg",
    accountInfo: "PayMe: +852 9876 5432",
    sortOrder: 2,
  },
  {
    name: "Alipay HK",
    type: "alipay",
    qrImage: "/images/placeholder-alipay-qr.svg",
    accountInfo: "Alipay HK",
    sortOrder: 3,
  },
];

async function main() {
  console.log("Seeding payment methods...");

  for (const method of paymentMethods) {
    const existing = await prisma.paymentMethod.findUnique({
      where: { type: method.type },
    });

    if (existing) {
      console.log(`Payment method ${method.type} already exists, skipping...`);
      continue;
    }

    await prisma.paymentMethod.create({
      data: method,
    });
    console.log(`Created payment method: ${method.name}`);
  }

  console.log("Done seeding payment methods.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
