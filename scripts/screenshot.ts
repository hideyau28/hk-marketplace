import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIEWPORT = { width: 393, height: 852, deviceScaleFactor: 3 };

async function takeScreenshot(url: string) {
  // Extract slug from URL path
  const urlObj = new URL(url);
  const slug =
    urlObj.pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-") || "home";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${slug}-${timestamp}.png`;

  const outDir = path.resolve(__dirname, "..", "screenshots");
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
    const filepath = path.join(outDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    console.log(`Screenshot saved: ${filepath}`);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2];
if (!url) {
  console.error("Usage: npx ts-node scripts/screenshot.ts <URL>");
  process.exit(1);
}

takeScreenshot(url).catch((err) => {
  console.error("Screenshot failed:", err);
  process.exit(1);
});
