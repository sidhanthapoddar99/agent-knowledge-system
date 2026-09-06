/**
 * External Links Postprocessor
 * Adds target="_blank" and rel="noopener noreferrer" to external links
 */

import type { Processor, ProcessContext } from '../types';

/**
 * Check if a URL is external (not same origin)
 */
function isExternalUrl(href: string): boolean {
  // Skip empty, fragment-only, or relative URLs
  if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
    return false;
  }

  // Check if it's an absolute URL (has protocol)
  if (href.startsWith('http://') || href.startsWith('https://')) {
    return true;
  }

  // Check for protocol-relative URLs
  if (href.startsWith('//')) {
    return true;
  }

  return false;
}

export interface ExternalLinksOptions {
  /** Add target="_blank" to external links */
  targetBlank?: boolean;
  /** Add rel="noopener noreferrer" to external links */
  noopener?: boolean;
  /** Custom domains to treat as internal (not external) */
  internalDomains?: string[];
}

const defaultOptions: ExternalLinksOptions = {
  targetBlank: true,
  noopener: true,
  internalDomains: [],
};

/**
 * Create external links postprocessor
 */
export function createExternalLinksPostprocessor(options: ExternalLinksOptions = {}): Processor {
  const opts = { ...defaultOptions, ...options };

  return {
    name: 'external-links',
    process(content: string, _context: ProcessContext): string {
      // Match anchor tags
      return content.replace(
        /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
        (match, before, href, after) => {
          // Skip if not external
          if (!isExternalUrl(href)) {
            return match;
          }

          // Check internal domains
          if (opts.internalDomains && opts.internalDomains.length > 0) {
            try {
              const url = new URL(href);
              if (opts.internalDomains.some(domain => url.hostname.endsWith(domain))) {
                return match;
              }
            } catch {
              // Invalid URL, treat as external
            }
          }

          // Check if attributes already exist
          const hasTarget = /target\s*=/i.test(before + after);
          const hasRel = /rel\s*=/i.test(before + after);

          let newAttrs = '';

          // Add target="_blank" if needed
          if (opts.targetBlank && !hasTarget) {
            newAttrs += ' target="_blank"';
          }

          // Add rel="noopener noreferrer" if needed
          if (opts.noopener && !hasRel) {
            newAttrs += ' rel="noopener noreferrer"';
          }

          return `<a ${before}href="${href}"${after}${newAttrs}>`;
        }
      );
    },
  };
}

// Default instance
export const externalLinksPostprocessor = createExternalLinksPostprocessor();
