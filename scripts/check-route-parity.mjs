#!/usr/bin/env bun
/**
 * check-route-parity.mjs — do dev and the build resolve the same URL the same way?
 *
 * DEVELOPMENT-STAGE TOOL. Needs the framework source, a dev server and a
 * `dist/`, none of which a consumer authoring documents has. See CLAUDE.md →
 * "Three stages".
 *
 * WHY IT EXISTS. Two pieces of code know the URL space, and they are not the
 * same piece:
 *
 *   src/pages/lib/route-match.ts    resolves a REQUEST   (dev / SSR)
 *   src/pages/lib/static-paths.ts   enumerates the SET   (build)
 *
 * They share the URL *spellings* — `static-paths` imports `sourceFormSlug`,
 * `canonicalContentUrl` and `planStageAliasUrl` from `route-match`. What they do
 * NOT share is the traversal: which URLs exist at all. Nothing forces those two
 * walks to agree, and a disagreement is invisible from either side alone. You
 * find it when a link works locally and 404s on the deployed site.
 *
 * WHAT IT COMPARES, and why it is not the same question as check-links.mjs.
 * `check-links.mjs` crawls hrefs that appear in rendered pages and asks whether
 * they resolve. That misses precisely the URLs at issue here: an address the
 * BUILD emits that dev refuses, or one dev serves that the build never wrote.
 * Neither has to appear as an href anywhere. So this harness enumerates from
 * `buildStaticPaths` — the build's own source of truth — and checks every entry
 * against a running dev server AND against the files on disk in `dist/`.
 *
 * It also probes URLs that should NOT resolve, because "the set of addresses
 * that must 404" is the half nothing enumerates and the half that produced this
 * stage's two reported defects.
 *
 * THREE OUTCOMES PER URL, and only the third is a finding:
 *   agree        dev and dist tell the same story (page, or redirect to the same target)
 *   explained    they differ for a reason this script states — see EXPECTED below
 *   DIVERGE      they differ and nothing accounts for it
 *
 * Usage:
 *   ./start build && ./start dev &
 *   scripts/check-route-parity.mjs --base http://localhost:4321
 *   scripts/check-route-parity.mjs --base http://localhost:4321 --json
 *   scripts/check-route-parity.mjs --base http://localhost:4321 --limit 200
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FRAMEWORK = path.join(REPO, 'astro-doc-code');

// Dependencies live in the framework's node_modules — this script has no
// package.json of its own and should not grow one.
const yaml = createRequire(path.join(FRAMEWORK, 'package.json'))('js-yaml');
const DIST = path.join(FRAMEWORK, 'dist');

const argv = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};
const BASE = (arg('base', 'http://localhost:4321')).replace(/\/+$/, '');
const JSON_OUT = argv.includes('--json');
const LIMIT = Number(arg('limit', '0')) || Infinity;
const CONCURRENCY = Number(arg('concurrency', '16'));

// ---------------------------------------------------------------- bootstrap
// Mirrors astro.config.mjs: CONFIG_DIR from .env, then the two-phase initPaths.
// Without this, `@themes` never resolves and loadSiteConfig throws.
function readEnv() {
  const envPath = path.join(REPO, '.env');
  if (!fs.existsSync(envPath)) return {};
  return Object.fromEntries(
    fs.readFileSync(envPath, 'utf-8').split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
}

const env = readEnv();
if (!env.CONFIG_DIR) {
  console.error('  CONFIG_DIR is not set in .env — cannot locate site.yaml.');
  process.exit(2);
}
const configDir = path.resolve(REPO, env.CONFIG_DIR);
process.env.CONFIG_DIR = configDir;

const { initPaths } = await import(path.join(FRAMEWORK, 'src/loaders/paths.ts'));
const rawSite = yaml.load(fs.readFileSync(path.join(configDir, 'site.yaml'), 'utf-8'));
initPaths({ paths: rawSite?.paths, configDir });

const { loadSiteConfig } = await import(path.join(FRAMEWORK, 'src/loaders/config.ts'));
const { buildStaticPaths } = await import(path.join(FRAMEWORK, 'src/pages/lib/static-paths.ts'));

const siteConfig = loadSiteConfig();
const enumerated = await buildStaticPaths(siteConfig);

// ---------------------------------------------------------------- expectations
/**
 * Differences this script accounts for, each with the reason. An entry here is
 * a claim that the difference is CORRECT — not a way to silence a failure.
 */
const EXPECTED = [
  {
    id: 'dev-lenient-under-plan',
    why:
      'A path under a plan folder that names no stage redirects to the plan page in dev ' +
      '(planStageAliasTarget final return). The build cannot emit an alias for a name that ' +
      'does not exist, so it 404s. Dev is deliberately lenient so a relative link to any ' +
      'file in the plan folder lands somewhere useful.',
    match: (u, dev, dist) => dist.kind === 'absent' && dev.status === 302 && /\/plans\//.test(u),
  },
  {
    id: 'dotted-segment-needs-trailing-slash',
    why:
      'A final segment containing a dot (an artifact page, `03_docs.html`) is a FILE request to ' +
      'astro dev, so the bare form never reaches the page route. The build writes it as a ' +
      'directory and a static host 301s the bare form to the slash form. Same target once the ' +
      'slash is there — an environment difference, not a resolver disagreement.',
    // Matched in classify() via dev.viaTrailingSlash rather than here, because it
    // needs the retry result; listed here so the reason is printed with the rest.
    match: () => false,
  },
  {
    id: 'docs-not-found-renders-shell',
    why:
      'An unknown docs slug renders the sidebar shell with a 404 STATUS rather than a bare ' +
      '404 body, so the tree stays navigable while a file is mid-edit. The build writes no ' +
      'file, so a static host answers its own 404. Both say "not found"; only the body differs.',
    match: (u, dev, dist) => dist.kind === 'absent' && dev.status === 404,
  },
];

// ---------------------------------------------------------------- dist reader
const distFile = (slug) => {
  const rel = slug === undefined || slug === '' ? 'index.html' : path.join(slug, 'index.html');
  return path.join(DIST, rel);
};

const REDIRECT_TARGET = /<link rel="canonical" href="([^"]*)"/;

function readDist(slug) {
  const f = distFile(slug);
  if (!fs.existsSync(f)) return { kind: 'absent' };
  const size = fs.statSync(f).size;
  // Astro writes a redirect as a small meta-refresh document. Detect it by the
  // refresh meta rather than by size, which would be a guess.
  const head = fs.readFileSync(f, 'utf-8').slice(0, 1024);
  if (head.includes('http-equiv="refresh"')) {
    return { kind: 'redirect', to: (head.match(REDIRECT_TARGET) || [])[1] ?? null, size };
  }
  return { kind: 'page', size };
}

// ---------------------------------------------------------------- dev fetcher
/**
 * A final path segment containing a dot is a FILE request to `astro dev`, so it
 * never reaches the page route — `/…/03_docs.html` 404s while
 * `/…/03_docs.html/` resolves. The build writes that URL as a directory
 * (`03_docs.html/index.html`), and a static host asked for the no-slash form
 * 301s to the slash form by the oldest convention on the web, precisely so
 * relative links keep working.
 *
 * So the slash form is the one a deployed site actually answers, and probing
 * only the bare form measures a dev-server quirk rather than a resolver
 * disagreement. Retry once, and say which form answered.
 */
const looksLikeFile = (url) => /\.[A-Za-z0-9]+$/.test(url.split('/').pop() ?? '');

async function probeDev(url) {
  const first = await probeDevOnce(url);
  if (first.status === 404 && looksLikeFile(url)) {
    const retry = await probeDevOnce(url + '/');
    if (retry.status !== 404) return { ...retry, viaTrailingSlash: true };
  }
  return first;
}

async function probeDevOnce(url) {
  try {
    const res = await fetch(BASE + url, { redirect: 'manual' });
    const location = res.headers.get('location');
    let size = 0;
    if (!location) size = (await res.arrayBuffer()).byteLength;
    // `pathname` alone is wrong here: a plan-stage alias redirects to
    // `<plan>#<stage-anchor>`, and the build's canonical href carries that
    // fragment. Comparing a path against a path-plus-anchor reported all 17
    // stage aliases as divergent when they agree exactly.
    const parsed = location ? new URL(location, BASE) : null;
    return {
      status: res.status,
      to: parsed ? parsed.pathname + parsed.hash : null,
      size,
    };
  } catch (e) {
    return { status: 0, to: null, size: 0, error: String(e.message ?? e) };
  }
}

const norm = (u) => (u ? u.replace(/\/+$/, '') || '/' : null);

function classify(url, dev, dist) {
  if (dev.status === 0) return { verdict: 'DIVERGE', note: `dev unreachable: ${dev.error}` };

  if (dist.kind === 'page') {
    if (dev.status === 200) return { verdict: 'agree', note: 'page in both' };
    return { verdict: 'DIVERGE', note: `build has a page, dev answered ${dev.status}` };
  }

  if (dist.kind === 'redirect') {
    if (dev.status >= 300 && dev.status < 400) {
      if (norm(dev.to) !== norm(dist.to)) {
        return { verdict: 'DIVERGE', note: `redirect targets differ — dev ${dev.to} vs build ${dist.to}` };
      }
      return dev.viaTrailingSlash
        ? { verdict: 'explained', note: 'dotted-segment-needs-trailing-slash' }
        : { verdict: 'agree', note: `both redirect to ${dist.to}` };
    }
    return { verdict: 'DIVERGE', note: `build redirects to ${dist.to}, dev answered ${dev.status}` };
  }

  // dist.kind === 'absent'
  const expected = EXPECTED.find((e) => e.match(url, dev, dist));
  if (expected) return { verdict: 'explained', note: expected.id };
  if (dev.status === 404) return { verdict: 'agree', note: 'not found in both' };
  return { verdict: 'DIVERGE', note: `build wrote no file, dev answered ${dev.status}` };
}

// ---------------------------------------------------------------- negative probes
/**
 * Addresses that must NOT resolve to a page. Nothing enumerates this set — it is
 * the half that produced both defects this harness was written for — so it is
 * written by hand and grows whenever a routing bug is found.
 */
function negativeProbes() {
  const firstIssue = enumerated.find((p) => p.props.pageType === 'issues-detail' && !p.props.redirectTo);
  const issueSlug = firstIssue?.params.slug ?? 'todo/none';
  return [
    '/user-guide/definitely-not-a-page',
    '/blog/definitely-not-a-post',
    '/not-a-section-at-all',
    `/${issueSlug}/not-a-section`,
    `/${issueSlug}/subtasks/not-a-subtask`,
    '/user-guide/../../etc/passwd',
  ];
}

// ---------------------------------------------------------------- run
const targets = [];
const seen = new Set();
for (const entry of enumerated) {
  const slug = entry.params.slug;
  const url = '/' + (slug ?? '');
  if (seen.has(url)) continue;
  seen.add(url);
  targets.push({ url, slug, source: 'enumerated' });
  if (targets.length >= LIMIT) break;
}
for (const url of negativeProbes()) {
  if (seen.has(url)) continue;
  seen.add(url);
  targets.push({ url, slug: url.replace(/^\//, ''), source: 'negative' });
}

const results = [];
let done = 0;
async function worker(queue) {
  for (;;) {
    const t = queue.pop();
    if (!t) return;
    const dev = await probeDev(t.url);
    const dist = readDist(t.slug);
    const { verdict, note } = classify(t.url, dev, dist);
    results.push({ ...t, dev, dist, verdict, note });
    if (!JSON_OUT && ++done % 200 === 0) process.stderr.write(`  …${done}/${targets.length}\n`);
  }
}
const queue = [...targets];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

const diverge = results.filter((r) => r.verdict === 'DIVERGE');
const explained = results.filter((r) => r.verdict === 'explained');
const agree = results.filter((r) => r.verdict === 'agree');

// A static host serves dist/404.html for an unmatched path. Its absence means
// every dead link on the deployed site gets the host's default page.
const has404 = fs.existsSync(path.join(DIST, '404.html'));

if (JSON_OUT) {
  console.log(JSON.stringify({ has404, counts: { agree: agree.length, explained: explained.length, diverge: diverge.length }, diverge, explained }, null, 2));
  process.exit(diverge.length || !has404 ? 1 : 0);
}

console.log(`\n  route parity — ${targets.length} URLs (${enumerated.length} enumerated from buildStaticPaths, ${targets.length - Math.min(enumerated.length, LIMIT)} negative probes)`);
console.log(`  dev: ${BASE}    build: ${path.relative(REPO, DIST)}\n`);
console.log(`  ✅ agree      ${agree.length}`);
console.log(`  ·  explained  ${explained.length}`);
console.log(`  ${diverge.length ? '❌' : '✅'} DIVERGE    ${diverge.length}`);

if (explained.length) {
  console.log('\n  Explained differences — each is a stated claim that the difference is correct:');
  for (const e of EXPECTED) {
    const n = explained.filter((r) => r.note === e.id).length;
    if (n) console.log(`    ${n.toString().padStart(4)}  ${e.id}\n          ${e.why.replace(/\s+/g, ' ')}`);
  }
}

if (diverge.length) {
  console.log('\n  Divergences:');
  for (const d of diverge.slice(0, 40)) console.log(`    ${d.url}\n          ${d.note}`);
  if (diverge.length > 40) console.log(`    … and ${diverge.length - 40} more`);
}

console.log(`\n  ${has404 ? '✅' : '❌'} dist/404.html ${has404 ? 'exists' : 'is ABSENT — a static host will serve its own default page for every dead link'}`);
console.log(diverge.length || !has404 ? '\n  FAILED.\n' : '\n  Dev and the build agree.\n');
process.exit(diverge.length || !has404 ? 1 : 0);
