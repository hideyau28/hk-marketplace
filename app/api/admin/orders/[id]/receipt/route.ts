export const runtime = "nodejs";

import { ApiError, withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";
import { promises as fs } from "node:fs";
import path from "node:path";

export const GET = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  await authenticateAdmin(req);

  const { id } = await params;
  const filePath = path.join("/tmp/receipts", `${id}.html`);

  try {
    const html = await fs.readFile(filePath, "utf8");
    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  } catch {
    throw new ApiError(404, "NOT_FOUND", "Receipt not found");
  }
});
