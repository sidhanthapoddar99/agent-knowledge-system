/**
 * link-coverage.test.mjs — the acceptance test for "a link is found wherever the
 * renderer finds one."
 *
 * **It asserts nothing of its own.** It renders each file with micromark — a
 * real CommonMark+GFM implementation, the same engine the site renders with —
 * pulls every `<a href>` out of the HTML, and compares that set against what
 * `eachLink` reports. A link the renderer emits and the tooling never saw is a
 * link `agent-ks move` cannot maintain, and it rots silently on the next rename.
 *
 * That question cannot be answered from inside the tooling. Every earlier check
 * of these gates compared them against a FIXTURE — cases someone had already
 * met — which is why eight links whose labels wrapped were invisible for the
 * tool's whole life: a tool cannot report the links it never looked at, so the
 * only way to see the gap is to count from the other end.
 *
 * Run:  bun fixtures/link-coverage.test.mjs [content-root]
 * Exit 0 = zero rendered-but-unscanned links. Exit 1 = the gap, listed.
 *
 * micromark is a TEST-ONLY dependency — a test never runs on a consumer's
 * machine. The shipped commands import nothing from npm.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { eachLink } from '../_links.mjs';
import { resolveProjectContext } from '../_env.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const root = process.argv[2] ?? path.join(resolveProjectContext(SCRIPT_DIR).contentRoot, 'data');

/**
 * What the tooling is NOT expected to see, stated rather than silently dropped.
 *
 * An autolink (`<https://x>` or a bare URL GFM linkifies) has no `[label](target)`
 * to match and nothing to maintain — it names an external address, not a file.
 * Reference-style links (`[a][b]` + `[b]: ./t.md`) are likewise out of scope:
 * none exist in this tree, and the day one does, this test says so rather than
 * passing quietly.
 */
const isExternal = (href) => /^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//') || href.startsWith('#');

function renderedHrefs(text) {
  let html;
  try {
    html = micromark(text, { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  } catch {
    return null; // a file micromark refuses is not this test's business
  }
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]*)"/gi)) {
    out.push(m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x3C;/g, '<'));
  }
  return out;
}

function collectMd(dir, acc = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) collectMd(abs, acc);
    else if (e.name.endsWith('.md')) acc.push(abs);
  }
  return acc;
}

const files = collectMd(root);
let rendered = 0, scanned = 0, externalSkipped = 0;
const unscanned = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf-8');
  const hrefs = renderedHrefs(text);
  if (hrefs === null) continue;

  // Multiset comparison: the same target may legitimately appear twice in a file
  // and both copies have to be seen, so counts are compared, not just presence.
  const seen = new Map();
  for (const { target } of eachLink(text)) {
    const key = target.replace(/\s+["'].*$/, '');
    seen.set(key, (seen.get(key) ?? 0) + 1);
    scanned += 1;
  }

  for (const href of hrefs) {
    rendered += 1;
    if (isExternal(href)) { externalSkipped += 1; continue; }
    const n = seen.get(href) ?? 0;
    if (n > 0) seen.set(href, n - 1);
    else unscanned.push({ file: path.relative(root, file), href });
  }
}

process.stdout.write('# link coverage: micromark (the renderer) vs eachLink (the tooling)\n');
process.stdout.write(`(${files.length} file(s) under ${root})\n\n`);
process.stdout.write(`  rendered <a href>      : ${rendered}\n`);
process.stdout.write(`  external / anchor-only : ${externalSkipped}  (nothing to maintain)\n`);
process.stdout.write(`  found by the tooling   : ${scanned}\n`);
process.stdout.write(`  RENDERED BUT UNSCANNED : ${unscanned.length}\n\n`);

// A test that inspected nothing must fail, never pass — the same assertion the
// gates themselves carry.
if (files.length === 0 || rendered === 0) {
  process.stdout.write('✗ nothing was rendered — the harness is broken, not the tooling\n');
  process.exit(1);
}

if (unscanned.length === 0) {
  process.stdout.write('✓ every rendered internal link is visible to the tooling\n');
  process.exit(0);
}

for (const u of unscanned.slice(0, 40)) process.stdout.write(`  ✗ ${u.file}  →  ${u.href}\n`);
if (unscanned.length > 40) process.stdout.write(`  … and ${unscanned.length - 40} more\n`);
process.exit(1);
