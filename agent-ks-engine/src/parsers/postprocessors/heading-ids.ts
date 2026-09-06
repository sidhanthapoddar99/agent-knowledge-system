/**
 * Heading IDs Postprocessor
 * Adds ID attributes to headings for table of contents and anchor links
 */

import type { Processor, ProcessContext } from '../types';

/**
 * Generate a URL-friendly slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove HTML tags
    .replace(/<[^>]+>/g, '')
    // Replace special characters with spaces
    .replace(/[^\w\s-]/g, '')
    // Replace whitespace with hyphens
    .replace(/\s+/g, '-')
    // Remove consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensure unique IDs by appending numbers for duplicates
 */
function ensureUniqueId(id: string, usedIds: Set<string>): string {
  if (!usedIds.has(id)) {
    usedIds.add(id);
    return id;
  }

  let counter = 1;
  let uniqueId = `${id}-${counter}`;
  while (usedIds.has(uniqueId)) {
    counter++;
    uniqueId = `${id}-${counter}`;
  }

  usedIds.add(uniqueId);
  return uniqueId;
}

/**
 * Create heading IDs postprocessor
 */
export function createHeadingIdsPostprocessor(): Processor {
  return {
    name: 'heading-ids',
    process(content: string, _context: ProcessContext): string {
      const usedIds = new Set<string>();

      // Match all heading tags (h1-h6) without existing id
      return content.replace(
        /<(h[1-6])(?:\s+([^>]*))?>([\s\S]*?)<\/\1>/gi,
        (match, tag, attrs, text) => {
          // Check if id already exists
          if (attrs && /\bid\s*=/i.test(attrs)) {
            return match;
          }

          // Generate slug from heading text
          const slug = slugify(text);
          if (!slug) {
            return match;
          }

          // Ensure unique ID
          const id = ensureUniqueId(slug, usedIds);

          // Build the new tag
          const attrStr = attrs ? ` ${attrs}` : '';
          return `<${tag}${attrStr} id="${id}">${text}</${tag}>`;
        }
      );
    },
  };
}

// Default instance
export const headingIdsPostprocessor = createHeadingIdsPostprocessor();
