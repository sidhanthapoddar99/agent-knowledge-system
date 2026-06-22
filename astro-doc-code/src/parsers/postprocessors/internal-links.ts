/**
 * Internal Links Postprocessor
 * Rewrites relative markdown links to match generated slugs:
 *   - Strips .md/.mdx extensions
 *   - Strips XX_ position prefixes from path segments
 *   - Preserves fragment identifiers (#section)
 *
 * Example: ./02_consensus-mechanism.md#overview → ./consensus-mechanism#overview
 */

import type { Processor, ProcessContext } from '../types';
import { stripOrderPrefix } from '../core/order-prefix';

/**
 * Strip the NN_ ordering prefix (2–5 digits) from a single path segment
 */
function stripPrefix(segment: string): string {
  return stripOrderPrefix(segment);
}

/**
 * Rewrite a relative href to match the generated slug
 */
function rewriteHref(href: string): string {
  // Only process relative links (./  ../  or bare filenames ending in .md)
  if (!href.startsWith('./') && !href.startsWith('../') && !href.match(/\.mdx?($|#)/)) {
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

    return content.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, href, after) => {
        // Skip absolute URLs, protocol links, and fragment-only links
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('/')) {
          return match;
        }

        const newHref = rewriteHref(href);
        if (newHref === href) return match;

        return `<a ${before}href="${newHref}"${after}>`;
      }
    );
  },
};
