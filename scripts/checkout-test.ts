import puppeteer, { type Browser, type Page } from "puppeteer";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Config ──────────────────────────────────────────────────────────────────

const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3 };
const TIMEOUT = 12000; // 12s per element wait
const STORES = [
  { name: "hypedrops", url: "https://www.wowlix.com/hypedrops" },
  { name: "nichiyori", url: "https://www.wowlix.com/nichiyori" },
  { name: "greenday", url: "https://www.wowlix.com/greenday" },
  { name: "petitfleur", url: "https://www.wowlix.com/petitfleur" },
];

const RUN_ID = new Date().toISOString().slice(0, 10);
const SS_BASE = path.join(__dirname, "..", "screenshots", `checkout-${RUN_ID}`);

// ── Types ────────────────────────────────────────────────────────────────────

type Status = "✅ Pass" | "❌ Fail" | "⚠️ Issue";

interface StepResult {
  n: number;
  name: string;
  status: Status;
  detail: string;
  screenshot: string;
  ms: number;
}

interface StoreReport {
  store: string;
  url: string;
  steps: StepResult[];
  consoleErrors: string[];
  totalMs: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ssDir(store: string): string {
  const d = path.join(SS_BASE, store);
  fs.mkdirSync(d, { recursive: true });
  return d;
}

async function shot(page: Page, dir: string, name: string): Promise<string> {
  const file = path.join(dir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(path.join(__dirname, ".."), file);
}

async function waitAndShot(
  page: Page,
  selector: string,
  dir: string,
  name: string,
  timeout = TIMEOUT,
): Promise<string> {
  await page.waitForSelector(selector, { timeout });
  return shot(page, dir, name);
}

/** Find and click a button by its visible text */
async function clickByText(
  page: Page,
  text: string,
  timeout = TIMEOUT,
): Promise<boolean> {
  try {
    await page.waitForFunction(
      (t: string) => {
        const btns = Array.from(document.querySelectorAll("button, a"));
        return btns.some(
          (el) =>
            el.textContent?.includes(t) && !(el as HTMLButtonElement).disabled,
        );
      },
      { timeout },
      text,
    );
    await page.evaluate((t: string) => {
      const btns = Array.from(document.querySelectorAll("button, a"));
      const btn = btns.find(
        (el) =>
          el.textContent?.includes(t) && !(el as HTMLButtonElement).disabled,
      ) as HTMLElement | undefined;
      btn?.click();
    }, text);
    return true;
  } catch {
    return false;
  }
}

/** Check if text exists anywhere on page */
async function hasText(page: Page, text: string): Promise<boolean> {
  return page.evaluate(
    (t: string) => document.body.innerText.includes(t),
    text,
  );
}

// ── Per-store test ────────────────────────────────────────────────────────────

async function testStore(
  browser: Browser,
  storeName: string,
  url: string,
): Promise<StoreReport> {
  const steps: StepResult[] = [];
  const consoleErrors: string[] = [];
  const dir = ssDir(storeName);
  const storeStart = Date.now();

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  const step = async (
    n: number,
    name: string,
    fn: () => Promise<{ status: Status; detail: string; screenshot: string }>,
  ) => {
    const t0 = Date.now();
    let result: { status: Status; detail: string; screenshot: string };
    try {
      result = await fn();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const ss = await shot(
        page,
        dir,
        `${n.toString().padStart(2, "0")}-error`,
      ).catch(() => "");
      result = { status: "❌ Fail", detail: msg.slice(0, 200), screenshot: ss };
    }
    steps.push({ n, name, ...result, ms: Date.now() - t0 });
    console.log(`  [${storeName}] Step ${n}: ${result.status} — ${name}`);
  };

  // ── Step 1: Navigate ───────────────────────────────────────────────────────
  await step(1, "開店頁 + 等待載入", async () => {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    const ss = await waitAndShot(page, ".min-h-screen", dir, "01-store-load");
    const title = await page.title();
    return { status: "✅ Pass", detail: `頁面標題: ${title}`, screenshot: ss };
  });

  // ── Step 2: Products loaded ────────────────────────────────────────────────
  await step(2, "產品載入確認", async () => {
    await page.waitForSelector('[aria-label^="加入購物車"]', {
      timeout: TIMEOUT,
    });
    const count = await page.$$eval(
      '[aria-label^="加入購物車"]',
      (els) => els.length,
    );
    const ss = await shot(page, dir, "02-products-loaded");
    return {
      status: count > 0 ? "✅ Pass" : "❌ Fail",
      detail: `發現 ${count} 件有貨產品`,
      screenshot: ss,
    };
  });

  // ── Step 3: Open ProductSheet ──────────────────────────────────────────────
  await step(3, "點入第一件產品詳情頁", async () => {
    // Click the first product's image area (cursor-pointer div)
    await page.evaluate(() => {
      const img = document.querySelector(
        "div.aspect-square.cursor-pointer, div[class*='aspect-square'][class*='cursor-pointer']",
      ) as HTMLElement | null;
      img?.click();
    });
    await page.waitForSelector('[aria-label="關閉"]', { timeout: TIMEOUT });
    const ss = await shot(page, dir, "03-product-sheet");
    const productTitle = await page.evaluate(
      () =>
        (
          document.querySelector(
            ".fixed.inset-0.z-50 h2, .fixed.inset-0 h2",
          ) as HTMLElement | null
        )?.textContent ?? "unknown",
    );
    return {
      status: "✅ Pass",
      detail: `ProductSheet 已開啟`,
      screenshot: ss,
    };
  });

  // ── Step 4: Select variant (if any) ───────────────────────────────────────
  await step(4, "Size selector（有則揀，無則跳過）", async () => {
    // Find size/variant buttons in the product sheet (not disabled, not add-to-cart)
    const variantClicked = await page.evaluate(() => {
      // Size buttons have class "px-4 py-2.5 rounded-xl text-sm font-medium border"
      const btns = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".fixed.inset-0 button"),
      ).filter((btn) => {
        const cl = btn.className;
        return (
          cl.includes("rounded-xl") &&
          cl.includes("border") &&
          !btn.disabled &&
          btn.offsetWidth > 0 &&
          btn.offsetWidth < 200 && // not a full-width button
          !btn.textContent?.includes("加入購物車") &&
          !btn.textContent?.includes("關閉") &&
          !btn.textContent?.includes("商品描述") &&
          !btn.textContent?.includes("冇貨") &&
          // Must have text (size label)
          (btn.textContent?.trim().length ?? 0) > 0
        );
      });
      if (btns.length > 0) {
        (btns[0] as HTMLElement).click();
        return btns[0].textContent?.trim() ?? "clicked";
      }
      return null;
    });

    await new Promise((r) => setTimeout(r, 500)); // wait for state update
    const ss = await shot(page, dir, "04-variant");

    if (variantClicked) {
      return {
        status: "✅ Pass",
        detail: `已選: ${variantClicked}`,
        screenshot: ss,
      };
    } else {
      return {
        status: "⚠️ Issue",
        detail: "冇 variant buttons — 可能係無款式產品",
        screenshot: ss,
      };
    }
  });

  // ── Step 5: Add to cart ────────────────────────────────────────────────────
  await step(5, "加入購物車", async () => {
    // Try clicking "加入購物車" button in ProductSheet
    const addBtnText = await page.evaluate(() => {
      const btns = Array.from(
        document.querySelectorAll<HTMLButtonElement>(".fixed.inset-0 button"),
      );
      const addBtn = btns.find((b) => b.textContent?.includes("加入購物車"));
      return addBtn
        ? { text: addBtn.textContent?.trim(), disabled: addBtn.disabled }
        : null;
    });

    // Helper: close ProductSheet and click the + button on card directly
    const fallbackToCardAdd = async () => {
      await page.evaluate(() => {
        const closeBtn = document.querySelector(
          '[aria-label="關閉"]',
        ) as HTMLElement | null;
        closeBtn?.click();
      });
      await new Promise((r) => setTimeout(r, 700));
      await page.evaluate(() => {
        const addBtn = document.querySelector(
          '[aria-label^="加入購物車"]',
        ) as HTMLElement | null;
        addBtn?.click();
      });
    };

    if (addBtnText && !addBtnText.disabled) {
      // Button exists and not HTML-disabled — click it
      await clickByText(page, "加入購物車");
      // Quick check: did CartBar appear? (no-variant products show error, cart stays empty)
      const cartAppeared = await page
        .waitForSelector(".fixed.bottom-0", { timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!cartAppeared) {
        // ProductSheet showed error (no variant selected) — fall back to + button
        await fallbackToCardAdd();
      }
    } else {
      // Button disabled or not found — close sheet and use + button directly
      await fallbackToCardAdd();
    }

    // Wait for CartBar to appear (cart has items)
    await page.waitForSelector(".fixed.bottom-0", { timeout: TIMEOUT });
    const cartText = await page.evaluate(
      () =>
        (document.querySelector(".fixed.bottom-0") as HTMLElement | null)
          ?.textContent ?? "",
    );
    const ss = await shot(page, dir, "05-cart-updated");

    return {
      status: cartText.includes("結帳") ? "✅ Pass" : "⚠️ Issue",
      detail: `Cart bar: "${cartText.slice(0, 80).trim()}"`,
      screenshot: ss,
    };
  });

  // ── Step 6: Open CartSheet then CheckoutPage ───────────────────────────────
  await step(
    6,
    "開 Checkout（CartBar → CartSheet → CheckoutPage）",
    async () => {
      // Click CartBar "結帳"
      await clickByText(page, "結帳");
      await new Promise((r) => setTimeout(r, 600));
      const ss6a = await shot(page, dir, "06a-cart-sheet");

      // Click CartSheet "去結帳"
      const went = await clickByText(page, "去結帳");
      if (!went) {
        // Some stores may have different text
        await clickByText(page, "結帳");
      }
      await new Promise((r) => setTimeout(r, 600));

      // Wait for CheckoutPage (has "聯絡資料" section header)
      await page.waitForFunction(
        () => document.body.innerText.includes("聯絡資料"),
        { timeout: TIMEOUT },
      );
      const ss6b = await shot(page, dir, "06b-checkout-page");

      return {
        status: "✅ Pass",
        detail: "CheckoutPage 已開啟，顯示「聯絡資料」",
        screenshot: ss6b,
      };
    },
  );

  // ── Step 7: Fill customer info ─────────────────────────────────────────────
  await step(7, "填寫客人資料", async () => {
    await page.waitForSelector('input[placeholder="陳大文"]', {
      timeout: TIMEOUT,
    });
    await page.focus('input[placeholder="陳大文"]');
    await page.type('input[placeholder="陳大文"]', "測試客人", { delay: 50 });

    await page.focus('input[placeholder="9XXX XXXX"]');
    await page.type('input[placeholder="9XXX XXXX"]', "91234567", {
      delay: 50,
    });

    await new Promise((r) => setTimeout(r, 300));
    const ss = await shot(page, dir, "07-customer-info");

    const nameVal = await page.$eval(
      'input[placeholder="陳大文"]',
      (el) => (el as HTMLInputElement).value,
    );
    const phoneVal = await page.$eval(
      'input[placeholder="9XXX XXXX"]',
      (el) => (el as HTMLInputElement).value,
    );

    return {
      status:
        nameVal === "測試客人" && phoneVal === "91234567"
          ? "✅ Pass"
          : "⚠️ Issue",
      detail: `姓名: "${nameVal}", 電話: "${phoneVal}"`,
      screenshot: ss,
    };
  });

  // ── Step 8: Select delivery ────────────────────────────────────────────────
  await step(8, "揀送貨方式", async () => {
    // Scroll down to delivery section
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("h3")).find((h) =>
        h.textContent?.includes("送貨方式"),
      );
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await new Promise((r) => setTimeout(r, 400));

    // Click first delivery option button
    const deliveryText = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll("h3"));
      const h = headers.find((el) => el.textContent?.includes("送貨方式"));
      if (!h) return null;
      // Get the next sibling div's first button
      const section = h.parentElement;
      const btn = section?.querySelector("button") as HTMLElement | null;
      if (btn) {
        btn.click();
        return btn.textContent?.trim().slice(0, 60) ?? "";
      }
      return null;
    });

    await new Promise((r) => setTimeout(r, 400));
    const ss = await shot(page, dir, "08-delivery");

    return {
      status: deliveryText ? "✅ Pass" : "⚠️ Issue",
      detail: deliveryText ? `已選: "${deliveryText}"` : "找唔到送貨選項",
      screenshot: ss,
    };
  });

  // ── Step 9: Select FPS payment ─────────────────────────────────────────────
  await step(9, "揀 FPS 付款方式", async () => {
    await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll("h3"));
      const h = headers.find((el) => el.textContent?.includes("付款方式"));
      h?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    await new Promise((r) => setTimeout(r, 400));

    // Find and click FPS button
    const fpsClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const fps = btns.find((b) => b.textContent?.includes("FPS"));
      if (fps) {
        fps.click();
        return fps.textContent?.trim().slice(0, 60) ?? "FPS";
      }
      // Fallback: click first payment method
      const headers = Array.from(document.querySelectorAll("h3"));
      const h = headers.find((el) => el.textContent?.includes("付款方式"));
      const section = h?.parentElement;
      const fallback = section?.querySelector("button") as HTMLElement | null;
      if (fallback) {
        fallback.click();
        return `(fallback) ${fallback.textContent?.trim().slice(0, 40)}`;
      }
      return null;
    });

    await new Promise((r) => setTimeout(r, 500));

    // Scroll down to see payment details
    await page.evaluate(() => window.scrollBy(0, 400));
    await new Promise((r) => setTimeout(r, 400));
    const ss = await shot(page, dir, "09-payment-selected");

    return {
      status: fpsClicked ? "✅ Pass" : "⚠️ Issue",
      detail: fpsClicked
        ? `已選: "${fpsClicked}"`
        : "找唔到 FPS 或任何付款選項",
      screenshot: ss,
    };
  });

  // ── Step 10: Verify FPS details ────────────────────────────────────────────
  await step(10, "確認 FPS 收款資料", async () => {
    // Check for payment detail elements
    const hasPaymentSection = await hasText(page, "收款資料");
    const hasRecipient = await hasText(page, "收款人");
    const hasFpsId =
      (await hasText(page, "FPS ID")) || (await hasText(page, "帳號"));
    const hasAmount = await hasText(page, "請轉帳以下金額");

    // Scroll to see details
    await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll("h3")).find((h) =>
        h.textContent?.includes("收款資料"),
      );
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    await new Promise((r) => setTimeout(r, 500));
    const ss = await shot(page, dir, "10-fps-details");

    const found = [];
    if (hasAmount) found.push("轉帳金額");
    if (hasRecipient) found.push("收款人");
    if (hasFpsId) found.push("FPS ID/帳號");
    if (!hasPaymentSection && !hasAmount) {
      return {
        status: "⚠️ Issue",
        detail: "冇顯示收款資料 — 可能 FPS 未設定或店鋪使用其他付款方式",
        screenshot: ss,
      };
    }

    return {
      status: found.length >= 1 ? "✅ Pass" : "⚠️ Issue",
      detail: `已顯示: ${found.join(", ")}`,
      screenshot: ss,
    };
  });

  // ── Cleanup ────────────────────────────────────────────────────────────────
  await page.close();

  return {
    store: storeName,
    url,
    steps,
    consoleErrors,
    totalMs: Date.now() - storeStart,
  };
}

// ── Report writer ─────────────────────────────────────────────────────────────

function writeReport(reports: StoreReport[]) {
  const lines: string[] = [
    "# Checkout Flow Test Report",
    `**Date:** ${new Date().toISOString().slice(0, 10)}`,
    `**Stores tested:** ${reports.map((r) => r.store).join(", ")}`,
    "",
    "---",
    "",
  ];

  for (const r of reports) {
    const pass = r.steps.filter((s) => s.status === "✅ Pass").length;
    const fail = r.steps.filter((s) => s.status === "❌ Fail").length;
    const warn = r.steps.filter((s) => s.status === "⚠️ Issue").length;
    lines.push(`## ${r.store.toUpperCase()}`);
    lines.push(`**URL:** ${r.url}`);
    lines.push(
      `**Result:** ${pass} Pass / ${warn} Issue / ${fail} Fail — ${(r.totalMs / 1000).toFixed(1)}s`,
    );
    lines.push("");

    lines.push("| Step | Name | Status | Detail | Screenshot | Time |");
    lines.push("|------|------|--------|--------|------------|------|");
    for (const s of r.steps) {
      lines.push(
        `| ${s.n} | ${s.name} | ${s.status} | ${s.detail} | \`${s.screenshot}\` | ${s.ms}ms |`,
      );
    }

    if (r.consoleErrors.length > 0) {
      lines.push("");
      lines.push("### Console Errors");
      for (const e of r.consoleErrors) {
        lines.push(`- \`${e.slice(0, 200)}\``);
      }
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push("| Store | Pass | Issue | Fail | Time |");
  lines.push("|-------|------|-------|------|------|");
  for (const r of reports) {
    const pass = r.steps.filter((s) => s.status === "✅ Pass").length;
    const fail = r.steps.filter((s) => s.status === "❌ Fail").length;
    const warn = r.steps.filter((s) => s.status === "⚠️ Issue").length;
    lines.push(
      `| ${r.store} | ${pass}/10 | ${warn} | ${fail} | ${(r.totalMs / 1000).toFixed(1)}s |`,
    );
  }

  return lines.join("\n");
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🧪 Checkout Flow Test — ${RUN_ID}\n`);
  fs.mkdirSync(SS_BASE, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });

  const reports: StoreReport[] = [];

  for (const store of STORES) {
    console.log(`\n▶ Testing ${store.name}...`);
    const report = await testStore(browser, store.name, store.url);
    reports.push(report);

    const pass = report.steps.filter((s) => s.status === "✅ Pass").length;
    const fail = report.steps.filter((s) => s.status === "❌ Fail").length;
    const warn = report.steps.filter((s) => s.status === "⚠️ Issue").length;
    console.log(
      `  ✓ Done: ${pass} pass, ${warn} issue, ${fail} fail — ${(report.totalMs / 1000).toFixed(1)}s`,
    );
    if (report.consoleErrors.length > 0) {
      console.log(`  ⚠ ${report.consoleErrors.length} console error(s)`);
    }
  }

  await browser.close();

  const report = writeReport(reports);
  const reportPath = path.join(
    __dirname,
    "..",
    "docs",
    `${RUN_ID}-checkout-test.html`,
  );
  fs.writeFileSync(reportPath, report, "utf-8");
  console.log(`\n📄 Report: ${reportPath}`);
  console.log(`📸 Screenshots: ${SS_BASE}/`);

  // Print summary
  console.log("\n── Summary ─────────────────────────────────");
  for (const r of reports) {
    const pass = r.steps.filter((s) => s.status === "✅ Pass").length;
    const fail = r.steps.filter((s) => s.status === "❌ Fail").length;
    const warn = r.steps.filter((s) => s.status === "⚠️ Issue").length;
    const icon = fail > 0 ? "❌" : warn > 0 ? "⚠️" : "✅";
    console.log(
      `${icon} ${r.store.padEnd(12)} ${pass}/10 pass  ${(r.totalMs / 1000).toFixed(1)}s`,
    );
  }
}

main().catch(console.error);
