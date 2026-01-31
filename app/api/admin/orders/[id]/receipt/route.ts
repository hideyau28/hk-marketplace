export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { ApiError, withApi } from "@/lib/api/route-helpers";
import { getSessionFromCookie } from "@/lib/admin/session";
import { promises as fs } from "node:fs";
import path from "node:path";

export const GET = withApi(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();
  if (!isAuthenticated) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
