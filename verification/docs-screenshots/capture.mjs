/**
 * Recapture a user-guide screenshot from the built site.
 *
 * The user-guide's `assets/demo-*.png` are screenshots of the demo fixture, and
 * they go stale silently: the prose around them gets corrected, the fixture gets
 * migrated, and the image keeps teaching whatever the UI looked like on the day
 * it was taken. Nothing validates an image, so this is the only cheap way to
 * bring one back into line.
 *
 * Mechanical only — it proves a page renders and captures what it looks like.
 * Whether the result READS well is a human call; the capture is handed over for
 * that judgement, never assumed good because the script exited 0.
 *
 * Serves the production build rather than the dev server, so the capture has no
 * dev-toolbar chrome and does not depend on a server someone started by hand.
 *
 *   ./start build
 *   NODE_PATH=verification/fixture-render/node_modules \
 *     node verification/docs-screenshots/capture.mjs <route> <out.png> [--dark]
 *
 * Example:
 *   node verification/docs-screenshots/capture.mjs \
 *     /todo/2026-07-01-demo-issue-anatomy-showcase/agent-log/020_au_edge-cases/01_summary/ \
 *     default-docs/data/user-guide/19_issues/assets/demo-agent-log.png
 */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '../..');
const require_ = createRequire(path.join(REPO, 'verification/fixture-render/'));
const { chromium } = require_('playwright');

const [route, out, ...flags] = process.argv.slice(2);
if (!route || !out) {
  console.error('usage: capture.mjs <route> <out.png> [--dark]');
  process.exit(2);
}
const dark = flags.includes('--dark');

// 1440x900 — the size every existing user-guide asset was taken at. A
// replacement at a different size changes the page's rhythm for no reason.
const VIEWPORT = { width: 1440, height: 900 };

const ROOT = path.join(REPO, 'astro-doc-code/dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
                '.webp': 'image/webp', '.json': 'application/json' };

const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(4489, '127.0.0.1', r));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,          // 1x — a retina capture doubles the file for no gain
  colorScheme: dark ? 'dark' : 'light',
});

const res = await page.goto(`http://127.0.0.1:4489${route}`, { waitUntil: 'networkidle' });

// A 404 renders a perfectly good-looking page. Without this the script captures
// it and exits 0, and the asset silently becomes a screenshot of an error.
if (!res || res.status() !== 200) {
  console.error(`FAIL  ${route} returned ${res ? res.status() : 'no response'}`);
  await browser.close(); server.close();
  process.exit(1);
}

// Prove the page is the one asked for, not a redirect or a shell that rendered
// before its content arrived.
const title = await page.title();
const bodyText = (await page.locator('body').innerText()).trim();
if (bodyText.length < 200) {
  console.error(`FAIL  ${route} rendered only ${bodyText.length} chars of text — too empty to be the real page`);
  await browser.close(); server.close();
  process.exit(1);
}

fs.mkdirSync(path.dirname(path.join(REPO, out)), { recursive: true });
await page.screenshot({ path: path.join(REPO, out) });   // viewport, not fullPage — matches the existing assets

await browser.close();
server.close();

console.log(`captured  ${route}`);
console.log(`  title   ${title}`);
console.log(`  theme   ${dark ? 'dark' : 'light'}   viewport ${VIEWPORT.width}x${VIEWPORT.height}`);
console.log(`  text    ${bodyText.length} chars rendered`);
console.log(`  ->      ${out}`);
console.log('\nNOW LOOK AT IT. This proved the page rendered; only a person can say it reads well.');
