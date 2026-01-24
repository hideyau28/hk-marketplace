import fs from "node:fs";

const files = [
  "app/[locale]/page.tsx",
  "app/[locale]/admin/settings/page.tsx",
  "app/[locale]/admin/products/page.tsx",
  "app/[locale]/admin/orders/page.tsx",
  "app/[locale]/product/[id]/page.tsx",
];

function patch(src, hasId) {
  // 1) default export -> async
  src = src.replace(/export\s+default\s+function\s+/g, "export default async function ");

  // 2) params type -> Promise
  // common patterns
  src = src.replace(/params:\s*\{\s*locale:\s*Locale\s*;\s*\}/g, "params: Promise<{ locale: string }>");
  src = src.replace(/params:\s*\{\s*locale:\s*Locale\s*\}/g, "params: Promise<{ locale: string }>");
  src = src.replace(/params:\s*\{\s*locale:\s*string\s*\}/g, "params: Promise<{ locale: string }>");

  if (hasId) {
    src = src.replace(/params:\s*\{\s*locale:\s*Locale;\s*id:\s*string\s*\}/g, "params: Promise<{ locale: string; id: string }>");
    src = src.replace(/params:\s*\{\s*locale:\s*string;\s*id:\s*string\s*\}/g, "params: Promise<{ locale: string; id: string }>");
  }

  // 3) insert await params if needed
  const needsAwait = /params\.(locale|id)\b/.test(src) && !/\bawait\s+params\b/.test(src);
  if (needsAwait) {
    const inject = hasId
      ? "  const { locale, id } = await params;\n"
      : "  const { locale } = await params;\n";

    // insert after first function body open
    src = src.replace(/\)\s*\{\s*\n/, (m) => m + inject);
  }

  // 4) replace params access
  src = src.replace(/\bparams\.locale\b/g, "locale");
  if (hasId) src = src.replace(/\bparams\.id\b/g, "id");

  return src;
}

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log("SKIP (missing):", f);
    continue;
  }
  const before = fs.readFileSync(f, "utf8");
  const after = patch(before, f.includes("[id]"));
  if (after !== before) {
    fs.writeFileSync(f, after, "utf8");
    console.log("PATCHED:", f);
  } else {
    console.log("NOCHANGE:", f);
  }
}
