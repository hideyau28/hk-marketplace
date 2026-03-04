import { prisma } from "@/lib/prisma";
import { withApi, ok, ApiError } from "@/lib/api/route-helpers";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST = withApi(async (req: Request) => {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const { email } = body;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    throw new ApiError(400, "BAD_REQUEST", "請輸入有效嘅 email");
  }

  const cleanEmail = email.trim().toLowerCase();

  const admin = await prisma.tenantAdmin.findUnique({
    where: { email: cleanEmail },
  });

  // 無論 email 存唔存在都返回同一個成功訊息，防止 email enumeration
  if (admin && admin.passwordHash) {
    const resetToken = randomUUID();
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 小時後過期

    await prisma.tenantAdmin.update({
      where: { id: admin.id },
      data: { resetToken, resetTokenExpiresAt },
    });

    // 暫時用 console.log 輸出 reset link（冇 email service）
    const locale = "zh-HK"; // default locale for reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/${locale}/admin/reset-password?token=${resetToken}`;
    console.log(`[forgot-password] Reset URL for ${cleanEmail}: ${resetUrl}`);
  }

  return ok(req, { ok: true });
});
