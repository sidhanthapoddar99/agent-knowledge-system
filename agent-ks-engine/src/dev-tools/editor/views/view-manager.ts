/**
 * View Manager — coordinates editor mode and preview panel.
 *
 * Mode (what the editor shows): source | live-preview | wysiwyg
 * Preview (rendered HTML panel): on | off
 *
 * The editor pane is always visible unless in "preview-only" state
 * (no editor mode, just full-width preview).
 */

import type { EditorView } from '@codemirror/view';
import type { Disposable } from '../types.js';
import type { EditorMode, SplitDirection, ViewState } from './types.js';
import type { PreviewPanel } from './preview.js';

export interface ViewManagerDom {
  editorPane: HTMLDivElement;
  previewPane: HTMLDivElement;
  previewResizeHandle: HTMLDivElement;
  splitArea: HTMLDivElement;
}

export interface ViewManagerHandle extends Disposable {
  getState(): ViewState;
  setMode(mode: EditorMode): Promise<void>;
  setPreviewOpen(open: boolean): void;
  setPreviewOnly(on: boolean): void;
  setSplitDirection(dir: SplitDirection): void;
  /** Call after editor view is created/changed */
  setEditorView(view: EditorView | null): void;
}

export function initViewManager(
  dom: ViewManagerDom,
  preview: PreviewPanel,
  getTheme: () => 'dark' | 'light',
): ViewManagerHandle {
  // Restore state from localStorage
  const savedMode = localStorage.getItem('ev2-editor-mode') as EditorMode | null;
  const savedPreview = localStorage.getItem('ev2-preview-open');
  const savedSplit = localStorage.getItem('ev2-split-dir') as SplitDirection | null;

  const state: ViewState = {
    mode: savedMode || 'source',
    previewOpen: savedPreview !== 'false', // default on
    splitDirection: savedSplit || 'vertical',
  };

  let currentView: EditorView | null = null;
  let previewOnly = false;

  function persist() {
    localStorage.setItem('ev2-editor-mode', state.mode);
    localStorage.setItem('ev2-preview-open', String(state.previewOpen));
    localStorage.setItem('ev2-split-dir', state.splitDirection);
  }

  function applyLayout() {
    if (previewOnly) {
      // Preview-only: no editor, full-width preview
      dom.editorPane.style.display = 'none';
      dom.previewResizeHandle.style.display = 'none';
      preview.show();
      preview.setFullWidth(true);
      return;
    }

    // Editor always visible
    dom.editorPane.style.display = 'flex';

    if (state.previewOpen) {
      preview.show();
      preview.setFullWidth(false);
      dom.previewResizeHandle.style.display = 'block';
      // Apply split direction
      dom.splitArea.classList.toggle('horizontal', state.splitDirection === 'horizontal');
    } else {
      preview.hide();
      dom.previewResizeHandle.style.display = 'none';
    }
  }

  async function applyMode() {
    if (!currentView) return;

    const { livePreviewCompartment } = await import('../core/codemirror-setup.js');

    if (state.mode === 'live-preview') {
      const { livePreviewExtension } = await import('../live-preview/index.js');
      currentView.dispatch({
        effects: livePreviewCompartment.reconfigure(livePreviewExtension(getTheme())),
      });
    } else {
      // source or wysiwyg — no live preview decorations
      currentView.dispatch({
        effects: livePreviewCompartment.reconfigure([]),
      });
    }
  }

  // Apply initial layout
  applyLayout();

  return {
    getState: () => ({ ...state }),

    async setMode(mode: EditorMode) {
      state.mode = mode;
      persist();
      await applyMode();
    },

    setPreviewOpen(open: boolean) {
      previewOnly = false;
      state.previewOpen = open;
      persist();
      applyLayout();
    },

    setPreviewOnly(on: boolean) {
      previewOnly = on;
      applyLayout();
    },

    setSplitDirection(dir: SplitDirection) {
      state.splitDirection = dir;
      persist();
      if (state.previewOpen) applyLayout();
    },

    setEditorView(view: EditorView | null) {
      currentView = view;
      if (view) applyMode();
    },

    cleanup() {},
  };
}
