/**
 * Internal Links Postprocessor
 * Rewrites relative markdown links to match generated slugs:
 *   - Strips .md/.mdx extensions
 *   - Strips XX_ position prefixes from path segments
 *   - Preserves fragment identifiers (#section)
 *   - Shifts the link up one level, because the page's URL is one level deeper
 *     than its source directory (see below)
 *
 * Example: ./02_consensus-mechanism.md#overview → ../consensus-mechanism#overview
 *
 * THE URL-DEPTH SHIFT, which is the whole reason this file is not a simple
 * string strip. Links are authored against the file's own directory on disk —
 * that is what an editor previews, what a link checker resolves, and what
 * `agent-ks move` recomputes. But a page is emitted as `<slug>/index.html` and
 * served with a trailing slash, so the file's own NAME has become a directory
 * segment in the URL:
 *
 *   source  05_getting-started/02_installation.md   base: 05_getting-started/
 *   URL     /user-guide/getting-started/installation/   base: …/installation/
 *
 * So `./05_claude-skills.md` — correct on disk, sitting right beside the file —
 * resolved to …/installation/claude-skills and 404'd. Every relative link on
 * every non-index page was broken this way.
 *
 * This was originally diagnosed as an authoring problem and 341 content links
 * were rewritten to site-absolute form before anyone opened this file. Do not do
 * that: `agent-ks move` skips links starting with `/`, so the absolute form
 * renders fine and silently leaves link maintenance forever.
 *
 * INDEX PAGES ARE EXEMPT. `DocsParser.generateSlug` collapses a trailing
 * `/index`, so `a/index.md` publishes at `a` and its URL base already IS its
 * source directory. Shifting those would break them in the opposite direction.
 */

import path from 'node:path';
import type { Processor, ProcessContext } from '../types';
import { stripOrderPrefix } from '../core/order-prefix';

/**
 * Strip the NN_ ordering prefix (2–5 digits) from a single path segment
 */
function stripPrefix(segment: string): string {
  return stripOrderPrefix(segment);
}

/**
 * Does this page's slug collapse onto its own source directory?
 *
 * Mirrors `DocsParser.generateSlug`, which strips the extension and then applies
 * `.replace(/\/index$/, '')`. The leading slash in that pattern matters: a
 * content-root-level `index.md` has no parent segment, so it is NOT collapsed
 * and is NOT exempt. Kept as a mirror of that one line rather than a guess about
 * it — if the slug rule changes, this has to change with it.
 */
function isIndexPage(context: ProcessContext): boolean {
  if (!context.basePath || !context.filePath) return false;
  const rel = path.relative(context.basePath, context.filePath).replace(/\\/g, '/');
  return /\/index$/.test(rel.replace(/\.(mdx|md)$/, ''));
}

/**
 * Rewrite a relative href to match the generated slug.
 *
 * `addLevel` prepends one `..` to compensate for the page's URL being one
 * segment deeper than its source directory. False only for index pages.
 */
function rewriteHref(href: string, addLevel: boolean): string {
  // Only process relative links (./  ../  or bare filenames ending in .md)
  if (!href.startsWith('./') && !href.startsWith('../') && !href.match(/\.mdx?($|#)/)) {
    return href;
  }

  // A link to a colocated FILE (./assets/scene.excalidraw, ../img/x.png) is not
  // a page link — `asset-src` owns it, and resolves it against the source file's
  // directory on disk rather than against the page URL. Shifting it here would
  // send that resolution one directory too high, which is exactly what happened
  // the first time the level shift was added: the <img> came out right and the
  // <a> to the same file came out one level up. Anything with an extension that
  // is not markdown belongs to another processor.
  if (/\.[a-z0-9]+($|#)/i.test(href) && !/\.mdx?($|#)/i.test(href)) {
    return href;
  }

  // Split off fragment (#section-id)
  const hashIndex = href.indexOf('#');
  let pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const fragment = hashIndex >= 0 ? href.slice(hashIndex) : '';

  // Strip .md/.mdx extension
  pathPart = pathPart.replace(/\.(mdx|md)$/, '');

  // Strip XX_ prefixes from each path segment (but not ./ or ../)
  pathPart = pathPart
    .split('/')
    .map(seg => (seg === '.' || seg === '..') ? seg : stripPrefix(seg))
    .join('/');

  // Remove /index suffix (index pages resolve to parent)
  pathPart = pathPart.replace(/\/index$/, '');

  // Shift up one level to cancel the segment the page's own URL adds.
  // path.posix.join normalises all three input shapes correctly:
  //   ./x → ../x     ../x → ../../x     x → ../x
  if (addLevel && pathPart) {
    pathPart = path.posix.join('..', pathPart);
  }

  return pathPart + fragment;
}

export const internalLinksPostprocessor: Processor = {
  name: 'internal-links',
  process(content: string, context: ProcessContext): string {
    // Only apply to docs content (blog doesn't use XX_ prefixes)
    if (context.contentType !== 'docs') {
      // For non-docs, still strip .md extensions
      return content.replace(
        /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
        (match, before, href, after) => {
          if (!href.match(/\.mdx?($|#)/)) return match;
          const newHref = href.replace(/\.(mdx|md)($|#)/, '$2');
          return `<a ${before}href="${newHref}"${after}>`;
        }
      );
    }

    const addLevel = !isIndexPage(context);

    return content.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, href, after) => {
        // Skip absolute URLs, protocol links, and fragment-only links
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('/')) {
          return match;
        }

        const newHref = rewriteHref(href, addLevel);
        if (newHref === href) return match;

        return `<a ${before}href="${newHref}"${after}>`;
      }
    );
  },
};
