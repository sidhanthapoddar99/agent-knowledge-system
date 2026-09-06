/**
 * Preview panel — rendered HTML display.
 *
 * This is a toggle, not a mode. It can be combined with any editor mode:
 * source + preview, live-preview + preview, or preview-only (no editor).
 *
 * Content is rendered client-side via the renderer module.
 */

import type { Disposable } from '../types.js';
import { createClientRenderer, type ClientRenderer } from '../renderer/index.js';

export interface PreviewPanel extends Disposable {
  /** Update preview with rendered HTML */
  setContent(html: string): void;
  /** Show the preview panel */
  show(): void;
  /** Hide the preview panel */
  hide(): void;
  /** Set to full-width (preview-only mode) */
  setFullWidth(full: boolean): void;
  /** Get the client-side renderer (for wiring to ytext) */
  getRenderer(): ClientRenderer;
  /** Get the content element (for scroll sync) */
  getContentElement(): HTMLElement;
}

export function initPreviewPanel(
  pane: HTMLDivElement,
  contentEl: HTMLElement,
  resizeHandle: HTMLDivElement,
): PreviewPanel {
  let lastHtml = '';

  const renderer = createClientRenderer((html) => {
    setContent(html);
  });

  function setContent(html: string) {
    if (html === lastHtml) return;
    lastHtml = html;
    const scrollTop = contentEl.scrollTop;
    contentEl.innerHTML = `<div class="docs-content"><article class="docs-article"><div class="docs-body markdown-content">${html}</div></article></div>`;
    contentEl.scrollTop = scrollTop;
    document.dispatchEvent(new CustomEvent('diagrams:render'));
  }

  function show() {
    pane.style.display = 'flex';
  }

  function hide() {
    pane.style.display = 'none';
    resizeHandle.style.display = 'none';
  }

  function setFullWidth(full: boolean) {
    if (full) {
      pane.style.width = '100%';
      pane.style.maxWidth = '100%';
      pane.style.height = '';
      pane.style.borderLeft = 'none';
      pane.style.borderTop = 'none';
      pane.classList.add('ev2-preview-full');
    } else {
      pane.style.width = '';
      pane.style.maxWidth = '';
      pane.style.borderLeft = '';
      pane.style.borderTop = '';
      pane.classList.remove('ev2-preview-full');
    }
  }

  return {
    setContent,
    show,
    hide,
    setFullWidth,
    getRenderer: () => renderer,
    getContentElement: () => contentEl,
    cleanup() {
      renderer.cleanup();
    },
  };
}
