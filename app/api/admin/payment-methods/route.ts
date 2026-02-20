export const runtime = "nodejs";

import { ok, withApi, ApiError } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { prisma } from "@/lib/prisma";

// 4 種收款方式的固定設定
const PAYMENT_METHOD_TYPES = [
  { type: "fps", name: "FPS 轉數快", sortOrder: 0 },
  { type: "payme", name: "PayMe", sortOrder: 1 },
  { type: "alipay_hk", name: "AlipayHK", sortOrder: 2 },
  { type: "bank_transfer", name: "銀行過數", sortOrder: 3 },
] as const;

type MethodType = (typeof PAYMENT_METHOD_TYPES)[number]["type"];

// GET /api/admin/payment-methods
// 返回該 tenant 的 4 種收款方式設定
export const GET = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);

  const existing = await prisma.paymentMethod.findMany({
    where: {
      tenantId,
      type: { in: PAYMENT_METHOD_TYPES.map((m) => m.type) },
    },
  });

  const existingMap = new Map(existing.map((m) => [m.type, m]));

  const data = PAYMENT_METHOD_TYPES.map(({ type, name, sortOrder }) => {
    const record = existingMap.get(type);
    return {
      type,
      name,
      sortOrder,
      active: record?.active ?? false,
      accountName: record?.accountName ?? "",
      accountNumber: record?.accountNumber ?? "",
      bankName: record?.bankName ?? "",
      paymentLink: record?.paymentLink ?? "",
      qrCodeUrl: record?.qrCodeUrl ?? record?.qrImage ?? "",
      instructions: record?.instructions ?? "",
    };
  });

  return ok(req, data);
});

// PUT /api/admin/payment-methods
// 批量更新 4 種收款方式
export const PUT = withApi(async (req: Request) => {
  const { tenantId } = await authenticateAdmin(req);
  const body = await req.json();

  const { methods } = body;

  if (!Array.isArray(methods)) {
    throw new ApiError(400, "BAD_REQUEST", "methods 必須是陣列");
  }

  // 至少要有 1 種 active
  const activeCount = (methods as any[]).filter((m) => m.active === true).length;
  if (activeCount === 0) {
    throw new ApiError(400, "BAD_REQUEST", "至少要有 1 種收款方式啟用");
  }

  const validTypes = new Set(PAYMENT_METHOD_TYPES.map((m) => m.type));
  const results = [];

  for (const method of methods as any[]) {
    const { type, active, accountName, accountNumber, bankName, paymentLink, qrCodeUrl, instructions } = method;

    if (!validTypes.has(type as MethodType)) continue;

    const methodDef = PAYMENT_METHOD_TYPES.find((m) => m.type === type)!;

    // 啟用時驗證必填欄位
    if (active) {
      if (type === "fps" && !accountNumber) {
        throw new ApiError(400, "BAD_REQUEST", "FPS: 請填寫收款電話或 FPS ID");
      }
      if (type === "bank_transfer") {
        if (!bankName) throw new ApiError(400, "BAD_REQUEST", "銀行過數: 請填寫銀行名稱");
        if (!accountNumber) throw new ApiError(400, "BAD_REQUEST", "銀行過數: 請填寫戶口號碼");
        if (!accountName) throw new ApiError(400, "BAD_REQUEST", "銀行過數: 請填寫戶口名稱");
      }
    }

    const result = await prisma.paymentMethod.upsert({
      where: { tenantId_type: { tenantId, type } },
      update: {
        active: active ?? false,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
        bankName: bankName || null,
        paymentLink: paymentLink || null,
        qrCodeUrl: qrCodeUrl || null,
        instructions: instructions || null,
      },
      create: {
        name: methodDef.name,
        type,
        active: active ?? false,
        sortOrder: methodDef.sortOrder,
        accountName: accountName || null,
        accountNumber: accountNumber || null,
        bankName: bankName || null,
        paymentLink: paymentLink || null,
        qrCodeUrl: qrCodeUrl || null,
        instructions: instructions || null,
        tenantId,
      },
    });

    results.push(result);
  }

  return ok(req, results);
});
