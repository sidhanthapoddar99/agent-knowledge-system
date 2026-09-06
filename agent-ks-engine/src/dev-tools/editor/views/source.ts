/**
 * Source view — raw markdown with CM6 syntax highlighting.
 * This is the default mode. No decorations beyond standard CM6 markdown highlighting.
 */

import type { Extension } from '@codemirror/state';

/**
 * Returns CM6 extensions for source mode.
 * Currently empty — source mode is just the base CM6 config.
 * Exists as a module for consistency with other views.
 */
export function sourceExtensions(): Extension[] {
  return [];
}
