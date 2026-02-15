#!/usr/bin/env tsx
/**
 * E2E checklist — verifies all public URLs return expected responses.
 *
 * Usage:
 *   BASE=https://wowlix.com npx tsx scripts/e2e-checklist.ts
 *
 * Defaults to https://wowlix.com if BASE is not set.
 */

const BASE = (process.env.BASE || "https://wowlix.com").replace(/\/+$/, "");

interface Check {
  label: string;
  url: string;
  expect: (res: Response, body: string) => string | null; // null = pass, string = error
}

const checks: Check[] = [
  {
    label: "Homepage (root)",
    url: `${BASE}/`,
    expect: (res) => (res.status === 200 ? null : `expected 200, got ${res.status}`),
  },
  {
    label: "English locale",
    url: `${BASE}/en`,
    expect: (res) =>
      res.status === 200 ? null : `expected 200, got ${res.status}`,
  },
  {
    label: "zh-HK pricing page",
    url: `${BASE}/zh-HK/pricing`,
    expect: (res) =>
      res.status === 200 ? null : `expected 200, got ${res.status}`,
  },
  {
    label: "Tenant storefront (maysshop)",
    url: `${BASE}/maysshop`,
    expect: (res) =>
      res.status === 200 ? null : `expected 200, got ${res.status}`,
  },
  {
    label: "Payment config API (maysshop)",
    url: `${BASE}/api/payment-config?tenant=maysshop`,
    expect: (res, body) => {
      if (res.status !== 200) return `expected 200, got ${res.status}`;
      try {
        const json = JSON.parse(body);
        if (!Array.isArray(json.providers) || json.providers.length === 0) {
          return `expected providers.length > 0, got ${JSON.stringify(json.providers ?? null)}`;
        }
        return null;
      } catch {
        return `invalid JSON: ${body.slice(0, 120)}`;
      }
    },
  },
];

async function run() {
  console.log(`\n=== E2E Checklist (${BASE}) ===\n`);

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    process.stdout.write(`  ${check.label} ... `);
    try {
      const res = await fetch(check.url, { redirect: "follow" });
      const body = await res.text();
      const err = check.expect(res, body);
      if (err) {
        console.log(`FAIL — ${err}`);
        failed++;
      } else {
        console.log("PASS");
        passed++;
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`FAIL — ${msg}`);
      failed++;
    }
  }

  console.log(`\n  Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
