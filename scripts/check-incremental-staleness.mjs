#!/usr/bin/env bun
/**
 * check-incremental-staleness.mjs — did the incremental build lie?
 *
 * DEVELOPMENT-STAGE TOOL. Needs the framework source and two full builds,
 * neither of which a consumer authoring documents has. See CLAUDE.md →
 * "Three stages".
 *
 * WHY IT EXISTS. `experimental.incrementalBuild` skips re-rendering a page whose
 * `cacheKey` from `getStaticPaths()` is unchanged. Astro compares the key and
 * **nothing else about the entry** — not the props, not the files the layout
 * opens while rendering. So a key that fails to name one of its inputs emits the
 * *previous* build's HTML, with exit code 0, no warning, and no mark in the log
 * distinguishing it from a correct page.
 *
 * That is not a hypothetical. It was reproduced deliberately: dropping
 * `recordSalt(doc)` from the docs key and editing a doc body produced one stale
 * page and a clean, green build. Nothing in Astro noticed. This harness is the
 * only thing that did.
 *
 * WHAT IT DOES. Builds the same source twice — once reusing the cache, once from
 * a cold cache — and compares every emitted HTML file. Any difference is a page
 * the cacheKey let go stale. That is the only comparison that tests the thing
 * that matters: anything cheaper tests that the fast path *ran*, not that it was
 * *right*.
 *
 *   bun scripts/check-incremental-staleness.mjs
 *   bun scripts/check-incremental-staleness.mjs --ignore-clock
 *
 * ON `--ignore-clock`. `formatRelativeTime()` bakes a wall-clock-relative string
 * ("31 min ago") into the HTML at render time, so two builds a minute apart
 * differ on their own — before any cache is involved. That is a real defect
 * tracked separately, and under a cache it is worse than nondeterminism: a
 * restored page keeps whatever the string said when it was first rendered, so a
 * cached page reads "31 min ago" indefinitely.
 *
 * `--ignore-clock` normalises those strings so the remaining comparison isolates
 * cacheKey correctness. It is a DIAGNOSTIC, not a mode to run the gate in. The
 * tracker is explicit that teaching the diff to ignore `<time>` is the wrong
 * permanent answer — the next thing that drifts would be ignored too. So the
 * default is strict, and strict is expected to fail until the clock defect is
 * fixed.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'astro-doc-code');
const DIST = path.join(APP, 'dist');
const CACHE = path.join(APP, 'node_modules', '.astro');

const ignoreClock = process.argv.includes('--ignore-clock');
const CLOCK = /(<time [^>]*>)\d+ (sec|min|hours?|days?) ago</g;

function build(label, { cold } = {}) {
  if (cold) fs.rmSync(CACHE, { recursive: true, force: true });
  process.stdout.write(`  ${label} build… `);
  const started = Date.now();
  const res = spawnSync('bun', ['run', 'build'], {
    cwd: APP,
    encoding: 'utf-8',
    env: { ...process.env, INCREMENTAL_BUILD: '1' },
  });
  if (res.status !== 0) {
    console.error(`\nFAILED (${label})\n${(res.stdout || '') + (res.stderr || '')}`.slice(-4000));
    process.exit(2);
  }
  // Astro splits build output across both streams — counting one silently
  // undercounts, which reads as "the cache did nothing" when it did.
  const out = (res.stdout || '') + (res.stderr || '');
  const reused = (out.match(/\((?:restored|cached)\)/g) || []).length;
  console.log(`${((Date.now() - started) / 1000).toFixed(2)}s, ${reused} pages reused`);
  return { reused };
}

/** path → sha1 of every emitted HTML file. `_astro/` is content-hashed already. */
function snapshot() {
  const out = new Map();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) {
        let html = fs.readFileSync(full, 'utf-8');
        if (ignoreClock) html = html.replace(CLOCK, '$1CLOCK<');
        out.set(path.relative(DIST, full), createHash('sha1').update(html).digest('hex'));
      }
    }
  };
  walk(DIST);
  return out;
}

console.log(`incremental staleness check${ignoreClock ? '  [--ignore-clock: DIAGNOSTIC ONLY]' : ''}`);

// Warm-up. Astro's own `dependencyHash` has more than one stable value and
// flips when the cache directory is wiped — so the build immediately after a
// cold build reuses nothing through no fault of any cacheKey. This harness ends
// on a cold build, which means without this its *next* run would measure that
// miss and report a meaningless 0. Pay one build to reach steady state.
build('warm-up');
const { reused } = build('incremental');
const incremental = snapshot();
build('full', { cold: true });
const full = snapshot();

const stale = [];
for (const [file, hash] of full) {
  if (incremental.get(file) !== hash) stale.push(file);
}
const missing = [...incremental.keys()].filter((f) => !full.has(f));

console.log(`\n  ${full.size} pages compared, ${reused} reused from cache`);

// A run that reused nothing compared two full builds and passes trivially. That
// is a green light for a check that never ran — the one outcome this harness
// must never produce. Fail loudly instead.
if (reused === 0) {
  console.error(
    '\nINCONCLUSIVE — the incremental build reused 0 pages, so this compared two\n' +
    '  full builds and proved nothing. Check that `experimental.incrementalBuild`\n' +
    '  is on (INCREMENTAL_BUILD=1), that entries return a cacheKey, and that\n' +
    '  build.concurrency is 1 — Astro disables the cache outright above that.',
  );
  process.exit(2);
}

if (!stale.length && !missing.length) {
  console.log('\nPASS — every page the incremental build reused matches a full build.');
  process.exit(0);
}

console.log(`\nFAIL — ${stale.length} stale page(s)${missing.length ? `, ${missing.length} emitted only by the incremental build` : ''}:`);
for (const file of stale.slice(0, 20)) console.log(`    ${file}`);
if (stale.length > 20) console.log(`    … and ${stale.length - 20} more`);
for (const file of missing.slice(0, 10)) console.log(`    (extra) ${file}`);

if (!ignoreClock) {
  console.log(
    '\n  If every path above is an issue touched in the last 7 days, this is the\n' +
    '  known build-nondeterminism defect (`formatRelativeTime` calls `Date.now()`),\n' +
    '  not a cacheKey defect. Re-run with --ignore-clock to isolate the difference.',
  );
}
process.exit(1);
