import fs from "node:fs";

const pairs = [
  ["app", "src/app"],
  ["lib", "src/lib"],
  ["components", "src/components"],
  ["messages", "src/messages"],
];

let ok = true;

for (const [a, b] of pairs) {
  const hasA = fs.existsSync(a);
  const hasB = fs.existsSync(b);

  if (hasA && hasB) {
    console.error(`ERROR: Duplicate sources detected: "${a}" and "${b}" both exist. Keep ONE only.`);
    ok = false;
  } else {
    console.log(`OK: "${a}" = ${hasA ? "EXISTS" : "missing"} | "${b}" = ${hasB ? "EXISTS" : "missing"}`);
  }
}

if (!ok) process.exit(1);
