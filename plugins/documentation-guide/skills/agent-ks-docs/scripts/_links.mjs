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
