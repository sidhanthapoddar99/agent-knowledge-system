/**
 * WYSIWYG view — true rich text editing (future).
 *
 * Planned: ProseMirror or similar rich-text engine where users
 * never see markdown syntax. Currently a placeholder.
 */

import type { Extension } from '@codemirror/state';

/**
 * WYSIWYG is not yet implemented.
 * This placeholder exists so the view system has a consistent interface.
 */
export function wysiwygExtensions(): Extension[] {
  return [];
}

/** Whether WYSIWYG mode is available */
export const wysiwygAvailable = false;
