/**
 * CodeMirror 6 setup — base extensions, keybindings
 *
 * Theme is NOT included here — it's passed via `opts.extensions`
 * from the caller (editor-page.ts) so dark/light can be swapped.
 */

import { EditorState, type Extension, Compartment } from '@codemirror/state';
import { EditorView, keymap, drawSelection, highlightActiveLine, highlightSpecialChars, lineNumbers } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { bracketMatching, indentOnInput } from '@codemirror/language';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { autocompletion } from '@codemirror/autocomplete';
import { search, searchKeymap } from '@codemirror/search';
import { formattingKeymap } from './formatting-commands.js';
import { livePreviewCompartment } from '../live-preview/index.js';

export { livePreviewCompartment } from '../live-preview/index.js';

export const readOnlyCompartment = new Compartment();
export const languageCompartment = new Compartment();
export const lineWrappingCompartment = new Compartment();
export const themeCompartment = new Compartment();

export interface EditorSetupOptions {
  onSave: () => void;
  onClose: () => void;
  parent: HTMLElement;
  initialDoc?: string;
  readOnly?: boolean;
  wordWrap?: boolean;
  /** Theme extensions (inside themeCompartment — hot-swappable) */
  themeExtensions?: Extension[];
  /** Other extensions (Yjs, etc. — static) */
  extensions?: Extension[];
}

export function createEditorView(opts: EditorSetupOptions): EditorView {
  const extensions: Extension[] = [
    highlightSpecialChars(),
    lineNumbers(),
    history(),
    drawSelection(),
    indentOnInput(),
    bracketMatching(),
    highlightActiveLine(),

    // Markdown language with nested code block highlighting
    languageCompartment.of(markdown({ base: markdownLanguage, codeLanguages: languages })),

    // Line wrapping (toggleable via compartment)
    lineWrappingCompartment.of(opts.wordWrap !== false ? EditorView.lineWrapping : []),

    // Autocomplete (slash commands added later)
    autocompletion({ override: [] }),

    // Search
    search(),

    // Keybindings
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...formattingKeymap(),
      indentWithTab,
      { key: 'Mod-s', run: () => { opts.onSave(); return true; } },
      { key: 'Escape', run: () => { opts.onClose(); return true; } },
    ]),

    // ReadOnly (toggled after Yjs sync)
    readOnlyCompartment.of(EditorState.readOnly.of(opts.readOnly ?? true)),

    // Live Preview decorations (toggled via compartment)
    livePreviewCompartment.of([]),

    // Theme (hot-swappable via themeCompartment — no editor destroy needed)
    themeCompartment.of(opts.themeExtensions ?? []),

    // Yjs + other static extensions from caller
    ...(opts.extensions ?? []),
  ];

  return new EditorView({
    state: EditorState.create({
      doc: opts.initialDoc ?? '',
      extensions,
    }),
    parent: opts.parent,
  });
}
