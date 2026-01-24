import { prisma } from "@/lib/prisma";

export async function GET() {
  const s = await prisma.storeSettings.findUnique({ where: { id: 1 } });
  return Response.json(s ?? null);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const storeName = String(body.storeName ?? "").trim() || "HK•Market";
  const tagline = String(body.tagline ?? "").trim() || "Deep dark, easy shopping";
  const returnsPolicy = body.returnsPolicy ? String(body.returnsPolicy) : null;
  const shippingPolicy = body.shippingPolicy ? String(body.shippingPolicy) : null;

  const saved = await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: { id: 1, storeName, tagline, returnsPolicy, shippingPolicy },
    update: { storeName, tagline, returnsPolicy, shippingPolicy },
  });

  return Response.json(saved);
}
