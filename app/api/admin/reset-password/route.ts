import { prisma } from "@/lib/prisma";
import { withApi, ok, ApiError } from "@/lib/api/route-helpers";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_NUMBER_REGEX = /[0-9]/;

export const POST = withApi(async (req: Request) => {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, "BAD_REQUEST", "Invalid JSON body");
  }

  const { token, password } = body;

  if (!token || typeof token !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "Reset token is required");
  }

  if (!password || typeof password !== "string") {
    throw new ApiError(400, "BAD_REQUEST", "Password is required");
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new ApiError(400, "BAD_REQUEST", "密碼最少需要 8 個字元");
  }

  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    throw new ApiError(400, "BAD_REQUEST", "密碼必須包含至少一個數字");
  }

  const admin = await prisma.tenantAdmin.findFirst({
    where: { resetToken: token },
  });

  if (!admin || !admin.resetTokenExpiresAt) {
    throw new ApiError(400, "BAD_REQUEST", "此重設連結無效或已過期");
  }

  if (admin.resetTokenExpiresAt < new Date()) {
    throw new ApiError(400, "BAD_REQUEST", "此重設連結已過期");
  }

  const passwordHash = await hashPassword(password);

  await prisma.tenantAdmin.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  return ok(req, { ok: true });
});
