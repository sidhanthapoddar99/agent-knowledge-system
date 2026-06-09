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
 * Sub-doc pages (subtasks / notes / agent-log) are served at a URL depth that
 * MATCHES their file depth, so their relative links already resolve correctly —
 * this transform must NOT touch them. It only fires for the root `issue.md`.
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
