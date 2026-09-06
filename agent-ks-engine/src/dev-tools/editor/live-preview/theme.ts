/**
 * Live Preview — theme styles
 * CSS classes applied by the decoration builder.
 */

import { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

export const livePreviewBaseTheme: Extension = EditorView.baseTheme({
  // ---- Editor padding in live preview ----
  '&.cm-lp-active .cm-content': { padding: '8px 24px 8px 8px' },
  '&.cm-lp-active .cm-line': { padding: '0 4px' },

  // ---- Headings (line decorations) ----
  '.cm-lp-h1': { fontSize: '1.8em', lineHeight: '1.4', fontWeight: '700', padding: '8px 4px 4px' },
  '.cm-lp-h2': { fontSize: '1.5em', lineHeight: '1.4', fontWeight: '600', padding: '6px 4px 3px' },
  '.cm-lp-h3': { fontSize: '1.25em', lineHeight: '1.3', fontWeight: '600', padding: '4px 4px 2px' },
  '.cm-lp-h4': { fontSize: '1.1em', lineHeight: '1.3', fontWeight: '600', padding: '2px 4px' },
  '.cm-lp-h5': { fontSize: '1.0em', lineHeight: '1.3', fontWeight: '600', padding: '2px 4px' },
  '.cm-lp-h6': { fontSize: '0.9em', lineHeight: '1.3', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 4px' },

  // ---- Inline formatting ----
  '.cm-lp-bold': { fontWeight: '700' },
  '.cm-lp-italic': { fontStyle: 'italic' },
  '.cm-lp-strike': { textDecoration: 'line-through' },
  '.cm-lp-code': { fontFamily: 'monospace', padding: '2px 5px', borderRadius: '3px', fontSize: '0.9em' },
  '.cm-lp-link': { textDecoration: 'underline', cursor: 'pointer' },

  // ---- Blockquote (line decoration) ----
  '.cm-lp-bq': { borderLeft: '3px solid', paddingLeft: '16px !important' },

  // ---- Code block (line decorations) ----
  '.cm-lp-codeblock': { fontFamily: 'monospace', fontSize: '0.9em', padding: '1px 16px !important' },
  '.cm-lp-codeblock-first': { borderRadius: '6px 6px 0 0', paddingTop: '10px !important' },
  '.cm-lp-codeblock-last': { borderRadius: '0 0 6px 6px', paddingBottom: '10px !important' },
  '.cm-lp-codeblock-single': { borderRadius: '6px', paddingTop: '10px !important', paddingBottom: '10px !important' },

  // ---- Table ----
  '.cm-lp-table-line': { fontFamily: 'monospace', fontSize: '0.9em', padding: '2px 4px' },
  '.cm-lp-table-header': { fontWeight: '600' },

  // ---- Lists ----
  '.cm-lp-bullet': { fontSize: '0', letterSpacing: '0' },
  '.cm-lp-bullet::after': { content: '"\\2022"', fontSize: '14px', letterSpacing: 'normal' },

  // ---- Task line (flex: indent + checkbox-column + text) ----
  '.cm-lp-task-line': {
    display: 'inline-flex',
    alignItems: 'flex-start',
    width: '100%',
  },
  '.cm-lp-task-indent': {
    whiteSpace: 'pre',
    flexShrink: '0',
  },
  // Checkbox column
  '.cm-lp-task-cb-col': {
    flexShrink: '0',
    marginRight: '8px',
  },
  '.cm-lp-task-text': {
    flex: '1',
    minWidth: '0',
  },

  // Vertical connector on nested child lines — positioned at parent checkbox center
  '.cm-lp-task-child-line': {
    borderLeft: '1px solid',
    // Use CSS var set by the decoration to position the line under parent's checkbox
    // --task-indent is the parent's whitespace indent in ch units + offset for checkbox center
    marginLeft: 'calc(var(--task-indent, 0ch) + 8px)',
    paddingLeft: '4px !important',
  },

  // ---- Checkbox circle ----
  '.cm-lp-checkbox': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    minWidth: '16px',
    borderRadius: '50%',
    border: '1.5px solid',
    cursor: 'pointer',
    boxSizing: 'border-box',
    flexShrink: '0',
  },
  '.cm-lp-checkbox svg': {
    width: '10px',
    height: '10px',
  },
  '.cm-lp-checkbox-checked': {
    borderWidth: '0',
  },
  '.cm-lp-task-done': {
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(128,128,128,0.5)',
    color: '#999',
  },

  // ---- HR ----
  '.cm-lp-hr': {
    border: 'none',
    borderTop: '1px solid',
    margin: '12px 0',
    opacity: '0.3',
  },

  // ---- Properties ----
  '.cm-lp-props': { borderRadius: '6px', margin: '4px 0 8px', overflow: 'hidden', fontSize: '13px' },
  '.cm-lp-props-hdr': { fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px 4px', opacity: '0.5' },
  '.cm-lp-props-row': { display: 'flex', padding: '4px 12px', gap: '12px', alignItems: 'baseline' },
  '.cm-lp-props-key': { fontWeight: '500', minWidth: '100px', flexShrink: '0', opacity: '0.7' },
  '.cm-lp-props-val': { flex: '1' },
});

export const livePreviewDark: Extension = EditorView.theme({
  '.cm-lp-checkbox': { borderColor: '#888' },
  '.cm-lp-checkbox-checked': { background: '#555', color: '#fff' },
  '.cm-lp-task-child-line': { borderColor: '#333' },
  '.cm-lp-code': { background: 'rgba(255,255,255,0.08)' },
  '.cm-lp-link': { color: '#7aa2f7' },
  '.cm-lp-bq': { borderColor: '#444' },
  '.cm-lp-codeblock': { background: '#161616', borderLeft: '2px solid #333' },
  '.cm-lp-table-line': { background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid #222' },
  '.cm-lp-table-header': { background: 'rgba(255,255,255,0.06)', borderBottom: '2px solid #444 !important' },
  '.cm-lp-hr': { borderColor: '#444' },
  '.cm-lp-props': { background: '#141414', border: '1px solid #2a2a2a' },
  '.cm-lp-props-row:nth-child(even)': { background: 'rgba(255,255,255,0.02)' },
}, { dark: true });

export const livePreviewLight: Extension = EditorView.theme({
  '.cm-lp-checkbox': { borderColor: '#ccc' },
  '.cm-lp-checkbox-checked': { background: '#555', color: '#fff' },
  '.cm-lp-task-child-line': { borderColor: '#e0e0e0' },
  '.cm-lp-code': { background: 'rgba(0,0,0,0.06)' },
  '.cm-lp-link': { color: '#0969da' },
  '.cm-lp-bq': { borderColor: '#ddd' },
  '.cm-lp-codeblock': { background: '#f5f5f5', borderLeft: '2px solid #ddd' },
  '.cm-lp-table-line': { background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid #eee' },
  '.cm-lp-table-header': { background: 'rgba(0,0,0,0.04)', borderBottom: '2px solid #ccc !important' },
  '.cm-lp-hr': { borderColor: '#ddd' },
  '.cm-lp-props': { background: '#f8f8f8', border: '1px solid #e5e5e5' },
  '.cm-lp-props-row:nth-child(even)': { background: 'rgba(0,0,0,0.02)' },
});
