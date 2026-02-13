// scripts/smoke-test-landing.js
// Smoke test for platform landing page routing (Protocol V2)
const http = require('http');
const PORT = process.env.PORT || 3000;
const BASE_HOST = 'localhost';

const tests = [
  // --- Task-specific tests (simulate wowlix.com via Host header) ---
  {
    name: 'wowlix.com/en → LandingPage (免費開店)',
    path: '/en',
    host: 'wowlix.com',
    shouldContain: ['免費開店'],
    shouldNotContain: ['bottom-nav'],
    expectStatus: null,
  },
  {
    name: 'wowlix.com/en/admin → 唔 500',
    path: '/en/admin',
    host: 'wowlix.com',
    shouldContain: null,
    shouldNotContain: null,
    expectStatus: [200, 307, 302],
  },
  {
    name: 'wowlix.com/en/start → 唔 500',
    path: '/en/start',
    host: 'wowlix.com',
    shouldContain: null,
    shouldNotContain: null,
    expectStatus: [200, 307, 302],
  },
  // --- Baseline regression routes (localhost, default tenant) ---
  {
    name: '/en → 唔 500',
    path: '/en',
    host: null,
    shouldContain: null,
    shouldNotContain: null,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en/admin → 唔 500',
    path: '/en/admin',
    host: null,
    shouldContain: null,
    shouldNotContain: null,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en/start → 唔 500',
    path: '/en/start',
    host: null,
    shouldContain: null,
    shouldNotContain: null,
    expectStatus: [200, 307, 302],
  },
];

// 移除 <script> tags，避免 JS bundle 造成 false positive
function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

// Node.js fetch() 唔允許 override Host header（forbidden header）
// 用 http.request() 代替
function httpGet(path, customHost) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (customHost) headers['Host'] = customHost;

    const options = {
      hostname: BASE_HOST,
      port: Number(PORT),
      path,
      method: 'GET',
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function run() {
  let passed = 0, failed = 0;

  for (const t of tests) {
    try {
      const res = await httpGet(t.path, t.host);
      const status = res.status;

      // Status check
      if (t.expectStatus && !t.expectStatus.includes(status)) {
        console.log(`\u274c ${t.name} \u2014 status ${status}, expected ${t.expectStatus.join('/')}`);
        failed++;
        continue;
      }

      // For status-only checks
      if (t.expectStatus && !t.shouldContain && !t.shouldNotContain) {
        console.log(`\u2705 ${t.name} (status ${status})`);
        passed++;
        continue;
      }

      const html = stripScripts(res.body).toLowerCase();
      let ok = true;
      const errs = [];

      if (t.shouldContain) {
        const found = t.shouldContain.some(s => html.includes(s.toLowerCase()));
        if (!found) { ok = false; errs.push(`Missing all of: ${t.shouldContain.join(', ')}`); }
      }

      if (t.shouldNotContain) {
        for (const s of t.shouldNotContain) {
          if (html.includes(s.toLowerCase())) {
            ok = false;
            errs.push(`Should NOT contain: "${s}"`);
          }
        }
      }

      if (ok) { console.log(`\u2705 ${t.name}`); passed++; }
      else { console.log(`\u274c ${t.name}`); errs.forEach(e => console.log(`   \u2192 ${e}`)); failed++; }
    } catch (err) {
      console.log(`\u274c ${t.name} \u2014 ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run();
