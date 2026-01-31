export const runtime = "nodejs";

import { ApiError, withApi } from "@/lib/api/route-helpers";
import { getSessionFromCookie } from "@/lib/admin/session";

const HEADER =
  "title,brand,category,price,description,imageUrl,sizeSystem,sizes,active";

export const GET = withApi(async (req: Request) => {
  const headerSecret = req.headers.get("x-admin-secret");
  const isAuthenticated = headerSecret ? headerSecret === process.env.ADMIN_SECRET : await getSessionFromCookie();

  if (!isAuthenticated) {
    throw new ApiError(401, "UNAUTHORIZED", "Unauthorized");
  }

  return new Response(`${HEADER}\n`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="products-template.csv"',
    },
  });
});
