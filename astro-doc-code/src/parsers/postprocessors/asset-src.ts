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

/**
 * Resolve a relative colocated-file reference to its served
 * `/content-assets/…` URL, or null when it isn't ours to rewrite
 * (external, root-absolute, data:, alias, or outside every content root).
 * Exported for processors that need the URL without an `<img>` tag
 * (e.g. the excalidraw-embed postprocessor).
 */
export function resolveContentAssetUrl(src: string, context: ProcessContext): string | null {
  if (
    src.startsWith('http') || src.startsWith('//') || src.startsWith('/') ||
    src.startsWith('data:') || src.startsWith('@') || src.startsWith('#')
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

// Page links (.md/.mdx, handled by internal-links) and extension-less hrefs
// are never file links; everything else with a real extension is.
const PAGE_EXTENSIONS = new Set(['.md', '.mdx']);

function isColocatedFileHref(href: string): boolean {
  const pathPart = href.split('#')[0].split('?')[0];
  const ext = path.extname(pathPart);
  return ext.length > 1 && !PAGE_EXTENSIONS.has(ext.toLowerCase());
}

export const assetSrcPostprocessor: Processor = {
  name: 'asset-src',
  process(content: string, context: ProcessContext): string {
    const rewritten = content.replace(
      /<img\s+([^>]*?)src\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, src, after) => {
        const newSrc = resolveContentAssetUrl(src, context);
        if (!newSrc) return match;
        return `<img ${before}src="${newSrc}"${after}>`;
      }
    );
    // Plain links to colocated non-page files (`[Spec](./assets/api.pdf)`,
    // `[Name](./assets/arch.excalidraw)`) — same rewrite, or the href 404s
    // (pages don't render at their on-disk paths).
    return rewritten.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, href, after) => {
        if (!isColocatedFileHref(href)) return match;
        const newHref = resolveContentAssetUrl(href, context);
        if (!newHref) return match;
        return `<a ${before}href="${newHref}"${after}>`;
      }
    );
  },
};
