import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system/astro-doc-code/dist';
const TYPES = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json',
                '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2', '.jpg':'image/jpeg' };

const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(4477, '127.0.0.1', r));

const BASE = 'http://127.0.0.1:4477/todo/2026-07-01-demo-issue-anatomy-showcase';
const results = [], errors = [];
const say = (n, pass, d='') => results.push(`${pass ? 'PASS' : '**FAIL**'}  ${n}${d ? '  — ' + d : ''}`);

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') errors.push(`${page.url()} :: ${m.text()}`); });
page.on('pageerror', e => errors.push(`${page.url()} :: PAGEERROR ${e.message}`));

for (const p of ['/', '/plans/02_hardening-the-edges/', '/plans/01_shipping-the-sections/',
                 '/agent-log/010_lp_implement-sections/summary/',
                 '/agent-log/010_lp_implement-sections/working/011_research-loader-shapes/',
                 '/agent-log/010_lp_implement-sections/100_wf_codec-migration/working/011_probe-byte-identity/01_report/',
                 '/agent-memory/memory/', '/subtasks/04_verify/00_overview/',
                 '/brainstorm/05_discuss_resolved-example/']) {
  const r = await page.goto(BASE + p, { waitUntil: 'networkidle' });
  say(`loads ${p}`, r.status() === 200, `HTTP ${r.status()}`);
}

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
const plans = await page.evaluate(() => {
  const g = [...document.querySelectorAll('.issue-sidebar__heading')].find(h => h.textContent.includes('Plans'));
  const box = g?.closest('details');
  const pinned = box?.querySelector('.issue-sidebar__item.is-pinned');
  return { groupExists: !!g, pinnedHref: pinned?.getAttribute('href') ?? null,
           pinnedText: pinned?.textContent.trim().replace(/\s+/g,' ') ?? null,
           planCount: box ? box.querySelectorAll('.issue-sidebar__item').length : 0 };
});
say('Plans sidebar group exists', plans.groupExists);
say('active plan is pinned', !!plans.pinnedHref?.includes('02_hardening-the-edges'), plans.pinnedText);
say('both plans listed', plans.planCount === 2, `${plans.planCount} items`);

const before = await page.evaluate(() => document.querySelector('.issue-main')?.textContent.slice(0,60));
await page.evaluate(() => {
  const h = [...document.querySelectorAll('.issue-sidebar__heading')].find(x => x.textContent.includes('Plans'));
  h?.closest('details')?.setAttribute('open','');
});
await page.click('.issue-sidebar__item.is-pinned');
await page.waitForLoadState('networkidle');
const after = await page.evaluate(() => ({
  url: location.pathname,
  rows: document.querySelectorAll('.issue-plan__table tbody tr').length,
  statuses: [...document.querySelectorAll('.issue-plan__state')].map(e => e.dataset.tip),
  counts: document.querySelectorAll('.issue-plan__count').length,
  warn: !!document.querySelector('.issue-plan__warning'),
  head: document.querySelector('.issue-main')?.textContent.slice(0,60),
}));
say('click navigates to the plan page', after.url.includes('02_hardening-the-edges'), after.url);
say('the click changed the DOM', before !== after.head);
say('plan table: one row per stage', after.rows === 3, `${after.rows} rows`);
say('status column populated', after.statuses.length === 3 && after.statuses.every(Boolean), after.statuses.join(', '));
say('subtask counts rendered live', after.counts > 0, `${after.counts} badges`);
say('no broken-reference warning', !after.warn);

await page.goto(BASE + '/agent-log/010_lp_implement-sections/summary/', { waitUntil: 'networkidle' });
const log = await page.evaluate(() => {
  const box = [...document.querySelectorAll('.issue-sidebar__heading')]
    .find(h => h.textContent.includes('Agent log'))?.closest('details');
  const t = box?.textContent ?? '';
  return { summary: t.includes('summary'), working: t.includes('working'), debrief: t.includes('debrief'),
           child: /codec[\s-]migration/.test(t), active: !!box?.querySelector('.is-active') };
});
say('agent log shows summary.md', log.summary);
say('agent log shows working/', log.working);
say('agent log shows debrief/', log.debrief);
say('child agent log listed', log.child);
say('active sub-doc marked', log.active);

const past = await page.goto(BASE + '/brainstorm/04_nesting-demo/02_layer-two/03_layer-three/04_layer-four/05_layer-five/06_layer-six/01_over/', { waitUntil: 'domcontentloaded' });
say('past the depth cap 404s', past.status() === 404, `HTTP ${past.status()}`);

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(`\nCONSOLE ERRORS: ${errors.length}`);
errors.slice(0,10).forEach(e => console.log('  ' + e));
