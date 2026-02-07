export const runtime = "nodejs";

import { withApi } from "@/lib/api/route-helpers";
import { authenticateAdmin } from "@/lib/auth/admin-auth";

const HEADER =
  "title,brand,category,price,description,imageUrl,sizeSystem,sizes,active";

export const GET = withApi(async (req: Request) => {
  await authenticateAdmin(req);

  return new Response(`${HEADER}\n`, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="products-template.csv"',
    },
  });
});
