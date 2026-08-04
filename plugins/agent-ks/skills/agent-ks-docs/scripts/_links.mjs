/**
 * _links.mjs — shared Markdown-link primitives.
 *
 * `agent-ks move` and `agent-ks img --rewrite-links` independently defined the SAME
 * link regex; this is the one home for it, plus the link-target classification
 * and a recursive `.md` collector that move uses.
 *
 * NOTE on scope (subtask 08, conservative dedup): `images/optimize.mjs` keeps
 * its own inline ignorable-target check — it intentionally differs from move's
 * (no protocol-relative `//` case), so sharing `isIgnorableTarget` there would
 * silently change behavior. Only the regex is shared with optimize. The
 * external-tool detection helpers (`binaryAvailable` in issues/_lib vs
 * `findEngine` in images/_lib) are deliberately NOT merged: one is a generic
 * presence probe, the other selects an ImageMagick binary — different jobs.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Markdown link / image. Captures: leading `!` (optional), text, target. */
export const MD_LINK_RE = /(!?)\[([^\]]*)\]\(([^)\s]+)\)/g;

/**
 * A link target that should never be rewritten (external, absolute, anchor).
 *
 * THIS IS THE ONE PLACE THAT DECIDES IT. The rule "internal references are
 * relative" is restated in several skill and doc surfaces on purpose — a rule an
 * author meets once, in a file they may never open, is a rule that gets missed.
 * The MECHANISM, though, lives here and nowhere else: no other file may
 * re-implement this classification, and no restatement may contradict it.
 *
 * WHY A LEADING `/` IS SKIPPED RATHER THAN "NOT SUPPORTED YET". These documents
 * are filesystem-first — written so that filesystem tools (`move`, `grep`, an
 * editor, an agent walking the tree) work on them, with the rendered site as one
 * consumer rather than the thing being built. A relative link is the only form
 * that is true on disk. A `/…` target is a URL counted from the site root, so it
 * is not a path at all and there is nothing here to resolve; a smarter `move`
 * would not change that, it would have to guess the URL prefix a section
 * publishes under. Skipping is the correct answer, not a limitation.
 */
export function isIgnorableTarget(url) {
  if (!url) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return true; // scheme: http:, https:, mailto:, …
  if (url.startsWith('//')) return true;             // protocol-relative
  if (url.startsWith('/')) return true;              // site-absolute (incl. /assets/)
  if (url.startsWith('#')) return true;              // pure anchor
  return false;
}

/**
 * Resolve a relative link target against the linking file's directory and return
 * the absolute path it names, or `null` when nothing of that name is on disk.
 *
 * THIS IS THE OTHER HALF OF `isIgnorableTarget`, and it lives here for the same
 * reason. That function answers *is this a path at all*; this one answers *is it
 * a path that exists*. A link can pass the first and fail the second — and that
 * failure is invisible everywhere else, because the renderer accepts the
 * published slug (`./design-philosophy`) as readily as the source file it was
 * derived from (`./02_design-philosophy.md`). The site works; the file tree does
 * not, so `move` cannot follow the link, `grep` cannot find it, and an editor
 * cannot open it.
 *
 * The resolution is the SAME arithmetic `move` performs before rewriting a link
 * (`path.resolve(dir, rel)`), which is what makes this an honest test of
 * maintainability rather than a second opinion about it.
 *
 * THE MATCH IS EXACT — dropping the extension is not a near miss, it is a miss.
 * `./03_variables` where `03_variables.md` exists looks harmless: the `NN_`
 * prefix survives, so `grep` and an editor still find the file. `move` does not.
 * It resolves the target by the arithmetic above and compares the RESULT to the
 * file being moved, so a target one character short of the filename never
 * matches and falls through the same branch as a link that legitimately points
 * elsewhere. Demonstrated 2026-08-04 on a fixture: `move` rewrote
 * `./20_themes/01_overview.md` and walked silently past `./20_themes/01_overview`
 * in the same file. Accepting it here would certify as maintainable a form the
 * maintaining tool cannot follow — the exact mistake the leading-slash-only test
 * made.
 *
 * A DIRECTORY target (`./20_themes`) does resolve, and legitimately: `move` maps
 * directory paths as readily as file paths, so the link is maintained.
 */
export function resolveTargetOnDisk(fromDir, rel) {
  let decoded = rel;
  try { decoded = decodeURIComponent(rel); } catch { /* malformed escape — try as written */ }
  const abs = path.resolve(fromDir, decoded);
  return fs.existsSync(abs) ? abs : null;
}

/** Split a link target into { rel, anchor } where anchor includes the leading '#'. */
export function splitAnchor(url) {
  const h = url.indexOf('#');
  if (h === -1) return { rel: url, anchor: '' };
  return { rel: url.slice(0, h), anchor: url.slice(h) };
}

// ── fenced blocks ─────────────────────────────────────────────────────────
// A markdown link inside a fenced block is NOT a link. It is being shown as
// syntax — a worked example in a skill, an illustrative tree in a guide — and
// it neither renders as a link nor resolves. Every tool that walks links has to
// skip them, and each one that grew its own answer got it wrong differently:
// the skill link-checker reported them as broken, and `move` silently REWROTE
// them, editing sample code to point somewhere else.

/** A fence opens/closes on 3+ backticks or tildes, indented at most 3 spaces. */
const FENCE_RE = /^\s{0,3}(`{3,}|~{3,})/;

/**
 * A stateful line filter: feed it lines in order, it returns false for fence
 * delimiters and everything between them.
 *
 * A block closes only on the SAME character at equal-or-greater length, so a
 * four-backtick block may contain three-backtick lines without ending early —
 * which is exactly how a doc shows a fence inside a fence.
 */
export function makeFenceTracker() {
  let open = null;
  return function isProse(line) {
    const marker = line.match(FENCE_RE)?.[1];
    if (open) {
      if (marker && marker[0] === open[0] && marker.length >= open.length) open = null;
      return false;
    }
    if (marker) { open = marker; return false; }
    return true;
  };
}

/**
 * Blank out inline code spans, replacing each with same-length filler so column
 * numbers still line up. A link inside backticks is being SHOWN, not used.
 *
 * The run length matters and a single-backtick pattern gets it wrong. Markdown
 * opens a code span on a run of N backticks and closes it on a run of N — which
 * is exactly how a document quotes markup that itself contains backticks:
 *
 *     `` [`references/writing.md`](./references/writing.md) ``
 *
 * A `/`[^`]*`/` pattern stops at the first inner backtick, leaves the link
 * exposed, and reports it as content. That is a gate accusing a document of the
 * very thing it is correctly demonstrating — found 2026-08-04 in a subtask that
 * was quoting the right form.
 */
export function blankCodeSpans(line) {
  return line.replace(/(`+)[\s\S]*?\1/g, (s) => ' '.repeat(s.length));
}

// ── ordering labels ───────────────────────────────────────────────────────
// A link's visible text may OPEN with the target's ordering path — the numeric
// prefixes of its folders and of its own name, joined by `/` — so a reader can
// match the link to the numbered entry in the sidebar without following it:
//
//   [040/100 the migration script](../../subtasks/040_execution/100_migration.md)
//
// The label is DERIVED from the target and states nothing the target does not.
// `agent-ks move` recomputes it alongside the path, and the issue validator
// reports one that has drifted — without that pair this would be the same fact
// stored in two places with nothing keeping the copies honest, which is the
// defect the convention it supports exists to remove.

/** A 2–5 digit ordering prefix on one path segment (`_` canonical, `-` legacy). */
const SEGMENT_PREFIX_RE = /^(\d{2,5})[_-]/;

/**
 * A label opening the link text: `NN`, `NN/MM`, `NN/MM/LL`… then whitespace and
 * a non-empty name. Requiring the whitespace is what keeps dates
 * (`2026-08-03 …`) and versions (`0.1.3 …`) out — their digits are followed by
 * a separator rather than a space.
 */
const ORDERING_LABEL_RE = /^(\d{2,5}(?:\/\d{2,5})*)(\s+)(\S[\s\S]*)$/;

/**
 * The ordering path of a file: the maximal run of numerically-prefixed path
 * segments ending at the file itself. Purely local — it knows nothing about
 * sections, so it behaves the same in a tracker and in a docs tree.
 *
 *   subtasks/040_execution/100_migration.md       → "040/100"
 *   notes/70_reference.md                         → "70"
 *   agent-log/020_wf_ship/01_summary.md           → "020/01"
 *   agent-log/020_wf_ship/02_working/090_x.md     → "020/02/090"
 *   agent-log/010_lp_a/100_wf_child/01_summary.md → "010/100/01"
 *
 * **Numbering the agent-log slots lengthened these, and that was a real fix.**
 * While the slot was called `working/`, the unprefixed segment broke the run and
 * a round file's label came out as a bare `090`. That was a deliberate
 * under-report, recorded as such when the ordering label shipped: teaching this
 * function which folder names are "pass-through" would have put tracker
 * knowledge into a library the docs side also uses. `02_working/` carries a
 * prefix, so the purely local rule now yields the full `020/02/090` — the
 * accurate answer, reached by removing a special case rather than adding one.
 */
export function orderingPathFor(absPath) {
  const segments = absPath.split(path.sep).filter(Boolean);
  const out = [];
  for (let i = segments.length - 1; i >= 0; i--) {
    const m = segments[i].match(SEGMENT_PREFIX_RE);
    if (!m) break;
    out.unshift(m[1]);
  }
  return out.join('/');
}

/** Split an ordering label off link text, or null when there is none. */
export function parseOrderingLabel(text) {
  const m = ORDERING_LABEL_RE.exec(text);
  if (!m) return null;
  return { orderingPath: m[1], gap: m[2], name: m[3] };
}

/**
 * Rewrite a link text's ordering label to `newOrderingPath`. Text carrying no
 * label is returned untouched — the convention is optional and this never adds
 * one. A target that has lost its ordering identity drops the label rather than
 * keeping a number that is now a lie.
 */
export function relabelOrdering(text, newOrderingPath) {
  const parsed = parseOrderingLabel(text);
  if (!parsed) return text;
  if (!newOrderingPath) return parsed.name;
  return `${newOrderingPath}${parsed.gap}${parsed.name}`;
}

/** Recursively collect all .md files under a directory (absolute paths). */
export function collectMarkdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectMarkdownFiles(abs));
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(abs);
  }
  return out;
}
