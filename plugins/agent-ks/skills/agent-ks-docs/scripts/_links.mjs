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

/** A link target that should never be rewritten (external, absolute, anchor). */
export function isIgnorableTarget(url) {
  if (!url) return true;
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return true; // scheme: http:, https:, mailto:, …
  if (url.startsWith('//')) return true;             // protocol-relative
  if (url.startsWith('/')) return true;              // site-absolute (incl. /assets/)
  if (url.startsWith('#')) return true;              // pure anchor
  return false;
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
 *   subtasks/040_execution/100_migration.md   → "040/100"
 *   notes/70_reference.md                     → "70"
 *   agent-log/020_wf_ship/working/090_x.md    → "090"   (`working` breaks the run)
 *   agent-log/020_wf_ship/summary.md          → ""      (no prefix, no identity)
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
