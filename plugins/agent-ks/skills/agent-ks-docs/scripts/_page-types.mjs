/**
 * _page-types.mjs — what counts as a first-class non-markdown page, and what its
 * metadata sidecar is called.
 *
 * `docs/check.mjs` and `docs/move.mjs` each independently defined the SAME two
 * facts, for opposite questions: check asks "is this file a page (or a page's
 * sidecar), so don't warn about it as stray", move asks "does this page carry a
 * sidecar that has to travel with it". Nothing kept the copies in step, and a
 * page type added to one and not the other is exactly how `move` came to orphan
 * a sidecar. This is the one home for both facts and the small predicates built
 * on them; neither command defines any of it.
 *
 * The extension list mirrors the runtime loaders — DIAGRAM_EXTENSIONS in
 * `loaders/diagram-pages.ts` and ARTIFACT_PAGE_GLOB in `loaders/artifact-pages.ts`
 * — which are what actually render these files as docs pages. Keep it in sync
 * with them.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Non-markdown files the runtime renders as docs pages, exactly like a `.md`
 * file: diagram sources and `.html` artifacts. Each takes an `NN_` prefix and
 * joins the same slug-collision pool as markdown.
 */
export const FIRST_CLASS_PAGE_EXTS = new Set(['.mmd', '.mermaid', '.dot', '.gv', '.excalidraw', '.html']);

/**
 * A first-class page may carry a same-name metadata sidecar holding its title,
 * sidebar label, embed height and theme mode. It is a companion, never a page
 * itself — found by NAME CONVENTION from its partner, since nothing links to it.
 */
export const SIDECAR_SUFFIXES = ['.meta.json', '.meta.jsonc'];

/** The same fact as SIDECAR_SUFFIXES, as a trailing-match test on a file name. */
export const SIDECAR_RE = /\.meta\.jsonc?$/i;

/** The sidecar paths a page at `base` + its extension could have (existence not checked). */
export function sidecarPathsFor(base) {
  return SIDECAR_SUFFIXES.map((suffix) => base + suffix);
}

/** True when `name` is a `.meta.json(c)` sidecar for a colocated first-class page. */
export function isSidecarForPage(dir, name) {
  const m = name.match(SIDECAR_RE);
  if (!m) return false;
  const base = name.slice(0, name.length - m[0].length);
  for (const ext of FIRST_CLASS_PAGE_EXTS) {
    if (fs.existsSync(path.join(dir, base + ext))) return true;
  }
  return false;
}
