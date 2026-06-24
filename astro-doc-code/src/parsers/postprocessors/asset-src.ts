/**
 * Asset Src Postprocessor (shared across docs, blog, and issues)
 *
 * Relative image srcs in content — rendered `![](./assets/x.png)` or raw inline
 * `<img src="./img/y.svg">` — can't resolve in the browser: a content file
 * renders at a URL that doesn't mirror its on-disk folder, and no static route
 * serves files out of content dirs. So a relative src 404s on every page.
 *
 * Fix: rewrite each relative `<img src>` to a root-absolute URL under
 * `/content-assets/<path-relative-to-the-content-root>`, served by
 * `src/pages/content-assets/[...path].ts`. The path is taken relative to the
 * content root (a `data*` dir from site.yaml `paths:`, category 'content'), so
 * it is globally unique across every section / tracker / blog post — no
 * collisions, and the same markup works at any page depth.
 *
 * NOT keyed on a folder named `assets`: any relative colocated file works
 * (`./assets/x.png`, `./img/y.svg`, `./z.png`). Non-markdown files are never
 * indexed into the sidebar (the loaders glob only `**\/*.{md,mdx}`), so
 * colocating assets stays invisible to navigation.
 *
 * Srcs that are external, root-absolute, `data:`, or alias (`@`) references are
 * left untouched, as is anything that resolves outside every content root.
 */
import path from 'path';
import { getPathsByCategory } from '../../loaders/paths';
import type { Processor, ProcessContext } from '../types';

export const CONTENT_ASSETS_URL_PREFIX = '/content-assets';

/** The content root (longest match wins) that contains `absPath`, or null. */
function contentRootFor(absPath: string): string | null {
  const roots = getPathsByCategory('content')
    .map((r) => path.normalize(r))
    .sort((a, b) => b.length - a.length);
  for (const root of roots) {
    const rel = path.relative(root, absPath);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) return root;
  }
  return null;
}

function rewriteSrc(src: string, context: ProcessContext): string | null {
  if (
    src.startsWith('http') || src.startsWith('//') || src.startsWith('/') ||
    src.startsWith('data:') || src.startsWith('@')
  ) {
    return null;
  }
  const abs = path.resolve(context.fileDir, src);
  const root = contentRootFor(abs);
  // Outside every content root — not ours to serve, leave it alone.
  if (!root) return null;
  const rel = path.relative(root, abs).replace(/\\/g, '/');
  return `${CONTENT_ASSETS_URL_PREFIX}/${rel}`;
}

export const assetSrcPostprocessor: Processor = {
  name: 'asset-src',
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
