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

/**
 * Markdown link / image. Captures: leading `!` (optional), text, target, and the
 * optional TITLE with its leading whitespace (`` `[x](./y "why")` `` → ` "why"`).
 *
 * THE TITLE GROUP EXISTS BECAUSE ITS ABSENCE MADE LINKS INVISIBLE. The pattern
 * used to end at `([^)\s]+)\)`, so a titled link simply did not match: the target
 * class stops at the space, and the `)` that follows never arrives. Such a link
 * was not reported, not counted, and — worse — not maintained by `move`, which
 * silently left it behind on every rename. A link the tooling cannot see is a
 * link the tooling cannot maintain.
 *
 * **Every caller that REBUILDS a link must emit group 4 back**, or fixing the
 * blindness would start deleting titles instead: `[x](./y "why")` → `[x](./y)`.
 * The group carries its own leading whitespace precisely so callers can
 * concatenate it unconditionally — `${target}${title ?? ''}` — with no
 * separator logic and no way to forget the space.
 */
export const MD_LINK_RE =
  /(!?)\[([^\]]*)\]\(([^)\s]+)((?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?)\s*\)/g;

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
 * The same rule as `makeFenceTracker`, applied to a WHOLE DOCUMENT: every fenced
 * region is replaced by same-length filler, newlines kept, so offsets and
 * line:column numbers are untouched.
 *
 * It exists because a per-line tracker cannot be combined with a whole-document
 * scan, and the whole-document scan is what `eachLink` needs — see the note
 * there. Same tracker, same fence rule, applied to the text instead of to a
 * loop, so the two cannot drift apart.
 */
export function blankFencesDoc(text) {
  if (!text.includes('```') && !text.includes('~~~')) return text;
  const isProse = makeFenceTracker();
  return text
    .split('\n')
    .map((line) => (isProse(line) ? line : line.replace(/[^\n]/g, ' ')))
    .join('\n');
}

/**
 * Blank out inline code spans, replacing each with same-length filler so line
 * and column numbers still line up. A link inside backticks is being SHOWN, not
 * used — a worked example in a skill, a wrong form quoted in a guide — so it
 * neither renders as a link nor resolves, and every tool that walks links has to
 * skip it. `move`, which WRITES, would otherwise rewrite the example.
 *
 * Three rules, and deliberately no more:
 *
 *   1. **A span opens on a run of N backticks and closes on a run of N.** Not on
 *      the next single backtick — that is how a document quotes markup which
 *      itself contains backticks: `` [`writing.md`](./writing.md) ``. A
 *      `/`[^`]*`/` pattern stops at the first inner backtick and reports the
 *      link as real, which is a check accusing a document of the thing it is
 *      correctly demonstrating.
 *   2. **It scans the whole document, not line by line.** A span may wrap onto
 *      the next line, and the agent-log scaffolder's own template wraps one — so
 *      the per-line version failed on every agent log the tool had ever created.
 *      That bug is the only reason this function was ever rewritten.
 *   3. **A span never crosses a block boundary** — a blank line, a heading, a
 *      list item, a blockquote marker, a `---` rule or a setext underline.
 *      Without this, one stray backtick pairs with another fifty lines later and
 *      blanks everything between, hiding real links. That is the dangerous
 *      direction and the one worth spending code on: a check that goes quiet is
 *      indistinguishable from a clean tree. It is an approximation of
 *      CommonMark's block structure, not a reimplementation of it — the test
 *      fixture below states exactly where the two part company.
 *
 * FENCED blocks are not this function's job: every caller runs `makeFenceTracker`
 * over the same lines and skips fenced regions itself.
 *
 * THIS IS DELIBERATELY NOT A MARKDOWN PARSER, AND THAT IS A DECISION WITH A
 * MEASUREMENT BEHIND IT. A full CommonMark parse was tried: it is stricter about
 * escaped backticks, blockquotes, setext underlines, pipe-less GFM tables,
 * indented code and raw HTML. Over this repo's 1,056 files it exposed **exactly
 * the same 2,152 links** as the code above, while costing 20× the runtime and
 * three undeclared npm dependencies under the module every check loads. Those
 * cases have never occurred here. `fixtures/code-spans.test.mjs` measures the
 * divergence against a real parser and names each case we do not handle — the
 * limits are written down rather than engineered away.
 *
 * The blanked text has the same length and the same line count, so every
 * reported line:column stays correct.
 */
const BACKTICK_RUN_RE = /`+/g;

/**
 * The start of a new block, scanned from a newline: a blank line, a blockquote
 * marker, a bullet or ordered list item, an ATX heading, a thematic break, or a
 * setext underline. Deliberately a shortlist of the common cases — see rule 3.
 */
const BLOCK_START_RE =
  /\n[ \t]{0,3}(?:[ \t]*\r?\n|>|[-*+][ \t]|\d{1,9}[.)][ \t]|#{1,6}[ \t]|[=\-*_]{2,}[ \t\r]*(?:\n|$))/g;

function blankCodeSpans(text) {
  if (!text.includes('`')) return text;

  const runs = [];
  BACKTICK_RUN_RE.lastIndex = 0;
  for (let m; (m = BACKTICK_RUN_RE.exec(text)) !== null; ) {
    runs.push({ start: m.index, len: m[0].length });
  }

  const parts = [];
  let cursor = 0;
  for (let i = 0; i < runs.length; i += 1) {
    const open = runs[i];
    if (open.start < cursor) continue;

    // Rule 3 — the closer must arrive before the current block ends.
    BLOCK_START_RE.lastIndex = open.start;
    const limit = BLOCK_START_RE.exec(text)?.index ?? text.length;

    let close = -1;
    for (let k = i + 1; k < runs.length && runs[k].start < limit; k += 1) {
      if (runs[k].len === open.len) { close = k; break; }
    }
    if (close === -1) continue;

    const end = runs[close].start + runs[close].len;
    parts.push(text.slice(cursor, open.start));
    parts.push(text.slice(open.start, end).replace(/[^\n]/g, ' '));
    cursor = end;
    i = close;
  }
  parts.push(text.slice(cursor));
  return parts.join('');
}

/**
 * A file's lines with every code span blanked.
 *
 * All four link-walking tools share this — `check-link-form`, `check
 * skill-links`, `issues/check` and `move`. They did not, twice: the wrapped-span
 * fix landed in one caller of three, and a fourth caller nobody had counted was
 * still running the original two-regex version months later. **A shared
 * classification with four private copies is four different answers.**
 */
export function blankedProseLines(text) {
  return blankCodeSpans(text).split('\n');
}

/** The whole-document form, for a caller that wants the text rather than lines. */
export function blankCodeSpansDoc(text) {
  return blankCodeSpans(text);
}

// ── walking a document's links ────────────────────────────────────────────

/**
 * Every markdown link in a document, in order, with its position.
 *
 * **This is the one place a link is FOUND, and it scans the whole document.**
 * Every caller used to run `MD_LINK_RE` over one line at a time, and a link
 * whose visible text wraps looks like half a link on each of two lines — so it
 * matched nothing and was invisible to `check link-form`, `check skill-links`,
 * `check issues` and `move` alike. Eight of them existed in this repo.
 *
 * The regex was never the problem: its label group is `[^\]]*`, and a negated
 * class already matches newlines. It was only ever fed one line at a time.
 *
 * `move`, which cannot maintain a link it never saw, is why this is worth a
 * shared function rather than four fixes.
 *
 * Yields `{ match, target, label, title, bang, start, end, line, col, lineText }`
 * where `line`/`col` are 1-based and derived from the match offset. `lineText`
 * is the RAW line the link starts on, for a caller that wants to show context.
 */
export function* eachLink(rawText) {
  const scanned = blankCodeSpansDoc(blankFencesDoc(rawText));
  const rawLines = rawText.split('\n');

  // Offset of the first character of each line, so offset → line is a binary
  // search rather than a re-scan per match.
  const lineStarts = [0];
  for (let i = 0; i < scanned.length; i += 1) {
    if (scanned[i] === '\n') lineStarts.push(i + 1);
  }
  const lineOf = (offset) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid; else hi = mid - 1;
    }
    return lo;
  };

  MD_LINK_RE.lastIndex = 0;
  for (let m; (m = MD_LINK_RE.exec(scanned)) !== null; ) {
    const idx = lineOf(m.index);
    // **The blanked copy FINDS the link; the raw text DESCRIBES it.** Re-match at
    // the same offsets so every group is what is actually on disk.
    //
    // Without this, a label containing inline code — `` [`080`](./x.md) ``, this
    // repo's house style — is reported with its backticks blanked to spaces. The
    // per-line version had the same flaw and it made `move` SKIP those links: it
    // asserted a blanked string against the real line, the assert failed, and the
    // link was left unrewritten with a warning nobody was reading. A rewriting
    // tool that silently declines the most common link shape in the repo is the
    // exact "quietly shrinking link set" this whole effort exists to remove.
    const rawSlice = rawText.slice(m.index, m.index + m[0].length);
    MD_LINK_RE.lastIndex = 0;
    const r = MD_LINK_RE.exec(rawSlice) ?? m;
    MD_LINK_RE.lastIndex = m.index + m[0].length;

    yield {
      match: r,
      bang: r[1],
      label: r[2],
      target: r[3],
      title: r[4] ?? '',
      raw: rawSlice,
      start: m.index,
      end: m.index + m[0].length,
      line: idx + 1,
      col: m.index - lineStarts[idx] + 1,
      lineText: rawLines[idx] ?? '',
    };
  }
}

/**
 * Rewrite a document's links in one pass: `replacer(link)` returns the new text
 * for that link, or `null` to leave it alone.
 *
 * Splicing by offset is why the whole-document scan makes the WRITING callers
 * simpler rather than harder — `move` and `img --rewrite-links` used to
 * reassemble the file line by line, which is what made a wrapped link
 * unrewritable even once it had been found.
 */
export function rewriteLinks(rawText, replacer) {
  let out = '';
  let cursor = 0;
  let changed = 0;
  for (const link of eachLink(rawText)) {
    const next = replacer(link);
    if (next === null || next === undefined) continue;
    // Slice from the RAW text — the blanked copy is only ever used for finding.
    out += rawText.slice(cursor, link.start) + next;
    cursor = link.end;
    changed += 1;
  }
  return { text: out + rawText.slice(cursor), changed };
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

