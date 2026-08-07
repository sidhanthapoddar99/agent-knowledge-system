/**
 * Editor V2 Shell — Full-screen overlay layout
 *
 * Creates the Obsidian-style layout: sidebar | editor | preview
 * All three panels are resizable with drag handles.
 */

import type { EditorV2Dom } from '../types.js';
import { getShellCSS } from './shell-styles.js';

export function createShell(contentRootName: string): EditorV2Dom | null {
  if (document.getElementById('editor-v2-overlay')) return null;

  // Pull in the page's theme CSS. It used to be copied out of an inline
  // <style id="theme-styles">; it is now served from /theme.css, so the overlay
  // links the same URL. The browser already holds it, so this costs no request.
  const themeHref =
    document.documentElement.getAttribute('data-theme-css') ||
    document.getElementById('theme-styles')?.getAttribute('href') ||
    '/theme.css';
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';

  const overlay = document.createElement('div');
  overlay.id = 'editor-v2-overlay';
  overlay.setAttribute('data-theme', currentTheme);

  overlay.innerHTML = `
    <link rel="stylesheet" href="${themeHref}">
    <style>${getShellCSS()}</style>

    <div class="ev2-header">
      <span class="ev2-header-title">${contentRootName}</span>
      <span class="ev2-status saved" id="ev2-status">Saved</span>
      <button class="ev2-btn" id="ev2-preview-toggle">Preview</button>
      <button class="ev2-btn primary" id="ev2-save-btn">Save</button>
      <button class="ev2-btn" id="ev2-close-btn">Close</button>
    </div>

    <div class="ev2-body">
      <div class="ev2-sidebar" id="ev2-sidebar">
        <div class="ev2-sidebar-header">
          <span>Explorer</span>
          <div class="ev2-sidebar-actions">
            <button id="ev2-new-file" title="New File">+</button>
            <button id="ev2-new-folder" title="New Folder">&#128193;</button>
          </div>
        </div>
        <div class="ev2-tree-container" id="ev2-tree-container">
          <div class="ev2-skeleton"></div>
          <div class="ev2-skeleton" style="width:70%"></div>
          <div class="ev2-skeleton" style="width:85%"></div>
          <div class="ev2-skeleton" style="width:60%"></div>
        </div>
      </div>

      <div class="ev2-resize-handle" id="ev2-sidebar-resize"></div>

      <div class="ev2-editor-pane">
        <div class="ev2-editor-container" id="ev2-editor-container">
          <!-- CodeMirror EditorView mounts here -->
        </div>
      </div>

      <div class="ev2-resize-handle" id="ev2-preview-resize"></div>

      <div class="ev2-preview-pane" id="ev2-preview-pane">
        <div class="ev2-preview-header">
          <span>Preview</span>
        </div>
        <div class="ev2-preview-content" id="ev2-preview-content">
          <div style="color: var(--color-text-muted, #565f89); padding: 16px; font-style: italic;">
            Open a file to see the preview...
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Restore preview collapse state from localStorage
  const previewCollapsed = localStorage.getItem('ev2-preview-collapsed') === 'true';
  const previewPane = overlay.querySelector('#ev2-preview-pane') as HTMLDivElement;
  if (previewCollapsed) previewPane.classList.add('collapsed');

  return {
    overlay,
    sidebar: overlay.querySelector('#ev2-sidebar') as HTMLDivElement,
    editorContainer: overlay.querySelector('#ev2-editor-container') as HTMLDivElement,
    previewPanel: previewPane,
    headerBar: overlay.querySelector('.ev2-header') as HTMLDivElement,
    tabBar: overlay.querySelector('.ev2-header') as HTMLDivElement, // Tabs added in Phase 2
    statusIndicator: overlay.querySelector('#ev2-status') as HTMLSpanElement,
    sidebarResizeHandle: overlay.querySelector('#ev2-sidebar-resize') as HTMLDivElement,
    previewResizeHandle: overlay.querySelector('#ev2-preview-resize') as HTMLDivElement,
    previewToggle: overlay.querySelector('#ev2-preview-toggle') as HTMLButtonElement,
    closeBtn: overlay.querySelector('#ev2-close-btn') as HTMLButtonElement,
  };
}
