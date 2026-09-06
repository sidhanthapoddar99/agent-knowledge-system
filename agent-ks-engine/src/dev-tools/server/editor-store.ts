/**
 * Editor Store - In-memory document management for live editing
 *
 * Manages open documents during editing sessions:
 * - Reads files from disk on open
 * - Tracks dirty state for auto-save
 * - Writes back to disk on save
 * - File CRUD (create, rename, delete)
 *
 * Rendering is fully client-side — this store only handles file I/O and Yjs sync.
 * Dev-only: never loaded in production builds.
 */

import fs from 'fs';
import path from 'path';

export interface EditorDocument {
  /** Absolute path to the file on disk */
  filePath: string;
  /** Raw file content (frontmatter + body) */
  raw: string;
  /** Whether the in-memory content differs from disk */
  dirty: boolean;
}

export interface EditorConfig {
  /** Auto-save interval in milliseconds (default: 10000) */
  autosaveInterval: number;
  /** Watch paths for security validation */
  watchPaths: string[];
}

export class EditorStore {
  private documents = new Map<string, EditorDocument>();
  private autosaveTimer: ReturnType<typeof setInterval> | null = null;
  private config: EditorConfig;
  /** Counter-based save tracking — each writeFileSync increments, each watcher consume decrements */
  private ignoreSaveMap = new Map<string, number>();

  constructor(config: EditorConfig) {
    this.config = config;

    // Safety: close all orphaned documents on process signals (dev server restart)
    const closeAll = () => this.closeAll();
    process.once('SIGINT', closeAll);
    process.once('SIGTERM', closeAll);
  }

  /**
   * Close all open documents (save dirty ones). Used for cleanup.
   */
  closeAll(): void {
    for (const filePath of [...this.documents.keys()]) {
      this.closeDocument(filePath);
    }
    this.stopBackgroundSave();
  }

  /**
   * Check if a file path is within allowed watch paths
   */
  private isAllowedPath(filePath: string): boolean {
    const resolved = path.resolve(filePath);
    return this.config.watchPaths.some(wp => resolved.startsWith(wp));
  }

  /**
   * Open a document for editing
   */
  openDocument(filePath: string): EditorDocument {
    if (!this.isAllowedPath(filePath)) {
      throw new Error(`File path not allowed: ${filePath}`);
    }

    // If already open, return existing
    const existing = this.documents.get(filePath);
    if (existing) return existing;

    // Read from disk
    const raw = fs.readFileSync(filePath, 'utf-8');

    const doc: EditorDocument = {
      filePath,
      raw,
      dirty: false,
    };

    this.documents.set(filePath, doc);
    console.log(`[editor] Opened: ${path.basename(filePath)}`);
    return doc;
  }

  /**
   * Update raw content from Yjs sync. Marks dirty but does NOT re-render.
   */
  updateRaw(filePath: string, raw: string): void {
    const doc = this.documents.get(filePath);
    if (!doc) return;
    doc.raw = raw;
    doc.dirty = true;
  }

  /**
   * Reload a document from disk (for external edit detection).
   */
  reloadFromDisk(filePath: string): EditorDocument {
    const doc = this.documents.get(filePath);
    if (!doc) {
      throw new Error(`Document not open: ${filePath}`);
    }

    doc.raw = fs.readFileSync(filePath, 'utf-8');
    doc.dirty = false;

    console.log(`[editor] Reloaded from disk: ${path.basename(filePath)}`);
    return doc;
  }

  /**
   * Consume one editor-save counter for a file. Returns true if this watcher
   * event was caused by the editor's own write. Each writeFileSync increments
   * the counter; each watcher event decrements it. No timing assumptions.
   */
  consumeEditorSave(filePath: string): boolean {
    const count = this.ignoreSaveMap.get(filePath) ?? 0;
    if (count > 0) {
      this.ignoreSaveMap.set(filePath, count - 1);
      return true;
    }
    return false;
  }

  /**
   * Save document to disk
   */
  saveDocument(filePath: string): { success: boolean; savedAt: string } {
    const doc = this.documents.get(filePath);
    if (!doc) {
      throw new Error(`Document not open: ${filePath}`);
    }

    if (doc.dirty) {
      this.ignoreSaveMap.set(filePath, (this.ignoreSaveMap.get(filePath) ?? 0) + 1);
      fs.writeFileSync(filePath, doc.raw, 'utf-8');
      doc.dirty = false;
      console.log(`[editor] Saved: ${path.basename(filePath)}`);
    }

    return { success: true, savedAt: new Date().toISOString() };
  }

  /**
   * Close document (save if dirty, remove from map)
   */
  closeDocument(filePath: string): void {
    const doc = this.documents.get(filePath);
    if (!doc) return;

    if (doc.dirty) {
      this.ignoreSaveMap.set(filePath, (this.ignoreSaveMap.get(filePath) ?? 0) + 1);
      fs.writeFileSync(filePath, doc.raw, 'utf-8');
      console.log(`[editor] Auto-saved on close: ${path.basename(filePath)}`);
    }

    this.documents.delete(filePath);
    console.log(`[editor] Closed: ${path.basename(filePath)}`);
  }

  /**
   * Check if a file is currently being edited
   */
  isEditing(filePath: string): boolean {
    return this.documents.has(filePath);
  }

  /**
   * Return stats for all open documents (for /__editor/stats endpoint).
   */
  getDocumentStats(): { filePath: string; dirty: boolean; bytes: number }[] {
    return [...this.documents.entries()].map(([filePath, doc]) => ({
      filePath,
      dirty: doc.dirty,
      bytes: Buffer.byteLength(doc.raw, 'utf8'),
    }));
  }

  // ---- File CRUD operations ----

  /**
   * Create a new file with auto-assigned XX_ prefix and frontmatter template.
   */
  createFile(parentDir: string, fileName: string): { filePath: string; prefix: number } {
    if (!this.isAllowedPath(parentDir)) {
      throw new Error(`Path not allowed: ${parentDir}`);
    }
    if (!fs.existsSync(parentDir) || !fs.statSync(parentDir).isDirectory()) {
      throw new Error(`Parent directory does not exist: ${parentDir}`);
    }

    // Compute next prefix
    const entries = fs.readdirSync(parentDir);
    const existingPrefixes: number[] = [];
    for (const entry of entries) {
      const match = entry.match(/^(\d+)_/);
      if (match) existingPrefixes.push(parseInt(match[1], 10));
    }
    const nextPrefix = existingPrefixes.length > 0 ? Math.max(...existingPrefixes) + 1 : 1;
    const paddedPrefix = String(nextPrefix).padStart(2, '0');

    // Ensure .md extension
    const safeName = fileName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const fullName = `${paddedPrefix}_${safeName}.md`;
    const filePath = path.join(parentDir, fullName);

    if (fs.existsSync(filePath)) {
      throw new Error(`File already exists: ${fullName}`);
    }

    // Write with frontmatter template
    const title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const content = `---\ntitle: "${title}"\ndescription: ""\n---\n\n`;
    this.ignoreSaveMap.set(filePath, (this.ignoreSaveMap.get(filePath) ?? 0) + 1);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`[editor] Created file: ${fullName}`);

    return { filePath, prefix: nextPrefix };
  }

  /**
   * Create a new folder with optional settings.json.
   */
  createFolder(parentDir: string, folderName: string): string {
    if (!this.isAllowedPath(parentDir)) {
      throw new Error(`Path not allowed: ${parentDir}`);
    }

    // Compute next prefix
    const entries = fs.readdirSync(parentDir);
    const existingPrefixes: number[] = [];
    for (const entry of entries) {
      const match = entry.match(/^(\d+)_/);
      if (match) existingPrefixes.push(parseInt(match[1], 10));
    }
    const nextPrefix = existingPrefixes.length > 0 ? Math.max(...existingPrefixes) + 1 : 1;
    const paddedPrefix = String(nextPrefix).padStart(2, '0');

    const safeName = folderName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const fullName = `${paddedPrefix}_${safeName}`;
    const folderPath = path.join(parentDir, fullName);

    if (fs.existsSync(folderPath)) {
      throw new Error(`Folder already exists: ${fullName}`);
    }

    fs.mkdirSync(folderPath, { recursive: true });

    // Write settings.json
    const label = folderName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    fs.writeFileSync(
      path.join(folderPath, 'settings.json'),
      JSON.stringify({ label }, null, 2),
      'utf-8',
    );
    console.log(`[editor] Created folder: ${fullName}`);

    return folderPath;
  }

  /**
   * Rename a file or folder (preserving XX_ prefix).
   */
  renameItem(oldPath: string, newName: string): string {
    if (!this.isAllowedPath(oldPath)) {
      throw new Error(`Path not allowed: ${oldPath}`);
    }
    if (!fs.existsSync(oldPath)) {
      throw new Error(`Path does not exist: ${oldPath}`);
    }

    const dir = path.dirname(oldPath);
    const oldName = path.basename(oldPath);
    const prefixMatch = oldName.match(/^(\d+_)/);
    const prefix = prefixMatch ? prefixMatch[1] : '';
    const ext = path.extname(oldName);
    const isDir = fs.statSync(oldPath).isDirectory();

    const safeName = newName.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase();
    const newFullName = isDir ? `${prefix}${safeName}` : `${prefix}${safeName}${ext}`;
    const newPath = path.join(dir, newFullName);

    if (oldPath === newPath) return newPath;
    if (fs.existsSync(newPath)) {
      throw new Error(`Already exists: ${newFullName}`);
    }

    // Close document if open
    if (this.documents.has(oldPath)) {
      this.closeDocument(oldPath);
    }

    fs.renameSync(oldPath, newPath);
    console.log(`[editor] Renamed: ${oldName} → ${newFullName}`);

    return newPath;
  }

  /**
   * Delete a file or folder.
   */
  deleteItem(itemPath: string): void {
    if (!this.isAllowedPath(itemPath)) {
      throw new Error(`Path not allowed: ${itemPath}`);
    }
    if (!fs.existsSync(itemPath)) {
      throw new Error(`Path does not exist: ${itemPath}`);
    }

    // Close document if open
    if (this.documents.has(itemPath)) {
      this.closeDocument(itemPath);
    }

    const stat = fs.statSync(itemPath);
    if (stat.isDirectory()) {
      // Close any open documents within this directory
      for (const filePath of [...this.documents.keys()]) {
        if (filePath.startsWith(itemPath)) {
          this.closeDocument(filePath);
        }
      }
      fs.rmSync(itemPath, { recursive: true });
    } else {
      fs.rmSync(itemPath);
    }

    console.log(`[editor] Deleted: ${path.basename(itemPath)}`);
  }

  /**
   * Start periodic background save for all dirty documents
   */
  startBackgroundSave(): void {
    if (this.autosaveTimer) return;

    this.autosaveTimer = setInterval(() => {
      for (const [filePath, doc] of this.documents) {
        if (doc.dirty) {
          try {
            this.ignoreSaveMap.set(filePath, (this.ignoreSaveMap.get(filePath) ?? 0) + 1);
            fs.writeFileSync(filePath, doc.raw, 'utf-8');
            doc.dirty = false;
            console.log(`[editor] Auto-saved: ${path.basename(filePath)}`);
          } catch (err) {
            console.error(`[editor] Auto-save failed for ${path.basename(filePath)}:`, err);
          }
        }
      }
    }, this.config.autosaveInterval);

    console.log(`[editor] Background save started (interval: ${this.config.autosaveInterval}ms)`);
  }

  /**
   * Stop background save
   */
  stopBackgroundSave(): void {
    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
  }
}
