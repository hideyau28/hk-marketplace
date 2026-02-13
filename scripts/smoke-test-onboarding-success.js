const BASE = 'http://localhost:3000';

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

const tests = [
  {
    name: '/en/start → 唔 500',
    url: `${BASE}/en/start`,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en → baseline 唔壞',
    url: `${BASE}/en`,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en/admin → baseline 唔壞',
    url: `${BASE}/en/admin`,
    expectStatus: [200, 307, 302],
  },
];

async function run() {
  let passed = 0, failed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: 'follow' });
      if (t.expectStatus && !t.expectStatus.includes(res.status)) {
        console.log(`❌ ${t.name} — status ${res.status}`);
        failed++; continue;
      }
      console.log(`✅ ${t.name} — status ${res.status}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${t.name} — ${err.message}`); failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
run();
