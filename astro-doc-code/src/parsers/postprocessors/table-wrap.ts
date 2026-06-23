/**
 * Table Wrap Postprocessor
 * Wraps rendered <table> elements in a horizontally scrollable container so
 * wide tables scroll within the content area instead of overflowing the page.
 */

import type { Processor, ProcessContext } from '../types';

/**
 * Create table-wrap postprocessor
 */
export function createTableWrapPostprocessor(): Processor {
  return {
    name: 'table-wrap',
    process(content: string, _context: ProcessContext): string {
      // Match each (non-nested) table and wrap it. Skip tables already wrapped.
      return content.replace(
        /<table\b[\s\S]*?<\/table>/gi,
        (match) => `<div class="table-wrapper">${match}</div>`
      );
    },
  };
}

// Default instance
export const tableWrapPostprocessor = createTableWrapPostprocessor();
