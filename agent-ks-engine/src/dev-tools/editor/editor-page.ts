/**
 * Editor V2 — Page-based entry point
 *
 * Mounts into #editor-root at /editor?root=...
 * Orchestrates: menubar, views, file tree, CM6 editor, Yjs sync.
 */

import type { EditorView } from '@codemirror/view';
import type { SaveStatus, Identity } from './types.js';
import { initResizeHandle } from './layout/resize-handles.js';
import { initMenuBar } from './layout/menubar.js';
import { initYjsClientV2, type YjsV2Handle } from './sync/yjs-client-v2.js';
import { renderFileTree, highlightTreeItem, findFileByUrlPath, filePathToUrl } from './file-tree/file-tree.js';
import { icon } from './layout/icons.js';
import { initFormattingToolbar } from './layout/formatting-toolbar.js';
import { initContextMenu } from './file-tree/context-menu.js';
import { createFile, createFolder, renameItem, deleteItem } from './file-tree/file-crud.js';
import { showNewFileDialog, showNewFolderDialog, showRenameDialog, showDeleteDialog } from './file-tree/file-dialogs.js';
import { initPreviewPanel, initViewManager, type PreviewPanel, type ViewManagerHandle } from './views/index.js';

import './styles/editor.css';
import './styles/preview.css';
import './styles/toolbar.css';

// ---- Identity ----

function getOrCreateIdentity(): Identity {
  const stored = sessionStorage.getItem('editor-identity');
  if (stored) { try { return JSON.parse(stored); } catch {} }
  const adj = ['Swift','Bright','Calm','Bold','Keen','Warm','Cool','Sharp'];
  const animals = ['Falcon','Owl','Fox','Wolf','Bear','Hawk','Lynx','Crane'];
  const colors = ['#7ec699','#d4bfff','#f0c674','#e55561','#7aa2f7','#a8cc8c','#d4a017','#e0e0e0'];
  const identity: Identity = {
    userId: crypto.randomUUID(),
    name: `${adj[Math.floor(Math.random()*adj.length)]} ${animals[Math.floor(Math.random()*animals.length)]}`,
    color: colors[Math.floor(Math.random()*colors.length)],
  };
  sessionStorage.setItem('editor-identity', JSON.stringify(identity));
  return identity;
}

// ---- Module state ----
let activeView: EditorView | null = null;
let activeYjs: YjsV2Handle | null = null;
let activeFilePath: string | null = null;
let cleanupFns: (() => void)[] = [];
let activeToolbar: { setEditorView(v: EditorView | null): void } | null = null;
let _activePreview: PreviewPanel | null = null;
let activeViewManager: ViewManagerHandle | null = null;

export interface MountOptions {
  contentRoot: string;
  contentRootKey: string;
  slug: string;
  returnUrl: string;
}

export async function mountEditor(root: HTMLElement, opts: MountOptions) {
  const identity = getOrCreateIdentity();

  // Theme
  const savedTheme = localStorage.getItem('ev2-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let currentTheme: 'dark' | 'light' = (savedTheme as any) || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-editor-theme', currentTheme);

  // Load content CSS for preview
  try {
    const cssRes = await fetch('/__editor/styles');
    if (cssRes.ok) {
      const contentStyleEl = document.createElement('style');
      contentStyleEl.textContent = await cssRes.text();
      document.head.appendChild(contentStyleEl);
      cleanupFns.push(() => contentStyleEl.remove());
    }
  } catch {}

  // ---- Shell HTML ----
  root.innerHTML = `
    <div class="ev2-menubar-container" id="ev2-menubar-container"></div>

    <div class="ev2-body">
      <div class="ev2-sidebar" id="ev2-sidebar">
        <div class="ev2-sidebar-header">
          <span>${opts.contentRootKey}</span>
          <div class="ev2-sidebar-actions">
            <button class="ev2-icon-btn" id="ev2-new-file" title="New File">${icon('plus', 14)}</button>
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
      <button class="ev2-sidebar-float-toggle" id="ev2-sidebar-toggle" title="Toggle Sidebar">${icon('chevron-left', 14)}</button>

      <div class="ev2-split-area" id="ev2-split-area">
        <div class="ev2-editor-pane" id="ev2-editor-pane">
          <div class="ev2-toolbar-container" id="ev2-toolbar-container"></div>
          <div class="ev2-editor-container" id="ev2-editor-container">
            <div class="ev2-editor-empty">Select a file from the explorer</div>
          </div>
        </div>

        <div class="ev2-resize-handle" id="ev2-preview-resize"></div>

        <div class="ev2-preview-pane" id="ev2-preview-pane">
          <div class="ev2-preview-header"><span>Preview</span></div>
          <div class="ev2-preview-content" id="ev2-preview-content">
            <div style="color:var(--ev-text-faint);padding:24px;font-style:italic">Open a file to preview</div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ---- DOM refs ----
  const sidebar = root.querySelector('#ev2-sidebar') as HTMLDivElement;
  const editorContainer = root.querySelector('#ev2-editor-container') as HTMLDivElement;
  const editorPane = root.querySelector('#ev2-editor-pane') as HTMLDivElement;
  const previewPane = root.querySelector('#ev2-preview-pane') as HTMLDivElement;
  const previewContent = root.querySelector('#ev2-preview-content') as HTMLElement;
  const previewResizeHandle = root.querySelector('#ev2-preview-resize') as HTMLDivElement;
  const menubarContainer = root.querySelector('#ev2-menubar-container') as HTMLDivElement;
  const toolbarContainer = root.querySelector('#ev2-toolbar-container') as HTMLDivElement;
  const splitArea = root.querySelector('#ev2-split-area') as HTMLDivElement;
  const sidebarToggle = root.querySelector('#ev2-sidebar-toggle') as HTMLButtonElement;
  const sidebarResizeHandle = root.querySelector('#ev2-sidebar-resize') as HTMLDivElement;
  const treeContainer = root.querySelector('#ev2-tree-container') as HTMLDivElement;

  // ---- Preview panel ----
  const preview = initPreviewPanel(previewPane, previewContent, previewResizeHandle);
  _activePreview = preview;
  cleanupFns.push(preview.cleanup);

  // ---- View manager ----
  const viewManager = initViewManager(
    { editorPane, previewPane, previewResizeHandle, splitArea },
    preview,
    () => currentTheme,
  );
  activeViewManager = viewManager;
  cleanupFns.push(viewManager.cleanup);

  // ---- Formatting toolbar ----
  const toolbar = initFormattingToolbar(toolbarContainer);
  activeToolbar = toolbar;
  cleanupFns.push(toolbar.cleanup);

  // ---- Word wrap ----
  async function toggleWordWrap(wrap: boolean) {
    if (!activeView) return;
    const { lineWrappingCompartment } = await import('./core/codemirror-setup.js');
    const { EditorView: EV } = await import('@codemirror/view');
    activeView.dispatch({
      effects: lineWrappingCompartment.reconfigure(wrap ? EV.lineWrapping : []),
    });
  }

  // ---- Theme toggle ----
  async function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-editor-theme', currentTheme);
    localStorage.setItem('ev2-theme', currentTheme);
    themeToggle.innerHTML = icon(currentTheme === 'dark' ? 'sun' : 'moon', 16);
    if (activeView) {
      const { themeCompartment } = await import('./core/codemirror-setup.js');
      const { darkTheme, lightTheme } = await import('./core/editor-theme.js');
      activeView.dispatch({
        effects: themeCompartment.reconfigure(currentTheme === 'dark' ? darkTheme() : lightTheme()),
      });
    }
  }

  // ---- Menu bar ----
  const menubar = initMenuBar(menubarContainer, {
    onSave: () => activeYjs?.save(),
    onClose: () => {
      const returnTo = activeFilePath
        ? filePathToUrl(activeFilePath, opts.contentRoot, opts.returnUrl)
        : opts.returnUrl;
      sessionStorage.removeItem('ev2-open-file');
      closeCurrentFile();
      for (const fn of cleanupFns) fn();
      cleanupFns = [];
      window.location.href = returnTo;
    },
    onNewFile: () => {
      showNewFileDialog(async (name) => {
        try {
          const result = await createFile(opts.contentRoot, name);
          await refreshTree();
          doOpenFile(result.filePath);
          highlightTreeItem(treeContainer, result.filePath);
        } catch (err: any) {
          console.error('[editor-v2] Create file failed:', err);
        }
      });
    },
    onModeChange: (mode) => viewManager.setMode(mode),
    onPreviewToggle: (open) => viewManager.setPreviewOpen(open),
    onPreviewOnly: () => viewManager.setPreviewOnly(true),
    onToggleSidebar: () => {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('ev2-sidebar-collapsed', String(sidebar.classList.contains('collapsed')));
    },
    onToggleTheme: toggleTheme,
    onToggleWordWrap: toggleWordWrap,
    onSplitDirectionChange: (dir) => viewManager.setSplitDirection(dir),
    onUndo: () => {},
    onRedo: () => {},
    onFind: () => {},
  });
  cleanupFns.push(menubar.cleanup);

  // ---- Menubar right side ----
  const menubarRight = root.querySelector('#ev2-menubar-right') as HTMLDivElement;
  menubarRight.innerHTML = `
    <span class="ev2-active-file" id="ev2-active-file"></span>
    <span class="ev2-status saved" id="ev2-status">Saved</span>
    <span class="ev2-user-badge" style="background:${identity.color}15;color:${identity.color}">${identity.name}</span>
    <button class="ev2-icon-btn" id="ev2-theme-toggle" title="Toggle Theme">${icon(currentTheme === 'dark' ? 'sun' : 'moon', 16)}</button>
    <button class="ev2-btn primary" id="ev2-save-btn">${icon('save', 14)} Save</button>
    <button class="ev2-icon-btn" id="ev2-close-btn" title="Close">${icon('x', 16)}</button>
  `;
  const statusEl = root.querySelector('#ev2-status') as HTMLSpanElement;
  const activeFileEl = root.querySelector('#ev2-active-file') as HTMLSpanElement;
  const saveBtn = root.querySelector('#ev2-save-btn') as HTMLButtonElement;
  const closeBtn = root.querySelector('#ev2-close-btn') as HTMLButtonElement;
  const themeToggle = root.querySelector('#ev2-theme-toggle') as HTMLButtonElement;

  // ---- Resize handles ----
  const sr = initResizeHandle(sidebarResizeHandle, sidebar, 'left', 'ev2-sidebar-width');
  const pr = initResizeHandle(previewResizeHandle, previewPane, 'right', 'ev2-preview-width');
  cleanupFns.push(sr.cleanup, pr.cleanup);

  // ---- Status ----
  function updateStatus(status: SaveStatus) {
    statusEl.className = `ev2-status ${status}`;
    statusEl.textContent = status === 'saved' ? 'Saved' : status === 'unsaved' ? 'Unsaved' : 'Saving...';
  }

  // ---- Sidebar ----
  const sidebarCollapsed = localStorage.getItem('ev2-sidebar-collapsed') === 'true';
  if (sidebarCollapsed) sidebar.classList.add('collapsed');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('ev2-sidebar-collapsed', String(sidebar.classList.contains('collapsed')));
  });
  themeToggle.addEventListener('click', toggleTheme);

  // ---- Helper: open file (used by tree, CRUD, auto-open) ----
  function doOpenFile(filePath: string) {
    openFile(filePath, editorContainer, preview, updateStatus, activeFileEl, identity, currentTheme, previewContent, menubar.getWordWrap(), viewManager);
  }

  // ---- File tree ----
  let treeData: any = null;

  async function refreshTree() {
    try {
      const res = await fetch(`/__editor/tree?root=${encodeURIComponent(opts.contentRoot)}`);
      if (res.ok) {
        treeData = await res.json();
        renderFileTree(treeContainer, treeData, { onSelect: doOpenFile });
        if (activeFilePath) highlightTreeItem(treeContainer, activeFilePath);
      }
    } catch (err) {
      console.error('[editor-v2] Tree refresh failed:', err);
    }
  }

  try {
    const res = await fetch(`/__editor/tree?root=${encodeURIComponent(opts.contentRoot)}`);
    if (res.ok) {
      treeData = await res.json();
      renderFileTree(treeContainer, treeData, { onSelect: doOpenFile });
    } else {
      treeContainer.innerHTML = `<div style="padding:12px;color:var(--ev-danger);font-size:12px">Failed to load tree</div>`;
    }
  } catch (err) {
    console.error('[editor-v2] Tree load failed:', err);
    treeContainer.innerHTML = `<div style="padding:12px;color:var(--ev-danger);font-size:12px">Failed to load tree</div>`;
  }

  // ---- Context menu + CRUD ----
  const ctxMenu = initContextMenu(treeContainer, opts.contentRoot, {
    onNewFile: (parentDir) => {
      showNewFileDialog(async (name) => {
        try {
          const result = await createFile(parentDir, name);
          await refreshTree();
          doOpenFile(result.filePath);
          highlightTreeItem(treeContainer, result.filePath);
        } catch (err: any) { console.error('[editor-v2] Create file failed:', err); }
      });
    },
    onNewFolder: (parentDir) => {
      showNewFolderDialog(async (name) => {
        try { await createFolder(parentDir, name); await refreshTree(); }
        catch (err: any) { console.error('[editor-v2] Create folder failed:', err); }
      });
    },
    onRename: (itemPath, itemName, _isDir) => {
      showRenameDialog(itemName, async (newName) => {
        try {
          const result = await renameItem(itemPath, newName);
          if (activeFilePath === itemPath) {
            activeFilePath = result.newPath;
            sessionStorage.setItem('ev2-open-file', result.newPath);
            activeFileEl.textContent = result.newPath.split('/').slice(-2).join('/');
          }
          await refreshTree();
          if (activeFilePath) highlightTreeItem(treeContainer, activeFilePath);
        } catch (err: any) { console.error('[editor-v2] Rename failed:', err); }
      });
    },
    onDelete: (itemPath, itemName) => {
      showDeleteDialog(itemName, async () => {
        try {
          if (activeFilePath === itemPath || (activeFilePath && activeFilePath.startsWith(itemPath + '/'))) {
            await closeCurrentFile();
            editorContainer.innerHTML = '<div class="ev2-editor-empty">Select a file from the explorer</div>';
            activeFileEl.textContent = '';
            sessionStorage.removeItem('ev2-open-file');
          }
          await deleteItem(itemPath);
          await refreshTree();
        } catch (err: any) { console.error('[editor-v2] Delete failed:', err); }
      });
    },
  });
  cleanupFns.push(ctxMenu.cleanup);

  // ---- Auto-open ----
  if (treeData) {
    let autoOpenPath: string | null = null;
    const sessionFile = sessionStorage.getItem('ev2-open-file');
    if (sessionFile) autoOpenPath = sessionFile;
    if (!autoOpenPath) {
      const lastDocPath = sessionStorage.getItem('ev2-last-doc-path');
      if (lastDocPath) {
        const file = findFileByUrlPath(treeData, lastDocPath, opts.returnUrl);
        if (file) autoOpenPath = file.path;
      }
    }
    if (!autoOpenPath && document.referrer) {
      try {
        const refPath = new URL(document.referrer).pathname.replace(/\/$/, '');
        const file = findFileByUrlPath(treeData, refPath, opts.returnUrl);
        if (file) autoOpenPath = file.path;
      } catch {}
    }
    if (autoOpenPath) {
      highlightTreeItem(treeContainer, autoOpenPath);
      doOpenFile(autoOpenPath);
    }
  }

  // ---- Save / Close buttons ----
  saveBtn.addEventListener('click', () => activeYjs?.save());
  closeBtn.addEventListener('click', () => {
    const returnTo = activeFilePath
      ? filePathToUrl(activeFilePath, opts.contentRoot, opts.returnUrl)
      : opts.returnUrl;
    sessionStorage.removeItem('ev2-open-file');
    closeCurrentFile();
    for (const fn of cleanupFns) fn();
    cleanupFns = [];
    window.location.href = returnTo;
  });

  // ---- Keyboard shortcuts ----
  function onKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      activeYjs?.save();
    }
  }
  document.addEventListener('keydown', onKeydown);
  cleanupFns.push(() => document.removeEventListener('keydown', onKeydown));
}

// ---- Open file ----

async function openFile(
  filePath: string,
  container: HTMLElement,
  preview: PreviewPanel,
  updateStatus: (s: SaveStatus) => void,
  activeFileEl: HTMLElement,
  identity: Identity,
  theme: 'dark' | 'light',
  previewContentEl: HTMLElement,
  wordWrap: boolean,
  viewManager: ViewManagerHandle,
) {
  await closeCurrentFile();

  activeFilePath = filePath;
  sessionStorage.setItem('ev2-open-file', filePath);
  activeFileEl.textContent = filePath.split('/').slice(-2).join('/');
  container.innerHTML = '<div class="ev2-editor-empty">Loading...</div>';

  const renderer = preview.getRenderer();

  const yjs = initYjsClientV2({
    filePath,
    identity,
    onSynced: async () => {
      container.innerHTML = '';
      try {
        const { createEditorView, readOnlyCompartment } = await import('./core/codemirror-setup.js');
        const { createYjsExtensions } = await import('./core/codemirror-yjs.js');
        const { darkTheme, lightTheme } = await import('./core/editor-theme.js');

        const view = createEditorView({
          parent: container,
          onSave: () => yjs.save(),
          onClose: () => {},
          readOnly: false,
          wordWrap: wordWrap !== false,
          themeExtensions: theme === 'dark' ? darkTheme() : lightTheme(),
          extensions: createYjsExtensions(yjs.ytext, yjs.awareness),
          initialDoc: yjs.ytext.toString(),
        });

        view.dispatch({
          effects: readOnlyCompartment.reconfigure(
            (await import('@codemirror/state')).EditorState.readOnly.of(false)
          ),
        });

        activeView = view;
        activeToolbar?.setEditorView(view);
        viewManager.setEditorView(view);

        // Client-side rendering: observe ytext for changes
        renderer.renderDebounced(yjs.ytext.toString());
        yjs.ytext.observe(() => {
          renderer.renderDebounced(yjs.ytext.toString());
        });

        setupScrollSync(view, previewContentEl);
      } catch (err) {
        console.error('[editor-v2] Failed to mount:', err);
        container.innerHTML = `<div class="ev2-editor-empty" style="color:var(--ev-danger)">Failed: ${err}</div>`;
      }
    },
    onStatusChange: updateStatus,
  });

  activeYjs = yjs;
}

// ---- Scroll sync ----

let scrollSyncSource: 'none' | 'editor' | 'preview' = 'none';
let scrollSyncCleanup: (() => void) | null = null;

function setupScrollSync(view: EditorView, previewEl: HTMLElement) {
  if (scrollSyncCleanup) scrollSyncCleanup();
  const editorScroller = view.scrollDOM;

  function onEditorScroll() {
    if (scrollSyncSource === 'preview') return;
    scrollSyncSource = 'editor';
    const max = editorScroller.scrollHeight - editorScroller.clientHeight;
    if (max > 0) {
      previewEl.scrollTop = (editorScroller.scrollTop / max) * (previewEl.scrollHeight - previewEl.clientHeight);
    }
    requestAnimationFrame(() => { scrollSyncSource = 'none'; });
  }

  function onPreviewScroll() {
    if (scrollSyncSource === 'editor') return;
    scrollSyncSource = 'preview';
    const max = previewEl.scrollHeight - previewEl.clientHeight;
    if (max > 0) {
      editorScroller.scrollTop = (previewEl.scrollTop / max) * (editorScroller.scrollHeight - editorScroller.clientHeight);
    }
    requestAnimationFrame(() => { scrollSyncSource = 'none'; });
  }

  editorScroller.addEventListener('scroll', onEditorScroll);
  previewEl.addEventListener('scroll', onPreviewScroll);
  scrollSyncCleanup = () => {
    editorScroller.removeEventListener('scroll', onEditorScroll);
    previewEl.removeEventListener('scroll', onPreviewScroll);
    scrollSyncCleanup = null;
  };
}

// ---- Close ----

async function closeCurrentFile() {
  if (scrollSyncCleanup) scrollSyncCleanup();
  if (activeView) { activeView.destroy(); activeView = null; }
  if (activeYjs) { await activeYjs.close(); activeYjs = null; }
  activeViewManager?.setEditorView(null);
  activeToolbar?.setEditorView(null);
  activeFilePath = null;
}
