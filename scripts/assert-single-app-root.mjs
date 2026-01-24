import fs from "fs";

const hasApp = fs.existsSync("app");
const hasSrcApp = fs.existsSync("src/app");

if (hasApp && hasSrcApp) {
  console.error("ERROR: Both app/ and src/app/ exist. Keep only one.");
  console.error("app/:", hasApp ? "EXISTS" : "missing");
  console.error("src/app/:", hasSrcApp ? "EXISTS" : "missing");
  process.exit(1);
}

console.log("OK: Single App Router directory detected");
console.log("app/:", hasApp ? "EXISTS" : "missing");
console.log("src/app/:", hasSrcApp ? "EXISTS" : "missing");
