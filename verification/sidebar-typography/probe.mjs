/**
 * Probe — the issue sidebar is one font size, and its labels are sentence case.
 *
 * Both are presentation rules with a silent failure mode. `::first-letter` only
 * applies to a block container, and `.issue-sidebar__label` is a `<span>` that
 * is only blockified because it is a flex item — if that ever stops being true
 * the rule is simply ignored and every label goes back to lowercase with
 * nothing reporting it. Same for the sizes: a stray `--ui-text-body` reads as a
 * deliberate emphasis rather than a leftover.
 *
 * Mechanical yes/no on a real engine, which is the only thing that can answer
 * "did this selector actually match". Not a judgement about how it looks.
 *
 * Needs a build, and borrows Playwright from the fixture-render harness:
 *
 *   ./start build
 *   NODE_PATH=verification/fixture-render/node_modules \
 *     node verification/sidebar-typography/probe.mjs
 */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '../..');
const require_ = createRequire(path.join(REPO, 'verification/fixture-render/'));
const { chromium } = require_('playwright');

const ROOT = path.join(REPO, 'astro-doc-code/dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
                '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png' };

const server = http.createServer((req, res) => {
  let p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(4488, '127.0.0.1', r));

const ISSUE = 'http://127.0.0.1:4488/todo/2026-07-01-demo-issue-anatomy-showcase';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`${ISSUE}/`);

const measure = () => page.evaluate(() => {
  const px = (el, pseudo) => (el ? getComputedStyle(el, pseudo ?? null) : null);
  // A label whose SOURCE text starts lowercase — the only kind that can prove
  // the transform fired. Picking any label would pass on an authored title that
  // was already capitalised, which is a check that cannot fail.
  const lower = (sel) => [...document.querySelectorAll(sel)]
    .find((e) => /^[a-z]/.test(e.textContent.trim()));
  const read = (el) => (el ? {
    text: el.textContent.trim().slice(0, 24),
    display: px(el).display,
    firstLetterTransform: px(el, '::first-letter').textTransform,
    size: px(el).fontSize,
  } : null);
  const size = (sel) => { const el = document.querySelector(sel); return el ? px(el).fontSize : null; };
  return {
    label: read(lower('.issue-sidebar__label')),
    folder: read(lower('.issue-sidebar__subgroup-name')),
    // Both rails, in one set. They flank the same page and are both dense
    // navigation, so they are one size — a TOC larger than the tree opposite it
    // reads as the more important of the two.
    sizes: {
      sectionHeading: size('.issue-sidebar__heading'),
      folderRow: size('.issue-sidebar__subgroup-heading'),
      fileRow: size('.issue-sidebar__item'),
      number: size('.issue-sidebar__num'),
      rightRailToc: size('.issue-meta-toc__link'),
      rightRailIndex: size('.issue-meta-index__link'),
    },
    // The leading glyph column — the BOX each icon occupies, measured, not the
    // declared width. A drawing may be any size inside it; what has to be
    // constant is the slot, or the text after it starts at a different x.
    glyphs: Object.fromEntries(['chevron', 'icon', 'check', 'kind', 'heading-icon']
      .map((k) => {
        const el = document.querySelector(`.issue-sidebar__${k}`);
        return [k, el ? +el.getBoundingClientRect().width.toFixed(2) : null];
      })),
    // Read in the SAME pass as the sizes it controls. A control taken from a
    // second page load, or after the server is closed, is measuring something
    // else and will happily certify a dead check.
    mainTitleSize: size('.issue-main__title'),
    // CONTROL for the glyph check: a trailing glyph is deliberately NOT in the
    // column, so a comparison that finds everything equal is caught.
    trailingGlyph: (() => {
      const el = document.querySelector('.issue-sidebar__count');
      return el ? +el.getBoundingClientRect().width.toFixed(2) : null;
    })(),
  };
});

// The detail page carries the subtask/comment INDEX in its right rail; a
// sub-doc page carries the TOC. Neither page has both, so measuring one page
// would leave half the rail unchecked — and an unmeasured selector reads as
// `null`, which a size comparison silently ignores. Merge the two.
const seen = await measure();
await page.goto(`${ISSUE}/plans/02_hardening-the-edges/`);
const onPlanPage = await measure();
for (const [k, v] of Object.entries(onPlanPage.sizes)) {
  if (seen.sizes[k] === null) seen.sizes[k] = v;
}

await browser.close();
server.close();

const results = [];
let failed = 0;
const say = (n, pass, d = '') => { if (!pass) failed++; results.push(`${pass ? 'PASS' : '**FAIL**'}  ${n}${d ? '  — ' + d : ''}`); };

say('found a lowercase-source file label to test', !!seen.label, JSON.stringify(seen.label));
say('found a lowercase-source folder label to test', !!seen.folder, JSON.stringify(seen.folder));

for (const [what, got] of [['file label', seen.label], ['folder label', seen.folder]]) {
  if (!got) continue;
  // The transform only applies to a block container — assert the blockification
  // as well as the declaration, because the declaration alone is not the effect.
  say(`${what} is a block container`, got.display === 'block', got.display);
  say(`${what} uppercases its first letter`, got.firstLetterTransform === 'uppercase', got.firstLetterTransform);
}

// `null` means the selector never rendered on either page. Dropping those
// silently would let the check pass on one measurement, so the count is
// asserted first.
const measured = Object.entries(seen.sizes).filter(([, v]) => v !== null);
const sizes = measured.map(([, v]) => v);
say('every row selector was measured somewhere',
  measured.length === Object.keys(seen.sizes).length, JSON.stringify(seen.sizes));
say('both rails are one size', new Set(sizes).size === 1, JSON.stringify(seen.sizes));

// The glyph column. `present` guards against the check passing on a page where
// none of these rendered — one measured width is trivially "all equal".
const glyphs = Object.entries(seen.glyphs).filter(([, w]) => w !== null);
say('at least two leading glyph kinds were on the page', glyphs.length >= 2,
  JSON.stringify(seen.glyphs));
say('every leading glyph occupies the same width',
  new Set(glyphs.map(([, w]) => w)).size === 1, JSON.stringify(seen.glyphs));
say('CONTROL a trailing element is NOT in the glyph column',
  seen.trailingGlyph !== null && seen.trailingGlyph !== glyphs[0]?.[1],
  `glyph ${glyphs[0]?.[1]} vs count chip ${seen.trailingGlyph}`);

// CONTROL — the size comparison must be able to fail. The main column's title
// is deliberately a different size, so a comparison that always reports "equal"
// is caught here rather than certifying a sidebar it never measured.
say('CONTROL sizes differ where they are meant to',
  seen.mainTitleSize !== null && seen.mainTitleSize !== sizes[0],
  `sidebar ${sizes[0]} vs main title ${seen.mainTitleSize}`);

console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} assertions passed`);
process.exit(failed === 0 ? 0 : 1);
