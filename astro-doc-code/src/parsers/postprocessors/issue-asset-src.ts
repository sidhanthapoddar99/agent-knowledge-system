/**
 * Issue Asset Src Postprocessor (issues pipeline only)
 *
 * Relative image srcs in issue content can never resolve in the browser:
 * the root `issue.md` renders at the collapsed detail URL (one segment
 * shallower than the file), sub-doc bodies are also embedded inline in the
 * detail page's Comprehensive panel, and no HTTP route serves files out of
 * issue folders anyway. So `![](./assets/x.svg)` 404s on every issue route.
 *
 * Fix: rewrite each relative `<img src>` (covers both rendered `![]()` and
 * raw inline `<img>`, since the renderer runs sanitize:false) to a
 * root-absolute URL under `/issue-assets/<path-relative-to-tracker-root>`,
 * served by `src/pages/issue-assets/[...path].ts`. Absolute URLs are
 * browser-position-independent, so the same markup works at any depth —
 * the same approach subtask 03 of `2026-06-09-issue-link-resolution` plans
 * for internal links.
 *
 * Srcs that are external, root-absolute, `data:`, or alias references are
 * left untouched, as is anything that resolves outside the tracker root.
 */

import path from 'path';
import type { Processor, ProcessContext } from '../types';

export const ISSUE_ASSETS_URL_PREFIX = '/issue-assets';

function rewriteSrc(src: string, context: ProcessContext): string | null {
  if (
    src.startsWith('http') || src.startsWith('//') || src.startsWith('/') ||
    src.startsWith('data:') || src.startsWith('@')
  ) {
    return null;
  }

  const abs = path.resolve(context.fileDir, src);
  const rel = path.relative(context.basePath, abs).replace(/\\/g, '/');
  // Escapes the tracker root — not ours to serve, leave it alone.
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;

  return `${ISSUE_ASSETS_URL_PREFIX}/${rel}`;
}

export const issueAssetSrcPostprocessor: Processor = {
  name: 'issue-asset-src',
  process(content: string, context: ProcessContext): string {
    return content.replace(
      /<img\s+([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, src, after) => {
        const newSrc = rewriteSrc(src, context);
        if (!newSrc) return match;
        return `<img ${before}src="${newSrc}"${after}>`;
      }
    );
  },
};
