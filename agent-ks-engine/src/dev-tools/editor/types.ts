/**
 * Editor V2 — Shared types for the Obsidian-style editor
 */

import type { EditorView } from '@codemirror/view';

// ---- Identity (reused from v1) ----

export interface Identity {
  userId: string;
  name: string;
  color: string;
}

// ---- Save status ----

export type SaveStatus = 'saved' | 'unsaved' | 'saving';

// ---- File tree ----

export interface FileTreeNode {
  name: string;
  displayName: string;
  prefix: number | null;
  path: string;
  relativePath: string;
  type: 'file' | 'folder' | 'asset';
  extension: string;
  children?: FileTreeNode[];
  settings?: FolderSettings;
  frontmatter?: {
    title?: string;
    sidebar_label?: string;
    description?: string;
  };
}

export interface FolderSettings {
  label?: string;
  isCollapsible?: boolean;
  collapsed?: boolean;
  sidebar?: {
    collapsed?: boolean;
    collapsible?: boolean;
  };
}

// ---- Open file state ----

export interface OpenFile {
  filePath: string;
  fileName: string;
  view: EditorView | null;
  saveStatus: SaveStatus;
  dirty: boolean;
}

// ---- Editor V2 context ----

export interface EditorV2Dom {
  overlay: HTMLDivElement;
  sidebar: HTMLDivElement;
  editorContainer: HTMLDivElement;
  previewPanel: HTMLDivElement;
  headerBar: HTMLDivElement;
  tabBar: HTMLDivElement;
  statusIndicator: HTMLSpanElement;
  sidebarResizeHandle: HTMLDivElement;
  previewResizeHandle: HTMLDivElement;
  previewToggle: HTMLButtonElement;
  closeBtn: HTMLButtonElement;
}

export interface EditorV2Context {
  dom: EditorV2Dom;
  identity: Identity;
  contentRoot: string;
  contentRootKey: string;
  getActiveFile: () => OpenFile | null;
  setActiveFile: (file: OpenFile | null) => void;
}

// ---- Disposable pattern ----

export interface Disposable {
  cleanup: () => void;
}
