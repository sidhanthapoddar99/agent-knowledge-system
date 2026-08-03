#!/usr/bin/env bun
/**
 * check-content-links.mjs — verify links between CONTENT pages resolve.
 *
 * The sibling `check-skill-links.mjs` does this for the skill `.md` files under
 * `plugins/`. Nothing did it for `data/` — the docs, the guide, the blog — and
 * the result was 313 dead links across the user guide and dev-docs, plus every
 * relative link in one whole section, accumulated with nobody noticing.
 *
 * WHY THIS CHECKS THE BUILT SITE, NOT THE MARKDOWN.
 *
 * A link's correctness is a property of the URL it resolves to, and that is not
 * knowable from the source. Two reasons:
 *
 *   1. The slug is not the path. `05_sub-docs/07_subtasks.md` publishes at
 *      `sub-docs/subtasks` — ordering prefixes are stripped, folders are kept.
 *   2. Pages emit as `<slug>/index.html`, so every page URL ends in a slash, and
 *      a browser resolves `./x` INSIDE the current page rather than beside it.
 *      `./structure` on `/user-guide/blogs/overview/` means
 *      `/user-guide/blogs/overview/structure`, not `/user-guide/blogs/structure`.
 *
 * A checker that reasons about markdown paths has to reimplement both rules and
 * will disagree with the router the moment either changes. So this reads the
 * rendered `href` — the exact string a browser follows — and resolves it with
 * the same URL algorithm a browser uses. An earlier hand-rolled measurement that
 * guessed the resolution rule under-reported the breakage by 20 links; that is
 * the mistake this design exists to prevent.
 *
 * Only the page BODY is checked. Nav, sidebar and footer links are generated
 * from the config and are correct by construction; including them would drown
 * the real findings in thousands of identical passes.
 *
 * TRACKERS ARE EXCLUDED BY DEFAULT (`type: issues` in site.yaml). An issue is a
 * record of what someone thought at the time — a link that rotted because its
 * target was deleted is history, not a defect, and rewriting it edits the
 * record. Pass `--all` to include them. This keeps the clean state at ZERO,
 * which is the only state a gate can be read against.
 *
 * Usage:
 *   check-content-links.mjs [--section <name>] [--all] [--dist <path>] [--json]
 *
 * Requires a build first — `./start build`. With no `dist/` it FAILS rather than
 * reporting clean: a gate that cannot see anything must never look like a pass.
 *
 * Exit 0 = every link resolves, 1 = broken link(s) or nothing to check.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { reportAndExit } from './_check-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const JSON_OUT = argv.includes('--json');
const ALL = argv.includes('--all');
const flagVal = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null;
};
const ONLY = flagVal('section');

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Locate the built site
// ---------------------------------------------------------------------------

const ctx = resolveProjectContext(SCRIPT_DIR);
const CONTENT_ROOT = ctx.contentRoot;

/** dogfood: <repo>/astro-doc-code/dist · consumer: <project>/agent-knowledge-system/astro-doc-code/dist */
function findDist() {
  const explicit = flagVal('dist');
  if (explicit) return path.resolve(explicit);
  const candidates = [
    path.join(CONTENT_ROOT, '..', 'astro-doc-code', 'dist'),
    path.join(CONTENT_ROOT, 'agent-knowledge-system', 'astro-doc-code', 'dist'),
    path.join(CONTENT_ROOT, '..', 'agent-knowledge-system', 'astro-doc-code', 'dist'),
  ];
  return candidates.map((c) => path.resolve(c)).find((c) => fs.existsSync(c)) ?? null;
}

const DIST = findDist();
if (!DIST) {
  // NOT a warning. A link check with no built site has checked nothing, and
  // "nothing found" must never render as "all clear".
  reportAndExit({
    kind: 'content-links',
    root: CONTENT_ROOT,
    errors: [
      'no built site found — run `./start build` first, or pass --dist <path>. ' +
      'Nothing was checked, which is a failure rather than a pass.',
    ],
    warnings: [],
    json: JSON_OUT,
  });
}

// ---------------------------------------------------------------------------
// Which sections to check — from site.yaml's `pages:` block
// ---------------------------------------------------------------------------

/** Minimal `pages:` reader. site.yaml is hand-parsed elsewhere too (config/check.mjs) —
 *  there is no YAML parser available to plugin scripts. */
function readPages(siteYaml) {
  const text = fs.readFileSync(siteYaml, 'utf-8');
  const block = text.split(/^pages:\s*$/m)[1];
  if (!block) return [];
  const out = [];
  let current = null;
  for (const raw of block.split(/\r?\n/)) {
    if (/^\S/.test(raw)) break;                       // dedented out of `pages:`
    const name = raw.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
    if (name) { current = { name: name[1] }; out.push(current); continue; }
    if (!current) continue;
    const kv = raw.match(/^ {4}(\w+):\s*"?([^"#]*?)"?\s*(?:#.*)?$/);
    if (kv) current[kv[1]] = kv[2];
  }
  return out.filter((p) => p.base_url && p.type);
}

const pages = readPages(path.join(ctx.configDir ?? path.join(CONTENT_ROOT, 'config'), 'site.yaml'));
let sections = pages.filter((p) => p.base_url !== '/' );
if (!ALL) sections = sections.filter((p) => p.type !== 'issues');
if (ONLY) sections = sections.filter((p) => p.name === ONLY);

if (sections.length === 0) {
  errors.push(
    ONLY
      ? `no page named "${ONLY}" in site.yaml (or it is a tracker — add --all)`
      : 'no sections to check — site.yaml declares no non-tracker pages',
  );
  reportAndExit({ kind: 'content-links', root: DIST, errors, warnings, json: JSON_OUT });
}

// ---------------------------------------------------------------------------
// Walk the built pages
// ---------------------------------------------------------------------------

const BODY = /<(article|main)[^>]*>([\s\S]*?)<\/\1>/;
const ANCHOR = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;

let pagesScanned = 0;
let linksChecked = 0;

for (const section of sections) {
  const root = path.join(DIST, section.base_url.replace(/^\//, ''));
  if (!fs.existsSync(root)) {
    warnings.push(`${section.name}: nothing built at ${section.base_url} — skipped`);
    continue;
  }
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, e.name);
      if (e.isDirectory()) { stack.push(abs); continue; }
      if (e.name !== 'index.html') continue;

      pagesScanned++;
      const pageUrl = '/' + path.relative(DIST, dir).split(path.sep).join('/') + '/';
      const html = fs.readFileSync(abs, 'utf-8');
      const m = html.match(BODY);
      if (!m) continue;                               // no body region — layout page

      for (const [, href, label] of m[2].matchAll(ANCHOR)) {
        if (/^(https?:|mailto:|tel:|data:|#)/.test(href)) continue;
        let resolved;
        try {
          resolved = new URL(href, `http://x${pageUrl}`).pathname;
        } catch { continue; }
        if (!resolved.startsWith('/')) continue;
        linksChecked++;
        const target = path.join(DIST, decodeURIComponent(resolved).replace(/^\//, ''));
        const ok = fs.existsSync(path.join(target, 'index.html')) ||
                   (fs.existsSync(target) && fs.statSync(target).isFile());
        if (!ok) {
          const text = label.replace(/<[^>]+>/g, '').trim().slice(0, 44) || '(no text)';
          errors.push(`${pageUrl} → ${href}   "${text}"   resolves ${resolved} — no such page`);
        }
      }
    }
  }
}

// A run that collected nothing is not a clean run. This is the trap the skill
// link checker fell into twice: an empty scope printing the same "all checks
// passed" as a real pass.
if (pagesScanned === 0) {
  errors.push(`no built pages found under ${sections.map((s) => s.base_url).join(', ')} — nothing was checked`);
} else if (linksChecked === 0) {
  errors.push(`${pagesScanned} page(s) scanned but ZERO links found — the body selector matched nothing, so this proves nothing`);
}

reportAndExit({
  kind: 'content-links',
  root: `${sections.length} section(s) under ${DIST}${ALL ? ' [including trackers]' : ''}`,
  subtitle: `(${pagesScanned} page(s), ${linksChecked} in-body link(s) checked)`,
  errors,
  warnings,
  json: JSON_OUT,
});
