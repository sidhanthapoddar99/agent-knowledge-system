/**
 * Editor V2 — VS Code-style themes for CodeMirror 6
 *
 * Dark: VS Code Dark+ inspired — #1e1e1e bg, #d4d4d4 text
 * Light: VS Code Light+ inspired — #ffffff bg, #1a1a1a text
 * Uniform text size (no heading scaling — this is source mode)
 */

import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { Extension } from '@codemirror/state';

// ---- Dark Theme (VS Code Dark+) ----

const darkColors = {
  bg:           '#0a0a0a',
  surface:      '#111111',
  border:       '#222222',
  text:         '#d4d4d4',
  textMuted:    '#858585',
  cursor:       '#aeafad',
  selection:    'rgba(38, 79, 120, 0.6)',
  activeLine:   '#2a2d2e',
  scrollThumb:  '#424242',
  matchBracket: 'rgba(255, 255, 255, 0.1)',
};

const darkEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: darkColors.bg,
    color: darkColors.text,
    fontSize: '14px',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
    lineHeight: '1.5',
    padding: '8px 0',
    caretColor: darkColors.cursor,
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: darkColors.cursor,
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: darkColors.activeLine,
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: `${darkColors.selection} !important`,
  },
  '.cm-gutters': {
    backgroundColor: darkColors.bg,
    color: darkColors.textMuted,
    borderRight: 'none',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: darkColors.activeLine,
    color: darkColors.text,
  },
  '.cm-scroller': {
    overflow: 'auto',
    height: '100%',
  },
  '.cm-matchingBracket': {
    backgroundColor: darkColors.matchBracket,
    outline: '1px solid #888',
  },
  '.cm-tooltip': {
    backgroundColor: darkColors.surface,
    border: `1px solid ${darkColors.border}`,
    color: darkColors.text,
    borderRadius: '3px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#04395e',
  },
  '.cm-panels': {
    backgroundColor: darkColors.surface,
    color: darkColors.text,
    borderBottom: `1px solid ${darkColors.border}`,
  },
  '.cm-panel input': {
    backgroundColor: '#3c3c3c',
    color: darkColors.text,
    border: `1px solid ${darkColors.border}`,
    borderRadius: '2px',
    padding: '3px 6px',
  },
  '.cm-panel button': {
    backgroundColor: darkColors.surface,
    color: darkColors.text,
    border: `1px solid ${darkColors.border}`,
    borderRadius: '2px',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(234, 92, 0, 0.33)',
    outline: '1px solid rgba(234, 92, 0, 0.5)',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: 'rgba(234, 92, 0, 0.55)',
  },
  '.cm-ySelectionInfo': {
    fontSize: '11px',
    fontFamily: 'system-ui, sans-serif',
    padding: '1px 4px',
    borderRadius: '3px',
    opacity: '0.85',
  },
  '.cm-scroller::-webkit-scrollbar': {
    width: '10px',
    height: '10px',
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    background: darkColors.bg,
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background: darkColors.scrollThumb,
    borderRadius: '0',
  },
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {
    background: '#555555',
  },
}, { dark: true });

// VS Code Dark+ syntax colors
const darkSyntax = HighlightStyle.define([
  // Comments — green
  { tag: tags.comment, color: '#6a9955' },
  { tag: tags.lineComment, color: '#6a9955' },
  { tag: tags.blockComment, color: '#6a9955' },

  // Strings — orange
  { tag: tags.string, color: '#ce9178' },
  { tag: tags.special(tags.string), color: '#ce9178' },

  // Keywords — blue/purple
  { tag: tags.keyword, color: '#569cd6' },
  { tag: tags.controlKeyword, color: '#c586c0' },
  { tag: tags.operatorKeyword, color: '#569cd6' },

  // Functions — light yellow
  { tag: tags.function(tags.variableName), color: '#dcdcaa' },
  { tag: tags.definition(tags.variableName), color: '#dcdcaa' },

  // Variables — light blue (default)
  { tag: tags.variableName, color: '#9cdcfe' },

  // Numbers, booleans — light green
  { tag: tags.number, color: '#b5cea8' },
  { tag: tags.bool, color: '#569cd6' },

  // Operators, punctuation
  { tag: tags.operator, color: '#d4d4d4' },
  { tag: tags.separator, color: '#d4d4d4' },
  { tag: tags.punctuation, color: '#d4d4d4' },
  { tag: tags.bracket, color: '#d4d4d4' },

  // Meta
  { tag: tags.meta, color: '#858585' },

  // Links
  { tag: tags.link, color: '#569cd6' },
  { tag: tags.url, color: '#569cd6' },

  // Headings — same size, just bold + blue
  { tag: tags.heading, color: '#569cd6' },
  { tag: tags.heading1, color: '#569cd6' },
  { tag: tags.heading2, color: '#569cd6' },
  { tag: tags.heading3, color: '#569cd6' },

  // Emphasis
  { tag: tags.emphasis, color: '#d4d4d4' },
  { tag: tags.strong, color: '#d4d4d4' },
  { tag: tags.strikethrough, color: '#858585' },

  // Code spans in markdown
  { tag: tags.monospace, color: '#ce9178' },

  // Frontmatter delimiters
  { tag: tags.processingInstruction, color: '#858585' },

  // Types — teal
  { tag: tags.typeName, color: '#4ec9b0' },
  { tag: tags.className, color: '#4ec9b0' },

  // Properties
  { tag: tags.propertyName, color: '#9cdcfe' },
  { tag: tags.labelName, color: '#9cdcfe' },

  // Constants
  { tag: tags.atom, color: '#569cd6' },
  { tag: tags.null, color: '#569cd6' },

  // Regex
  { tag: tags.regexp, color: '#d16969' },
  { tag: tags.escape, color: '#d7ba7d' },

  // HTML/JSX tags
  { tag: tags.tagName, color: '#569cd6' },
  { tag: tags.attributeName, color: '#9cdcfe' },
  { tag: tags.attributeValue, color: '#ce9178' },
]);

// ---- Light Theme (VS Code Light+) ----

const lightColors = {
  bg:           '#ffffff',
  surface:      '#f3f3f3',
  border:       '#e5e5e5',
  text:         '#1e1e1e',
  textMuted:    '#999999',
  cursor:       '#000000',
  selection:    'rgba(173, 214, 255, 0.5)',
  activeLine:   '#f8f8f8',
  scrollThumb:  '#c1c1c1',
  matchBracket: 'rgba(0, 0, 0, 0.07)',
};

const lightEditorTheme = EditorView.theme({
  '&': {
    backgroundColor: lightColors.bg,
    color: lightColors.text,
    fontSize: '14px',
    height: '100%',
  },
  '.cm-content': {
    fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Consolas", monospace',
    lineHeight: '1.5',
    padding: '8px 0',
    caretColor: lightColors.cursor,
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: lightColors.cursor,
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: lightColors.activeLine,
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: `${lightColors.selection} !important`,
  },
  '.cm-gutters': {
    backgroundColor: lightColors.bg,
    color: lightColors.textMuted,
    borderRight: 'none',
    minWidth: '48px',
  },
  '.cm-activeLineGutter': {
    backgroundColor: lightColors.activeLine,
    color: lightColors.text,
  },
  '.cm-scroller': {
    overflow: 'auto',
    height: '100%',
  },
  '.cm-matchingBracket': {
    backgroundColor: lightColors.matchBracket,
    outline: '1px solid #c8c8c8',
  },
  '.cm-tooltip': {
    backgroundColor: lightColors.surface,
    border: `1px solid ${lightColors.border}`,
    color: lightColors.text,
    borderRadius: '3px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: '#d6ebff',
  },
  '.cm-panels': {
    backgroundColor: lightColors.surface,
    color: lightColors.text,
    borderBottom: `1px solid ${lightColors.border}`,
  },
  '.cm-panel input': {
    backgroundColor: lightColors.bg,
    color: lightColors.text,
    border: `1px solid ${lightColors.border}`,
    borderRadius: '2px',
    padding: '3px 6px',
  },
  '.cm-panel button': {
    backgroundColor: lightColors.surface,
    color: lightColors.text,
    border: `1px solid ${lightColors.border}`,
    borderRadius: '2px',
  },
  '.cm-searchMatch': {
    backgroundColor: 'rgba(234, 92, 0, 0.2)',
    outline: '1px solid rgba(234, 92, 0, 0.4)',
  },
  '.cm-searchMatch-selected': {
    backgroundColor: 'rgba(234, 92, 0, 0.4)',
  },
  '.cm-ySelectionInfo': {
    fontSize: '11px',
    fontFamily: 'system-ui, sans-serif',
    padding: '1px 4px',
    borderRadius: '3px',
    opacity: '0.85',
  },
  '.cm-scroller::-webkit-scrollbar': {
    width: '10px',
    height: '10px',
  },
  '.cm-scroller::-webkit-scrollbar-track': {
    background: lightColors.bg,
  },
  '.cm-scroller::-webkit-scrollbar-thumb': {
    background: lightColors.scrollThumb,
    borderRadius: '0',
  },
  '.cm-scroller::-webkit-scrollbar-thumb:hover': {
    background: '#999999',
  },
}, { dark: false });

// VS Code Light+ syntax colors
const lightSyntax = HighlightStyle.define([
  // Comments — green
  { tag: tags.comment, color: '#008000' },
  { tag: tags.lineComment, color: '#008000' },
  { tag: tags.blockComment, color: '#008000' },

  // Strings — dark red
  { tag: tags.string, color: '#a31515' },
  { tag: tags.special(tags.string), color: '#a31515' },

  // Keywords — blue
  { tag: tags.keyword, color: '#0000ff' },
  { tag: tags.controlKeyword, color: '#af00db' },
  { tag: tags.operatorKeyword, color: '#0000ff' },

  // Functions — dark yellow
  { tag: tags.function(tags.variableName), color: '#795e26' },
  { tag: tags.definition(tags.variableName), color: '#795e26' },

  // Variables
  { tag: tags.variableName, color: '#001080' },

  // Numbers, booleans
  { tag: tags.number, color: '#098658' },
  { tag: tags.bool, color: '#0000ff' },

  // Operators, punctuation
  { tag: tags.operator, color: '#1e1e1e' },
  { tag: tags.separator, color: '#1e1e1e' },
  { tag: tags.punctuation, color: '#1e1e1e' },
  { tag: tags.bracket, color: '#1e1e1e' },

  // Meta
  { tag: tags.meta, color: '#999999' },

  // Links
  { tag: tags.link, color: '#0000ff' },
  { tag: tags.url, color: '#0000ff' },

  // Headings — same size, just bold + blue
  { tag: tags.heading, color: '#0000ff' },
  { tag: tags.heading1, color: '#0000ff' },
  { tag: tags.heading2, color: '#0000ff' },
  { tag: tags.heading3, color: '#0000ff' },

  // Emphasis
  { tag: tags.emphasis, color: '#1e1e1e' },
  { tag: tags.strong, color: '#1e1e1e' },
  { tag: tags.strikethrough, color: '#999999' },

  // Code spans
  { tag: tags.monospace, color: '#a31515' },

  // Frontmatter
  { tag: tags.processingInstruction, color: '#999999' },

  // Types — teal
  { tag: tags.typeName, color: '#267f99' },
  { tag: tags.className, color: '#267f99' },

  // Properties
  { tag: tags.propertyName, color: '#001080' },
  { tag: tags.labelName, color: '#001080' },

  // Constants
  { tag: tags.atom, color: '#0000ff' },
  { tag: tags.null, color: '#0000ff' },

  // Regex
  { tag: tags.regexp, color: '#811f3f' },
  { tag: tags.escape, color: '#ee0000' },

  // HTML/JSX tags
  { tag: tags.tagName, color: '#800000' },
  { tag: tags.attributeName, color: '#ff0000' },
  { tag: tags.attributeValue, color: '#0000ff' },
]);

// ---- Exports ----

export function darkTheme(): Extension[] {
  return [darkEditorTheme, syntaxHighlighting(darkSyntax)];
}

export function lightTheme(): Extension[] {
  return [lightEditorTheme, syntaxHighlighting(lightSyntax)];
}

export { darkColors, lightColors };
