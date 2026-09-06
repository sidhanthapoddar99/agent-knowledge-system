/**
 * Issue Body Links Postprocessor (issues pipeline only)
 *
 * The issue's root `issue.md` is rendered into the issue DETAIL page, served at
 * `/<tracker>/<issue-id>` — one path segment SHALLOWER than the file's own
 * folder on disk (`<issue-id>/issue.md`). Relative markdown links in `issue.md`
 * are authored relative to the issue folder, so in the browser they
 * under-resolve by one level: the `/<tracker>` (and issue) segment gets dropped
 * (e.g. `../other-issue/issue.md` wrongly resolves to `/other-issue/issue`).
 *
 * Sub-doc pages (subtasks / notes / agent-log) already resolve correctly, so
 * this transform must NOT touch them. It only fires for the root `issue.md`.
 *
 * WHY they resolve, stated carefully — the earlier wording here was right about
 * the conclusion and wrong about the cause, which is worse than saying nothing.
 * It claimed they are "served at a URL depth that MATCHES their file depth".
 * **Relative resolution does not care about segment counts.** It cares whether
 * the browser's base is a directory or a file: `/a/b/` resolves `./x` to `/a/b/x`,
 * while `/a/b` resolves it to `/a/x`. Two things make the tracker safe, and
 * neither is depth:
 *
 *   1. **In dev**, a tracker page is served WITHOUT a trailing slash, so the base
 *      is already the parent directory — where the author meant it.
 *      **THIS DOES NOT HOLD IN PRODUCTION.** A tracker page builds as
 *      `<slug>/index.html` exactly like a docs page, so a real static host sees
 *      a directory and 301s to add the slash — confirmed against a file server
 *      on 2026-08-04. `astro dev` and `astro preview` are route tables and never
 *      add it; that difference is the environment, not the tracker.
 *   2. Tracker URLs KEEP their `NN_` ordering prefixes (`issues.ts`), so the
 *      source path and the URL path are the same string. This one holds
 *      everywhere.
 *
 * So the tracker has ONE of the two properties docs lack, not both, and the
 * fifteen links opened by hand on 2026-08-03 — sibling, cross-group, up-two,
 * up-three into another issue, nested, anchored and slug-form — were all opened
 * against a DEV server. **That evidence does not cover a static host.** Whether
 * these links survive the slash form is genuinely open; do not inherit the
 * earlier "no" from this comment. It is tracked as a re-check on the
 * absolute-link-resolution issue, under unifying the tracker and blog onto one
 * resolver.
 *
 * The earlier wording here dismissed the built site's trailing slash as a
 * limitation of reading `dist/`. It is not a reading artefact — it is what a web
 * server does.
 *
 * Fix: re-root each relative link at the issue folder and emit it relative to
 * the tracker base, so it resolves correctly from the collapsed detail URL
 * (whose browser-relative base is `/<tracker>/`). Links that point at another
 * issue's body resolve to `/<tracker>/<id>/issue`, which the route layer
 * redirects to the canonical `/<tracker>/<id>`.
 *
 * Scoped on purpose: this lives only in `IssuesParser`'s pipeline, so it can
 * never affect docs or blog rendering.
 */

import path from 'path';
import type { Processor, ProcessContext } from '../types';

/**
 * Return the issue id when the file being processed is an issue's root
 * `issue.md` (i.e. `<basePath>/<issue-id>/issue.md`), else null. Sub-docs
 * (`<issue-id>/notes/x.md`, `<issue-id>/comments/x.md`, …) are never matched.
 */
function issueRootBodyId(context: ProcessContext): string | null {
  const rel = path.relative(context.basePath, context.filePath).replace(/\\/g, '/');
  const segments = rel.split('/');
  if (segments.length === 2 && segments[1] === 'issue.md') {
    return segments[0];
  }
  return null;
}

/**
 * Re-root a single relative href at the issue folder, emitting a tracker-base
 * relative path. Absolute / external / anchor links are returned unchanged.
 */
function reRoot(href: string, issueId: string): string {
  if (
    href.startsWith('http') || href.startsWith('//') || href.startsWith('/') ||
    href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')
  ) {
    return href;
  }

  const hashIndex = href.indexOf('#');
  let pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const fragment = hashIndex >= 0 ? href.slice(hashIndex) : '';
  if (!pathPart) return href;

  // Strip md/mdx (the shared internal-links pass may already have done this — idempotent).
  pathPart = pathPart.replace(/\.(mdx|md)$/, '');

  // Re-root at the issue folder, normalised, relative to the tracker base.
  let reRooted = path.posix.normalize(path.posix.join(issueId, pathPart)).replace(/^\/+/, '');

  return reRooted + fragment;
}

export const issueBodyLinksPostprocessor: Processor = {
  name: 'issue-body-links',
  process(content: string, context: ProcessContext): string {
    const issueId = issueRootBodyId(context);
    if (!issueId) return content;

    return content.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, href, after) => {
        const newHref = reRoot(href, issueId);
        if (newHref === href) return match;
        return `<a ${before}href="${newHref}"${after}>`;
      }
    );
  },
};
