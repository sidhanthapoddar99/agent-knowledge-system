/**
 * Live Preview — Obsidian-style hybrid markdown/preview mode
 *
 * Shows styled content with syntax markers hidden.
 * Cursor on a line reveals the raw markdown for editing.
 * Uses StateField (not ViewPlugin) to support block-level decorations.
 *
 * Also adds a ViewPlugin to handle delayed tree parsing — on first load
 * the Lezer tree may not be fully parsed, so we schedule a re-render
 * once parsing completes.
 */

import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { Compartment, StateField, type Extension } from '@codemirror/state';
import { syntaxTreeAvailable } from '@codemirror/language';
import { buildLivePreviewDecorations } from './build-decorations.js';
import { livePreviewBaseTheme, livePreviewDark, livePreviewLight } from './theme.js';

export const livePreviewCompartment = new Compartment();

// StateField provides the decorations (supports block widgets like HR, Properties)
const livePreviewField = StateField.define<DecorationSet>({
  create(state) {
    return buildLivePreviewDecorations(state);
  },
  update(value, tr) {
    if (tr.docChanged || tr.selection) {
      return buildLivePreviewDecorations(tr.state);
    }
    return value;
  },
  provide: f => EditorView.decorations.from(f),
});

// ViewPlugin handles delayed tree parsing — forces re-render once tree is ready
const treeReadyPlugin = ViewPlugin.define(view => {
  let scheduled = false;
  let lastTreeVersion = -1;

  function checkTree() {
    const ready = syntaxTreeAvailable(view.state, view.state.doc.length);
    if (ready && lastTreeVersion !== view.state.doc.length) {
      lastTreeVersion = view.state.doc.length;
      // Force StateField to recompute by dispatching a no-op selection
      view.dispatch({ selection: view.state.selection });
    }
    if (!ready && !scheduled) {
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        checkTree();
      });
    }
  }

  // Check on first load
  setTimeout(() => checkTree(), 100);

  return {
    update(update: ViewUpdate) {
      if (update.docChanged) {
        setTimeout(() => checkTree(), 50);
      }
    },
  };
});

// Add cm-lp-active class to the editor when live preview is on (for CSS scoping)
const livePreviewEditorClass = EditorView.editorAttributes.of({ class: 'cm-lp-active' });

export function livePreviewExtension(theme: 'dark' | 'light'): Extension {
  return [
    livePreviewField,
    treeReadyPlugin,
    livePreviewEditorClass,
    livePreviewBaseTheme,
    theme === 'dark' ? livePreviewDark : livePreviewLight,
  ];
}
