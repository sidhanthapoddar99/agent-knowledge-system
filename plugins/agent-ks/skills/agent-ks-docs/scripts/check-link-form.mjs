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
 * TWO TESTS, AND BOTH FAIL. The second was missing for most of this gate's life.
 *
 *   1. The target must not be site-absolute (a leading `/`).
 *   2. The target must EXIST ON DISK.
 *
 * The gate shipped with only the first, and that was a check on the SHAPE of a
 * link rather than on what it points at. `./design-philosophy` is relative, has
 * no leading slash, and passed — while the file is `02_design-philosophy.md` and
 * nothing of that name existed. It is the published URL wearing a relative
 * costume: the renderer accepts both spellings, so there is no symptom to
 * notice, and `move` walks straight past it because a slug never resolves to the
 * file being moved. A site-absolute link at least announces itself. That one
 * looked exactly like the correct form.
 *
 * The existence test shipped as a WARNING because it arrived with 300 hits —
 * links converted twice (to site-absolute and back), where the conversion back
 * restored the shape and not the target. A gate that is red on arrival is a gate
 * people learn to ignore. The 300 were converted on 2026-08-04 and the test was
 * tightened to an error the same day, which was the point of the warning phase:
 * it was a staging step, not a severity judgement.
 *
 * The conversion was verified to change nothing a reader sees — 86,452 hrefs
 * across 1,216 built pages, byte-identical before and after — and to restore
 * what it was for: a `move` dry-run over the eight links to one page rewrote
 * two of them before and all eight after.
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
 * NOTHING IS EXCLUDED. Trackers used to be skipped by default, and the reason
 * given for it was wrong twice: first that converting a tracker link to relative
 * could swap a working link for a broken one (false — tracker relative links
 * work), then that a tracker holds too many links to files that legitimately
 * came and went. That second reason was measured on 2026-08-04 and did not
 * survive: over 1,843 links the tracker contributed **two** findings, both
 * site-absolute cross-issue links, both fixed the same day.
 *
 * A scope carve-out has to earn itself with a number. This one could not, twice,
 * so it is gone rather than given a third reason — and a link in a tracker is
 * exactly as unmaintainable as a link in a docs page. `--all` is accepted and
 * ignored, so existing invocations keep working.
 *
 * Usage: check-link-form.mjs [root] [--json]
 * Exit 0 = every internal link is relative AND names a file that exists.
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


const errors = [];
const warnings = [];
const files = walk(ROOT);
let linksChecked = 0;
let resolvable = 0;

/**
 * A backticked string that names a real DOCUMENT is a link that was never
 * written. `move` cannot rewrite it, a reader cannot click it, and an agent has
 * to search to resolve it — all silently.
 *
 * The test is deliberately narrow, because the rule has a real exception: a
 * target that is **not a document** has nothing to link to, so `` `src/loaders/paths.ts` ``
 * is correct and must never be flagged. So this fires only when the span
 * resolves to a file with a PAGE extension. Three further exclusions keep it
 * honest rather than noisy:
 *
 *   - anything with whitespace or brackets — that is a sentence or a whole link
 *     being quoted, not a bare path
 *   - directories — `` `notes/` `` is a section being discussed by name, and it
 *     has no page of its own
 *   - a span that is just a bare filename with no path separator — those are
 *     overwhelmingly a file being NAMED (`issue.md`, `settings.json`) rather
 *     than pointed at
 *
 * **IT STILL CANNOT BE PRECISE, AND THAT IS WHY IT WARNS.** Resolvability proves
 * a path COULD be a link; it cannot prove it SHOULD be one. A page whose subject
 * is paths quotes real ones as data — a table of *written / emitted / actually
 * lives at*, a worked example teaching link syntax — and every one of those
 * resolves. Converting them destroys the thing the page exists to show, which is
 * exactly what got an automated sweep of this class reverted.
 *
 * So this reports and never fails, and the rule it supports is *convert one when
 * you meet it while editing*, judged by a reader — not a sweep. A findings list
 * here is a prompt to look, not a work order.
 */
const PAGE_EXT_RE = /\.(mdx?|html|mmd|mermaid|dot|gv|excalidraw)$/i;
const CODE_SPAN_RE = /(`+)([^`]+?)\1/g;

function backtickedDocumentPath(spanText, fromDir) {
  const s = spanText.trim();
  if (!s || /[\s[\]()<>`]/.test(s)) return null;
  if (!s.includes('/')) return null;
  if (!PAGE_EXT_RE.test(s)) return null;
  const abs = resolveTargetOnDisk(fromDir, s);
  if (!abs) return null;
  try { if (fs.statSync(abs).isDirectory()) return null; } catch { return null; }
  return s;
}

for (const file of files) {
  const isProse = makeFenceTracker();
  const fileDir = path.dirname(file);
  fs.readFileSync(file, 'utf-8').split('\n').forEach((line, idx) => {
    if (!isProse(line)) return;

    // Read the code spans BEFORE blanking them — this is the one check whose
    // subject is what is inside the backticks rather than what is outside.
    CODE_SPAN_RE.lastIndex = 0;
    let span;
    while ((span = CODE_SPAN_RE.exec(line)) !== null) {
      const named = backtickedDocumentPath(span[2], fileDir);
      if (!named) continue;
      warnings.push(
        `${path.relative(ROOT, file)}:${idx + 1}: backticked path names a real document ` +
        `→ ${named}   — write it as a link so agent-ks move maintains it; take the text from the target's title`,
      );
    }

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
      errors.push(
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
// The same assertion one level down, and it is the one that matters now that a
// missing target FAILS. Every internal link resolving to nothing would mean the
// resolver is broken rather than the content — and it would fail every run with
// a wall of findings that all look like content defects. Say which it is.
if (linksChecked && errors.length && resolvable === 0) {
  errors.push(`${errors.length} finding(s) and NOT ONE link resolves — suspect the resolver, not the content`);
}

reportAndExit({
  kind: 'link-form',
  root: ROOT,
  subtitle:
    `(${linksChecked} link(s) across ${files.length} markdown file(s); ${resolvable} resolved on disk)` +
    (warnings.length ? `\n${warnings.length} backticked path(s) name a real document — a link that was never written. Warned, not failed.` : ''),
  errors,
  warnings,
  json: JSON_OUT,
});
