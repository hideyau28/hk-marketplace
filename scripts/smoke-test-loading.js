const BASE = 'http://localhost:3000';

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

const tests = [
  {
    name: '/en → 冇 store skeleton padding',
    url: `${BASE}/en`,
    shouldNotContain: ['pb-[calc(96px'],
    expectStatus: [200],
  },
  {
    name: '/en → 唔 500',
    url: `${BASE}/en`,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en/admin → 唔 500',
    url: `${BASE}/en/admin`,
    expectStatus: [200, 307, 302],
  },
  {
    name: '/en/start → 唔 500',
    url: `${BASE}/en/start`,
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
      const rawHtml = await res.text();
      const html = stripScripts(rawHtml).toLowerCase();
      let ok = true;
      const errs = [];
      if (t.shouldNotContain) {
        for (const s of t.shouldNotContain) {
          if (html.includes(s.toLowerCase())) {
            ok = false; errs.push(`Should NOT contain: "${s}"`);
          }
        }
      }
      if (ok) { console.log(`✅ ${t.name}`); passed++; }
      else { console.log(`❌ ${t.name}`); errs.forEach(e => console.log(`   → ${e}`)); failed++; }
    } catch (err) {
      console.log(`❌ ${t.name} — ${err.message}`); failed++;
    }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
run();
