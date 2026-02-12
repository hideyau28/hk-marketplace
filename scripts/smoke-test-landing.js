const BASE = process.env.BASE_URL || 'http://localhost:3012';
const tests = [
  { name: '/en → Landing page', url: `${BASE}/en`, shouldContain: ['免費開店', 'wowlix'], shouldNotContain: ['bottom-nav', 'preview-banner'] },
  { name: '/en/maysshop → Store', url: `${BASE}/en/maysshop`, shouldContain: ['may'], shouldNotContain: ['免費開店'] },
  { name: '/en/admin → Admin', url: `${BASE}/en/admin`, shouldContain: ['admin', 'login'] },
  { name: '/en/start → Onboarding', url: `${BASE}/en/start`, shouldContain: ['onboarding', '開店', 'shop', 'start'] },
];
async function run() {
  let passed = 0, failed = 0;
  for (const t of tests) {
    try {
      const res = await fetch(t.url, { redirect: 'follow' });
      const html = (await res.text()).toLowerCase();
      let ok = true; const errs = [];
      if (t.shouldContain) { if (!t.shouldContain.some(s => html.includes(s.toLowerCase()))) { ok = false; errs.push(`Missing: ${t.shouldContain.join(', ')}`); } }
      if (t.shouldNotContain) { for (const s of t.shouldNotContain) { if (html.includes(s.toLowerCase())) { ok = false; errs.push(`Should NOT have: "${s}"`); } } }
      if (ok) { console.log(`✅ ${t.name}`); passed++; } else { console.log(`❌ ${t.name}`); errs.forEach(e => console.log(`   → ${e}`)); failed++; }
    } catch (err) { console.log(`❌ ${t.name} — ${err.message}`); failed++; }
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
run();
