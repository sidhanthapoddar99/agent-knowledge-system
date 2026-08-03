#!/usr/bin/env bun
/**
 * check-link-form.mjs — every internal link is in the form our tooling can maintain.
 *
 * THE SIBLING GATE ASKS A DIFFERENT QUESTION. `check links` reads the BUILT site
 * and asks *does this link resolve?* — it needs a `dist/` and it is a statement
 * about the renderer. This one reads the MARKDOWN and asks *is this link
 * maintainable?* — it needs nothing built and runs instantly.
 *
 * A link can resolve perfectly and still be unmaintainable. That is not a corner
 * case: it is exactly what 341 converted links were, and why the resolution gate
 * alone would have reported them clean.
 *
 * WHAT IS WRONG WITH A SITE-ABSOLUTE INTERNAL LINK. Start with what these
 * documents are: filesystem-first files, written so filesystem tools work on them
 * — `move`, `grep`, an editor, an agent walking the tree — with the rendered site
 * as one consumer rather than the thing being built. A relative link is the only
 * form that is TRUE ON DISK, so it is the only form any of those tools can
 * follow. A `/…` target is a URL counted from the site root; it is not a path,
 * and it stops being true the moment the file is read outside the site.
 *
 * The tooling consequence follows from that, it is not the reason for it:
 * `agent-ks move` resolves each target to a real filesystem path before rewriting
 * it, and skips anything starting with `/` (`_links.mjs → isIgnorableTarget`,
 * which is the ONLY place that classification lives). So `[x](/a/b)` renders
 * fine, works in a browser, and has permanently left link maintenance. It rots on
 * the next file move with nothing reporting it.
 *
 * Hence the fix for a failure here is always to make the link relative — never to
 * make the rule looser. And a relative link that 404s on the built site is a
 * RENDERER defect to file, not a reason to convert content to `/`.
 *
 * External `http(s)://` and `mailto:` are fine. Pure `#anchors` are fine.
 * Fenced blocks AND inline code spans are skipped — a link inside either is
 * syntax being shown, not a link. Documentation that quotes the wrong form in
 * order to forbid it must not trip the gate that forbids it.
 *
 * TRACKERS ARE EXCLUDED BY DEFAULT, matching `check links`. Not because their
 * links are suspect — they are not. Tracker pages are served without a trailing
 * slash and keep their `NN_` prefixes, so a relative link written against the
 * file tree already resolves correctly; that was verified by request in
 * 2026-08-03, after an earlier claim to the contrary was retracted.
 *
 * The exclusion is about volume: a tracker holds thousands of links to files
 * that legitimately came and went, and a gate that is red on arrival is a gate
 * people learn to ignore. `--all` includes them as a measurement.
 *
 * Usage: check-link-form.mjs [root] [--all] [--json]
 * Exit 0 = every internal link is relative, 1 = at least one is not.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { reportAndExit } from './_check-lib.mjs';
import { MD_LINK_RE, makeFenceTracker } from './_links.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));

const ROOT = POSITIONAL
  ? path.resolve(POSITIONAL)
  : path.join(resolveProjectContext(SCRIPT_DIR).contentRoot, 'data');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walk(abs, acc);
    else if (/\.mdx?$/.test(e.name)) acc.push(abs);
  }
  return acc;
}

const ALL = process.argv.includes('--all');
/** Tracker content — `type: issues`. Excluded unless --all; see the header. */
const isTracker = (abs) => /(^|[\\/])todo[\\/]/.test(path.relative(ROOT, abs));

const errors = [];
const files = walk(ROOT).filter((f) => ALL || !isTracker(f));
let linksChecked = 0;

for (const file of files) {
  const isProse = makeFenceTracker();
  fs.readFileSync(file, 'utf-8').split('\n').forEach((line, idx) => {
    if (!isProse(line)) return;
    // Blank out inline code spans first — a link shown inside backticks is being
    // quoted, not used. Replaced with same-length filler so columns still line up.
    const scanned = line.replace(/`[^`]*`/g, (s) => ' '.repeat(s.length));
    let m;
    MD_LINK_RE.lastIndex = 0;
    while ((m = MD_LINK_RE.exec(scanned)) !== null) {
      const [, bang, text, target] = m;
      if (bang) continue;                        // an image, not a navigation link
      linksChecked++;
      if (!target.startsWith('/') || target.startsWith('//')) continue;
      errors.push(
        `${path.relative(ROOT, file)}:${idx + 1}: site-absolute internal link ` +
        `→ ${target}   "${text}"   — agent-ks move cannot maintain this; write it relative (./x, ../x)`,
      );
    }
  });
}

// A gate that inspected nothing must fail, never pass. This one has fallen into
// the equivalent trap twice in a sibling script; the assertion is cheap.
if (files.length === 0) errors.push(`no markdown found under ${ROOT} — nothing was checked`);
if (files.length && linksChecked === 0) errors.push(`${files.length} file(s) but zero links parsed — the link matcher is not working`);

reportAndExit({
  kind: 'link-form',
  root: ROOT,
  subtitle: `(${linksChecked} link(s) across ${files.length} markdown file(s))`,
  errors,
  warnings: [],
  json: JSON_OUT,
});
