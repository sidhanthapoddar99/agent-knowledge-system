#!/usr/bin/env bun
/**
 * check-links.mjs — do the links this engine RENDERS actually resolve?
 *
 * DEVELOPMENT-STAGE TOOL. It belongs to this repo and never ships to a
 * consumer: it needs a running server, which a consumer authoring documents does
 * not have and should never be asked for. See CLAUDE.md → "Three stages".
 *
 * WHY IT ASKS A DIFFERENT QUESTION FROM `agent-ks check link-form`.
 * That gate reads markdown and asks *is this link maintainable, and does its
 * target exist on disk* — a question about FILES, and the plugin's to own.
 * This one asks *does the engine turn a correct file reference into a URL that
 * works* — a question about the RENDERER. Both answers can differ: 418 links
 * once 404'd on the site while every one of them was correct on disk.
 *
 * WHY A RUNNING SERVER RATHER THAN `dist/`. This is the whole point, and it is
 * the mistake the previous checker made. A built page is a directory served with
 * a TRAILING SLASH; the dev server serves the same page WITHOUT one. That single
 * segment changes what every relative href resolves to — so reading `dist/` off
 * the filesystem answers a question nobody asked, and it silently disagrees with
 * the environment the author is actually looking at. Every number this group
 * produced from `dist/` had to be retracted.
 *
 * So: fetch real URLs over HTTP, read the real status, and — with two servers —
 * DIFF them. A link that works in one and not the other is the finding.
 *
 * THE THIRD ENVIRONMENT, and it is the one that ships. `astro dev` and
 * `astro preview` are APPLICATION servers: they match a route table and serve
 * `/a/b` as asked. A static host is a FILE server: `/a/b` is a directory on disk
 * (every page builds as `<slug>/index.html`), and the web's oldest convention
 * says a directory requested without a trailing slash must 301 to the slash form
 * — a rule that exists precisely so relative links resolve correctly.
 *
 * So there are THREE behaviours, not two, and Astro's own servers do not
 * reproduce the deployed one. Testing dev against preview is testing one
 * environment twice. `--static <dir>` exists so the shipped behaviour is one
 * flag away rather than a thing you remember to set up.
 *
 * WHAT IT CHECKS THAT A FILE-LEVEL GATE CANNOT
 *   - the renderer's own transform (a correct file link emitted as a wrong href)
 *   - generated heading IDs — `#doesn't-require` becomes `doesn39t`
 *   - links the LAYOUT generates, which exist in no markdown file at all
 *     (sidebar, pagination, `/blog/tag/…`)
 *   - routing: redirects, dual-slug resolution, and 404-vs-200 status
 *
 * Usage:
 *   ./start dev      &  scripts/check-links.mjs --base http://localhost:4321
 *   ./start preview  &  scripts/check-links.mjs --base http://localhost:4321
 *   scripts/check-links.mjs --base http://localhost:4321 --compare http://localhost:4322
 *
 *   --base <url>      server to crawl (required)
 *   --compare <url>   second server; report links whose verdict DIFFERS
 *   --start <path>    seed path, repeatable (default: /)
 *   --body-only       ignore links outside <article> (default: check everything)
 *   --no-anchors      skip fragment checking
 *   --max <n>         page cap, a runaway guard (default 5000)
 *   --timeout <ms>    per-request timeout (default 10000)
 *   --static <dir>    serve <dir> internally like a REAL STATIC HOST and use it
 *                     as --base. This is the environment that ships and the one
 *                     neither `astro dev` nor `astro preview` reproduces — see
 *                     THE THIRD ENVIRONMENT below.
 *   --json
 *
 * Exit 0 = every link resolved, 1 = at least one did not.
 */

const args = process.argv.slice(2);
const flag = (name, fallback = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const STATIC_DIR = flag('static');
const BASE = flag('base');
const COMPARE = flag('compare');
const BODY_ONLY = has('body-only');
const CHECK_ANCHORS = !has('no-anchors');
const MAX_PAGES = Number(flag('max', '5000'));
/**
 * Every request is timed out. Without this a dead port hangs the run forever,
 * which is worse than a wrong answer: a gate that never returns is a gate nobody
 * runs. Found by pointing the first version at a closed port — it never came
 * back.
 */
const TIMEOUT_MS = Number(flag('timeout', '10000'));
const JSON_OUT = has('json');
const SEEDS = args.reduce((acc, a, i) => (a === '--start' ? [...acc, args[i + 1]] : acc), []);

if (!BASE && !STATIC_DIR) {
  console.error('check-links.mjs: --base <url> or --static <dir> is required.\n');
  console.error('  The environment that SHIPS is a static host, and neither astro dev nor');
  console.error('  astro preview reproduces it. Check that one first:');
  console.error('    ./scripts/check-links.mjs --static astro-doc-code/dist --body-only\n');
  console.error('  Start a server first, then point this at it:');
  console.error('    ./start dev      & scripts/check-links.mjs --base http://localhost:4321');
  console.error('    ./start preview  & scripts/check-links.mjs --base http://localhost:4321\n');
  console.error('  Two servers at once? --compare <url> reports only the links they DISAGREE on,');
  console.error('  which is the dev-vs-built trailing-slash question this script exists for.');
  process.exit(2);
}

// ── a stand-in for the deployed host ───────────────────────────────────────

/**
 * Serve a directory the way an ordinary static host does — including the one
 * behaviour that matters here: **a directory requested without a trailing slash
 * 301s to the slash form**, and only then is `index.html` served.
 *
 * Deliberately not a general-purpose file server. It reproduces the deployed
 * contract and nothing more, so the check is about the site rather than about
 * whichever server someone happened to install.
 */
async function serveStatic(dir) {
  const http = await import('node:http');
  const fsp = await import('node:fs/promises');
  const nodePath = await import('node:path');
  const root = nodePath.resolve(dir);

  const TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf',
  };

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    let rel = decodeURIComponent(url.pathname);
    const abs = nodePath.join(root, rel);
    if (!abs.startsWith(root)) { res.writeHead(403).end(); return; }

    let stat = null;
    try { stat = await fsp.stat(abs); } catch { /* falls through to 404 */ }

    // THE RULE THIS SERVER EXISTS FOR.
    if (stat?.isDirectory() && !rel.endsWith('/')) {
      res.writeHead(301, { Location: rel + '/' + url.search }).end();
      return;
    }

    const file = stat?.isDirectory() ? nodePath.join(abs, 'index.html') : abs;
    try {
      const body = await fsp.readFile(file);
      res.writeHead(200, { 'content-type': TYPES[nodePath.extname(file).toLowerCase()] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404, { 'content-type': 'text/html' }).end('<h1>404</h1>');
    }
  });

  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() };
}

// ── the crawl ──────────────────────────────────────────────────────────────
// One host, breadth-first from the seeds. Only same-origin HTML is followed;
// every other reference is fetched once and judged, never crawled.

const ANCHOR = /<a\b[^>]*?\bhref\s*=\s*("([^"]*)"|'([^']*)')/gi;
const ARTICLE = /<article\b[^>]*>([\s\S]*?)<\/article>/i;
/** id="x" or name="x" — what a fragment has to land on. */
const IDS = /\b(?:id|name)\s*=\s*("([^"]*)"|'([^']*)')/gi;

const SKIP_SCHEME = /^(https?:|mailto:|tel:|data:|javascript:|#)/i;

/** Fetch once, remember. Returns { status, html, ids } — html only for HTML. */
function makeFetcher(origin) {
  const cache = new Map();
  return async function get(pathname) {
    if (cache.has(pathname)) return cache.get(pathname);
    let entry;
    try {
      const res = await fetch(origin + pathname, { redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
      const type = res.headers.get('content-type') ?? '';
      const isHtml = type.includes('text/html');
      const html = isHtml ? await res.text() : null;
      entry = {
        status: res.status,
        // A redirect that lands somewhere real is a PASS — dual-slug resolution
        // and the plan aliases are features, and this must not report them.
        finalPath: new URL(res.url).pathname,
        html,
        ids: html ? collectIds(html) : null,
      };
    } catch (e) {
      entry = { status: 0, error: String(e?.message ?? e), finalPath: pathname, html: null, ids: null };
    }
    cache.set(pathname, entry);
    return entry;
  };
}

function collectIds(html) {
  const out = new Set();
  IDS.lastIndex = 0;
  let m;
  while ((m = IDS.exec(html)) !== null) out.add(m[2] ?? m[3] ?? '');
  return out;
}

function extract(html) {
  ANCHOR.lastIndex = 0;
  const out = [];
  let m;
  while ((m = ANCHOR.exec(html)) !== null) out.push(m[2] ?? m[3] ?? '');
  return out;
}

/**
 * CRAWLING AND REPORTING ARE DIFFERENT SETS, and conflating them is a trap the
 * first version fell into: with `--body-only` the crawl followed only body
 * links, so it never left the home page (a custom layout with no `<article>`)
 * and reported zero links checked.
 *
 * Always follow EVERY link to discover pages — the sidebar is how a docs site is
 * navigable at all. `--body-only` narrows what gets REPORTED, because sidebar
 * and pagination links are generated and identical on every page, so a single
 * broken one would otherwise be reported hundreds of times.
 */
function hrefsIn(html) {
  const all = extract(html);
  if (!BODY_ONLY) return { all, report: all };
  const article = html.match(ARTICLE)?.[1];
  return { all, report: article ? extract(article) : [] };
}

/**
 * Crawl one origin. Returns a Map of `page → [{ href, resolved, verdict }]`,
 * where verdict is 'ok' | 'status:<n>' | 'anchor' | 'error:<msg>'.
 */
async function crawl(origin) {
  const get = makeFetcher(origin);
  const seen = new Set();
  const queue = SEEDS.length ? [...SEEDS] : ['/'];
  const results = new Map();
  let pages = 0;

  while (queue.length && pages < MAX_PAGES) {
    const pagePath = queue.shift();
    if (seen.has(pagePath)) continue;
    seen.add(pagePath);

    const page = await get(pagePath);
    if (!page.html) continue;

    /**
     * RESOLVE AGAINST THE FINAL URL, NOT THE ONE WE ASKED FOR — this is the
     * whole trailing-slash trap, and the first version of this script walked
     * straight into it. The server 301s `/a/b` to `/a/b/`; a browser then
     * resolves `../x` against `/a/b/`, not `/a/b`. Using the requested path
     * reported 539 false failures on a site with none.
     *
     * It is also the reason this tool exists: that redirect is invisible to
     * anything reading `dist/` off the filesystem.
     */
    const basePath = page.finalPath;
    if (basePath !== pagePath) {
      if (seen.has(basePath)) continue;
      seen.add(basePath);
    }
    pages++;

    const { all, report } = hrefsIn(page.html);
    const reportable = new Set(report);
    const findings = [];
    for (const href of all) {
      const shouldReport = reportable.has(href);
      if (!href || SKIP_SCHEME.test(href)) {
        // A pure `#frag` still deserves checking — against THIS page.
        if (shouldReport && CHECK_ANCHORS && href.startsWith('#') && href.length > 1) {
          const id = decodeURIComponent(href.slice(1));
          findings.push({ href, resolved: basePath + href, verdict: page.ids?.has(id) ? 'ok' : 'anchor' });
        }
        continue;
      }

      let url;
      try { url = new URL(href, origin + basePath); } catch { continue; }
      if (url.origin !== new URL(origin).origin) continue;   // external, not ours

      const target = await get(url.pathname);
      let verdict;
      if (target.status === 0) verdict = `error:${target.error}`;
      else if (target.status >= 400) verdict = `status:${target.status}`;
      else if (CHECK_ANCHORS && url.hash.length > 1) {
        const id = decodeURIComponent(url.hash.slice(1));
        verdict = target.ids?.has(id) ? 'ok' : 'anchor';
      } else verdict = 'ok';

      if (shouldReport) findings.push({ href, resolved: url.pathname + url.hash, verdict });

      // Follow every page regardless of whether it is reportable — discovery and
      // reporting are separate concerns (see hrefsIn).
      if (target.html && !seen.has(url.pathname)) queue.push(url.pathname);
    }
    results.set(basePath, findings);
  }

  if (pages >= MAX_PAGES) console.error(`⚠ page cap ${MAX_PAGES} reached — coverage is PARTIAL. Raise --max.`);
  return { results, pages };
}

// ── run ────────────────────────────────────────────────────────────────────

let staticServer = null;
let baseOrigin = BASE;
if (STATIC_DIR) {
  staticServer = await serveStatic(STATIC_DIR);
  baseOrigin = staticServer.origin;
  console.log(`# serving ${STATIC_DIR} as a static host at ${baseOrigin}\n`);
}

const primary = await crawl(baseOrigin);

// A run that inspected nothing must FAIL, never pass. Both sibling gates fell
// into exactly this trap — printing "all checks passed" over files they had
// never opened — so the assertion is cheap and non-negotiable.
const totalLinks = [...primary.results.values()].reduce((n, f) => n + f.length, 0);
const fatal = [];
if (primary.pages === 0) fatal.push(`no HTML pages reachable at ${BASE} — is the server running?`);
else if (totalLinks === 0) fatal.push(`${primary.pages} page(s) crawled but ZERO links found — the extractor is broken, this proves nothing`);

const broken = [];
for (const [page, findings] of primary.results) {
  for (const f of findings) if (f.verdict !== 'ok') broken.push({ page, ...f });
}

/**
 * THE COMPARE KEY MUST IGNORE THE TRAILING SLASH — getting this wrong made the
 * feature incapable of reporting the only thing it exists to report.
 *
 * Pages are keyed by their FINAL url after redirects. A trailing-slash host
 * turns `/a/b` into `/a/b/`, so keyed naively no page on one side ever matches
 * its counterpart: every lookup returns undefined and every disagreement is
 * silently discarded. Measured before the fix — 162 links broken on one side, 0
 * on the other, ZERO disagreements reported.
 *
 * That is the same shape as the `dist/`-reading tool this script replaced — a
 * check that cannot fail — sitting inside the replacement. Found by an
 * independent audit, 2026-08-04.
 */
const sameKey = (p, h) => `${p.replace(/\/+$/, '') || '/'}\u0001${h}`;

let disagreements = [];
let compareStats = null;
if (COMPARE && !fatal.length) {
  const other = await crawl(COMPARE);
  const otherVerdict = new Map();
  for (const [page, findings] of other.results) for (const f of findings) otherVerdict.set(sameKey(page, f.href), f.verdict);

  let matched = 0;
  for (const [page, findings] of primary.results) {
    for (const f of findings) {
      const v = otherVerdict.get(sameKey(page, f.href));
      if (v === undefined) continue;
      matched++;
      if (v !== f.verdict) disagreements.push({ page, href: f.href, base: f.verdict, compare: v });
    }
  }
  compareStats = { pages: other.pages, matched };

  // A comparison that lined up nothing compared nothing. Without this the run
  // prints a confident pass having matched zero pairs — which is exactly how the
  // un-normalised key hid 162 failures.
  if (otherVerdict.size > 0 && matched === 0) {
    fatal.push(
      `compared ${primary.pages} page(s) against ${other.pages} and ZERO links lined up — ` +
      `the two crawls share no common keys, so this comparison proves nothing`,
    );
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({ base: BASE, compare: COMPARE, pages: primary.pages, links: totalLinks, compareStats, fatal, broken, disagreements }, null, 2));
  process.exit(fatal.length || broken.length || disagreements.length ? 1 : 0);
}

console.log(`# rendered-link check: ${STATIC_DIR ? `static:${STATIC_DIR}` : BASE}${COMPARE ? `  vs  ${COMPARE}` : ''}`);
console.log(`(${primary.pages} page(s), ${totalLinks} link(s) checked${BODY_ONLY ? ', <article> only' : ''}${CHECK_ANCHORS ? ', anchors included' : ''})\n`);

for (const f of fatal) console.log(`  ✗ ${f}`);

if (broken.length) {
  console.log(`## ${broken.length} broken link(s)\n`);
  for (const b of broken) {
    const why = b.verdict === 'anchor' ? 'page exists, no such anchor' : b.verdict;
    console.log(`  ✗ ${b.page} → ${b.href}   resolves ${b.resolved}   — ${why}`);
  }
  console.log();
}

if (disagreements.length) {
  console.log(`## ${disagreements.length} link(s) the two servers DISAGREE on\n`);
  console.log(`  This is the trailing-slash question: a built page is served as a directory`);
  console.log(`  with a slash, the dev server serves it without. A constant offset cannot be`);
  console.log(`  right in both.\n`);
  for (const d of disagreements) console.log(`  ≠ ${d.page} → ${d.href}   base=${d.base}   compare=${d.compare}`);
  console.log();
}

if (!fatal.length && !broken.length && !disagreements.length) console.log('✓ all checks passed');
staticServer?.close();
process.exit(fatal.length || broken.length || disagreements.length ? 1 : 0);
