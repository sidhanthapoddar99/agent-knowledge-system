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
 * TWO TESTS, AND THE SECOND IS THE ONE THAT WAS MISSING.
 *
 *   1. ERROR — the target must not be site-absolute (a leading `/`).
 *   2. WARNING — the target must EXIST ON DISK.
 *
 * The gate shipped with only the first, and that was a check on the SHAPE of a
 * link rather than on what it points at. `./design-philosophy` is relative, has
 * no leading slash, and passes — while the file is `02_design-philosophy.md` and
 * nothing of that name exists. It is the published URL wearing a relative
 * costume: the renderer accepts both spellings, so there is no symptom to
 * notice, and `move` walks straight past it because a slug never resolves to the
 * file being moved. A site-absolute link at least announces itself. This one
 * looks exactly like the correct form.
 *
 * WHY THE EXISTENCE TEST WARNS RATHER THAN FAILS. It arrives with hundreds of
 * pre-existing hits — links converted twice (to site-absolute and back), where
 * the conversion back restored the shape and not the target. A gate that is red
 * on arrival is a gate people learn to ignore, which is the failure mode this
 * whole gate exists to avoid. It warns until the content is converted; then it
 * is tightened to an error.
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
 * TRACKERS ARE EXCLUDED BY DEFAULT, matching `check links`. The exclusion is
 * about volume: a tracker holds thousands of links to files that legitimately
 * came and went, and a gate that is red on arrival is a gate people learn to
 * ignore. `--all` includes them as a measurement.
 *
 * Usage: check-link-form.mjs [root] [--all] [--json]
 * Exit 0 = no site-absolute internal link, 1 = at least one. Targets missing
 * from disk are reported as warnings and do not change the exit code.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { reportAndExit } from './_check-lib.mjs';
import { MD_LINK_RE, makeFenceTracker, splitAnchor, resolveTargetOnDisk, blankCodeSpans } from './_links.mjs';

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
const warnings = [];
const files = walk(ROOT).filter((f) => ALL || !isTracker(f));
let linksChecked = 0;
let resolvable = 0;

for (const file of files) {
  const isProse = makeFenceTracker();
  fs.readFileSync(file, 'utf-8').split('\n').forEach((line, idx) => {
    if (!isProse(line)) return;
    // A link shown inside backticks is being quoted, not used.
    const scanned = blankCodeSpans(line);
    let m;
    MD_LINK_RE.lastIndex = 0;
    while ((m = MD_LINK_RE.exec(scanned)) !== null) {
      const [, bang, text, target] = m;
      if (bang) continue;                        // an image, not a navigation link
      linksChecked++;
      if (target.startsWith('/') && !target.startsWith('//')) {
        errors.push(
          `${path.relative(ROOT, file)}:${idx + 1}: site-absolute internal link ` +
          `→ ${target}   "${text}"   — agent-ks move cannot maintain this; write it relative (./x, ../x)`,
        );
        continue;
      }
      // Everything else that is not a path at all — external, protocol-relative,
      // pure anchor — has nothing on disk to find and is not this gate's business.
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//') || target.startsWith('#')) continue;

      const { rel } = splitAnchor(target);
      if (rel === '') continue;                  // anchor-only after the split
      const fromDir = path.dirname(file);
      if (resolveTargetOnDisk(fromDir, rel)) { resolvable++; continue; }
      // Two different repairs, so say which one this is. A missing extension is a
      // one-character fix; a slug has to be matched back to the file it came from.
      const extLess = !path.extname(rel) &&
        ['.md', '.mdx'].find((e) => resolveTargetOnDisk(fromDir, rel + e));
      warnings.push(
        `${path.relative(ROOT, file)}:${idx + 1}: target does not exist on disk ` +
        `→ ${rel}   "${text}"   — ` +
        (extLess
          ? `the file is ${rel}${extLess}; add the extension`
          : `relative in shape, but no file of that name`) +
        `; agent-ks move will skip it`,
      );
    }
  });
}

// A gate that inspected nothing must fail, never pass. This one has fallen into
// the equivalent trap twice in a sibling script; the assertion is cheap.
if (files.length === 0) errors.push(`no markdown found under ${ROOT} — nothing was checked`);
if (files.length && linksChecked === 0) errors.push(`${files.length} file(s) but zero links parsed — the link matcher is not working`);
// The same assertion one level down. Every internal link resolving to nothing
// would mean the resolver is broken, not that the content is: with hundreds of
// relative links in this tree, zero resolvable is a tool failure.
if (linksChecked && warnings.length && resolvable === 0) {
  errors.push(`${warnings.length} relative link(s) and NONE resolve — the target resolver is not working, not the content`);
}

reportAndExit({
  kind: 'link-form',
  root: ROOT,
  subtitle:
    `(${linksChecked} link(s) across ${files.length} markdown file(s); ${resolvable} resolved on disk)` +
    (warnings.length
      ? `\nwarnings below are targets that do not exist on disk — relative in shape, not a path. ` +
        `They do not fail the gate yet; see subtask 170 in the link-integrity group.`
      : ''),
  errors,
  warnings,
  json: JSON_OUT,
});
