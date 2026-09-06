/**
 * Menu bar — File, Edit, View dropdown menus
 *
 * View menu:
 *   Mode: Source, Live Preview, WYSIWYG (greyed)
 *   Preview: toggle on/off, Preview Only
 *   Split direction, word wrap, sidebar, theme
 */

import { icon } from './icons.js';
import type { Disposable } from '../types.js';
import type { EditorMode, SplitDirection } from '../views/types.js';

export interface MenuBarHandle extends Disposable {
  getMode: () => EditorMode;
  getPreviewOpen: () => boolean;
  getWordWrap: () => boolean;
  getSplitDirection: () => SplitDirection;
}

export interface MenuBarCallbacks {
  onSave: () => void;
  onClose: () => void;
  onNewFile: () => void;
  onModeChange: (mode: EditorMode) => void;
  onPreviewToggle: (open: boolean) => void;
  onPreviewOnly: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleWordWrap: (wrap: boolean) => void;
  onSplitDirectionChange: (dir: SplitDirection) => void;
  onUndo: () => void;
  onRedo: () => void;
  onFind: () => void;
}

export function initMenuBar(
  container: HTMLElement,
  callbacks: MenuBarCallbacks,
): MenuBarHandle {
  let currentMode: EditorMode = (localStorage.getItem('ev2-editor-mode') as EditorMode) || 'source';
  let previewOpen: boolean = localStorage.getItem('ev2-preview-open') !== 'false';
  let wordWrap: boolean = localStorage.getItem('ev2-word-wrap') !== 'false';
  let splitDir: SplitDirection = (localStorage.getItem('ev2-split-dir') as SplitDirection) || 'vertical';
  let openMenu: HTMLElement | null = null;

  container.innerHTML = `
    <div class="ev2-menubar">
      <div class="ev2-menu" data-menu="file">
        <button class="ev2-menu-trigger">File</button>
        <div class="ev2-menu-dropdown">
          <div class="ev2-menu-item" data-action="new-file">${icon('plus', 14)}<span>New File</span><span class="ev2-shortcut">Ctrl+N</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="save">${icon('save', 14)}<span>Save</span><span class="ev2-shortcut">Ctrl+S</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="close">${icon('x', 14)}<span>Close Editor</span></div>
        </div>
      </div>
      <div class="ev2-menu" data-menu="edit">
        <button class="ev2-menu-trigger">Edit</button>
        <div class="ev2-menu-dropdown">
          <div class="ev2-menu-item" data-action="undo">${icon('undo', 14)}<span>Undo</span><span class="ev2-shortcut">Ctrl+Z</span></div>
          <div class="ev2-menu-item" data-action="redo">${icon('redo', 14)}<span>Redo</span><span class="ev2-shortcut">Ctrl+Y</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="find">${icon('search', 14)}<span>Find</span><span class="ev2-shortcut">Ctrl+F</span></div>
        </div>
      </div>
      <div class="ev2-menu" data-menu="view">
        <button class="ev2-menu-trigger">View</button>
        <div class="ev2-menu-dropdown">
          <div class="ev2-menu-item" data-action="mode-source">${icon('code', 14)}<span>Source</span><span class="ev2-check" id="ev2-chk-source"></span></div>
          <div class="ev2-menu-item" data-action="mode-live-preview">${icon('eye', 14)}<span>Live Preview</span><span class="ev2-check" id="ev2-chk-live-preview"></span></div>
          <div class="ev2-menu-item disabled">${icon('heading', 14)}<span>WYSIWYG</span><span class="ev2-shortcut">Soon</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="toggle-preview">${icon('columns', 14)}<span>Preview</span><span class="ev2-check" id="ev2-chk-preview"></span></div>
          <div class="ev2-menu-item" data-action="preview-only">${icon('eye', 14)}<span>Preview Only</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="split-vertical">${icon('columns', 14)}<span>Split Vertical</span><span class="ev2-check" id="ev2-chk-split-v"></span></div>
          <div class="ev2-menu-item" data-action="split-horizontal">${icon('rows', 14)}<span>Split Horizontal</span><span class="ev2-check" id="ev2-chk-split-h"></span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="toggle-wrap">${icon('wrap-text', 14)}<span>Word Wrap</span><span class="ev2-check" id="ev2-chk-wrap"></span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="toggle-sidebar">${icon('panel-left', 14)}<span>Toggle Sidebar</span><span class="ev2-shortcut">Ctrl+\\</span></div>
          <div class="ev2-menu-separator"></div>
          <div class="ev2-menu-item" data-action="toggle-theme">${icon('sun', 14)}<span>Toggle Theme</span></div>
        </div>
      </div>
      <span class="ev2-menubar-spacer"></span>
      <div class="ev2-menubar-right" id="ev2-menubar-right"></div>
    </div>
  `;

  function updateChecks() {
    // Mode checks
    const src = container.querySelector('#ev2-chk-source');
    const lp = container.querySelector('#ev2-chk-live-preview');
    if (src) src.textContent = currentMode === 'source' ? '✓' : '';
    if (lp) lp.textContent = currentMode === 'live-preview' ? '✓' : '';

    // Preview toggle
    const prev = container.querySelector('#ev2-chk-preview');
    if (prev) prev.textContent = previewOpen ? '✓' : '';

    // Split direction
    const sv = container.querySelector('#ev2-chk-split-v');
    const sh = container.querySelector('#ev2-chk-split-h');
    if (sv) sv.textContent = splitDir === 'vertical' ? '✓' : '';
    if (sh) sh.textContent = splitDir === 'horizontal' ? '✓' : '';

    // Word wrap
    const wr = container.querySelector('#ev2-chk-wrap');
    if (wr) wr.textContent = wordWrap ? '✓' : '';
  }
  updateChecks();

  function closeAllMenus() {
    container.querySelectorAll('.ev2-menu.open').forEach(m => m.classList.remove('open'));
    openMenu = null;
  }

  container.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest('.ev2-menu-trigger') as HTMLElement;
    if (trigger) {
      e.stopPropagation();
      const menu = trigger.parentElement as HTMLElement;
      if (menu.classList.contains('open')) {
        closeAllMenus();
      } else {
        closeAllMenus();
        menu.classList.add('open');
        openMenu = menu;
      }
      return;
    }

    const item = (e.target as HTMLElement).closest('.ev2-menu-item:not(.disabled)') as HTMLElement;
    if (item) {
      const action = item.dataset.action;
      closeAllMenus();
      switch (action) {
        case 'save': callbacks.onSave(); break;
        case 'close': callbacks.onClose(); break;
        case 'new-file': callbacks.onNewFile(); break;
        case 'undo': callbacks.onUndo(); break;
        case 'redo': callbacks.onRedo(); break;
        case 'find': callbacks.onFind(); break;
        case 'toggle-sidebar': callbacks.onToggleSidebar(); break;
        case 'toggle-theme': callbacks.onToggleTheme(); break;
        case 'toggle-wrap':
          wordWrap = !wordWrap;
          localStorage.setItem('ev2-word-wrap', String(wordWrap));
          updateChecks();
          callbacks.onToggleWordWrap(wordWrap);
          break;
        case 'split-vertical':
          splitDir = 'vertical';
          localStorage.setItem('ev2-split-dir', splitDir);
          updateChecks();
          callbacks.onSplitDirectionChange(splitDir);
          break;
        case 'split-horizontal':
          splitDir = 'horizontal';
          localStorage.setItem('ev2-split-dir', splitDir);
          updateChecks();
          callbacks.onSplitDirectionChange(splitDir);
          break;
        case 'mode-source':
          currentMode = 'source';
          localStorage.setItem('ev2-editor-mode', currentMode);
          updateChecks();
          callbacks.onModeChange(currentMode);
          break;
        case 'mode-live-preview':
          currentMode = 'live-preview';
          localStorage.setItem('ev2-editor-mode', currentMode);
          updateChecks();
          callbacks.onModeChange(currentMode);
          break;
        case 'toggle-preview':
          previewOpen = !previewOpen;
          localStorage.setItem('ev2-preview-open', String(previewOpen));
          updateChecks();
          callbacks.onPreviewToggle(previewOpen);
          break;
        case 'preview-only':
          callbacks.onPreviewOnly();
          break;
      }
    }
  });

  // Hover to switch between open menus
  container.addEventListener('mouseenter', (e) => {
    if (!openMenu) return;
    const trigger = (e.target as HTMLElement).closest('.ev2-menu') as HTMLElement;
    if (trigger && trigger !== openMenu) {
      closeAllMenus();
      trigger.classList.add('open');
      openMenu = trigger;
    }
  }, true);

  function onDocClick() { closeAllMenus(); }
  document.addEventListener('click', onDocClick);

  return {
    getMode: () => currentMode,
    getPreviewOpen: () => previewOpen,
    getWordWrap: () => wordWrap,
    getSplitDirection: () => splitDir,
    cleanup() {
      document.removeEventListener('click', onDocClick);
    },
  };
}
