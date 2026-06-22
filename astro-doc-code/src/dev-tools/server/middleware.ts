/**
 * Editor Middleware - HTTP endpoints for the live editor
 *
 * Adds Vite middleware to handle editor API requests:
 * - GET  /__editor/events    — SSE stream for presence table updates
 * - GET  /__editor/styles    — Combined content CSS for preview
 * - POST /__editor/open      — Open document + create Yjs room
 * - POST /__editor/save      — Save document to disk
 * - POST /__editor/close     — Close document, destroy Yjs room
 * - POST /__editor/subtask-toggle — Set a subtask's `state` in its frontmatter
 * - POST /__editor/presence  — Presence actions (join/leave/page/cursor-clear)
 * - WS   /__editor/yjs       — Yjs CRDT sync + cursors, ping, config, render (handled by YjsSync)
 *
 * Dev-only: never loaded in production builds.
 */

import type { ViteDevServer } from 'vite';
import type { EditorStore } from './editor-store';
import type { PresenceManager, PresenceAction } from './presence';
import type { YjsSync } from './yjs-sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { collectServerMetrics } from './metrics';

interface FileTreeNode {
  name: string;
  displayName: string;
  prefix: number | null;
  path: string;
  type: 'file' | 'folder';
  extension: string;
  children?: FileTreeNode[];
  settings?: Record<string, any>;
  frontmatter?: { title?: string; sidebar_label?: string };
}

function parsePrefix(name: string): { prefix: number | null; baseName: string } {
  const match = name.match(/^(\d+)_(.+)$/);
  if (match) return { prefix: parseInt(match[1], 10), baseName: match[2] };
  return { prefix: null, baseName: name };
}

function cleanDisplayName(name: string): string {
  const { baseName } = parsePrefix(name);
  const withoutExt = baseName.replace(/\.[^.]+$/, '');
  return withoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildFileTree(dirPath: string): FileTreeNode {
  const dirName = path.basename(dirPath);
  const { prefix } = parsePrefix(dirName);

  // Read settings.json if present
  let settings: Record<string, any> | undefined;
  const settingsPath = path.join(dirPath, 'settings.json');
  if (fs.existsSync(settingsPath)) {
    try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}
  }

  const displayName = settings?.label || cleanDisplayName(dirName);

  const node: FileTreeNode = {
    name: dirName,
    displayName,
    prefix,
    path: dirPath,
    type: 'folder',
    extension: '',
    settings,
    children: [],
  };

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return node;
  }

  for (const entry of entries) {
    if (entry.name === 'settings.json' || entry.name.startsWith('.')) continue;

    const fullPath = path.join(dirPath, entry.name);
    const { prefix: childPrefix } = parsePrefix(entry.name);

    if (entry.isDirectory()) {
      node.children!.push(buildFileTree(fullPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      let fm: { title?: string; sidebar_label?: string } | undefined;

      // Read frontmatter from markdown files
      if (ext === '.md' || ext === '.mdx') {
        try {
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const { data } = matter(raw);
          if (data.title || data.sidebar_label) {
            fm = { title: data.title, sidebar_label: data.sidebar_label };
          }
        } catch {}
      }

      node.children!.push({
        name: entry.name,
        displayName: fm?.sidebar_label || fm?.title || cleanDisplayName(entry.name),
        prefix: childPrefix,
        path: fullPath,
        type: 'file',
        extension: ext,
        frontmatter: fm,
      });
    }
  }

  // Sort: folders first, then by prefix, then alphabetically
  node.children!.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    if (a.prefix !== null && b.prefix !== null) return a.prefix - b.prefix;
    if (a.prefix !== null) return -1;
    if (b.prefix !== null) return 1;
    return a.name.localeCompare(b.name);
  });

  return node;
}

/**
 * Parse JSON body from an incoming request
 */
function parseBody(req: any): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Send a JSON response
 */
function sendJson(res: any, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export function setupEditorMiddleware(
  server: ViteDevServer,
  store: EditorStore,
  presence: PresenceManager,
  yjsSync: YjsSync,
): void {
  /**
   * Build combined CSS for the editor preview from theme + content styles.
   * No caching — reads fresh on each request so theme edits are reflected immediately.
   * These are small files so the overhead is negligible.
   */
  function getContentCSS(): string {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const srcRoot = path.resolve(__dirname, '../..');

    const cssFiles = [
      path.join(srcRoot, 'styles/color.css'),
      path.join(srcRoot, 'styles/font.css'),
      path.join(srcRoot, 'styles/element.css'),
      path.join(srcRoot, 'styles/markdown.css'),
      path.join(srcRoot, 'layouts/docs/components/body/default/styles.css'),
    ];

    let combined = '';
    for (const file of cssFiles) {
      try {
        if (fs.existsSync(file)) {
          combined += fs.readFileSync(file, 'utf-8') + '\n';
        }
      } catch { /* skip missing files */ }
    }

    return combined;
  }

  server.middlewares.use(async (req: any, res: any, next: any) => {
    const url = req.url as string;

    // Only handle /__editor/* routes
    if (!url.startsWith('/__editor/')) {
      return next();
    }

    // GET /__editor/styles — serve combined content CSS
    if (url === '/__editor/styles' && req.method === 'GET') {
      const css = getContentCSS();
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/css');
      res.setHeader('Cache-Control', 'no-cache');
      res.end(css);
      return;
    }

    // GET /__editor/events?userId=xxx — SSE stream for presence table updates
    if (url.startsWith('/__editor/events') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const userId = parsedUrl.searchParams.get('userId');

      if (!userId) {
        return sendJson(res, 400, { error: 'userId query parameter is required' });
      }

      // Set SSE headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Register stream with presence manager (sends initial snapshot)
      presence.addStream(userId, res);

      // Send keepalive comments at configurable interval
      // Also update lastSeen to prevent stale removal for SSE-only (non-editing) users
      const keepalive = setInterval(() => {
        if (!res.writableEnded) {
          const user = presence.getUser(userId);
          if (user) user.lastSeen = Date.now();
          try { res.write(': keepalive\n\n'); } catch { /* stream closed */ }
        }
      }, presence.config.sseKeepalive);

      // Cleanup on disconnect
      req.on('close', () => {
        clearInterval(keepalive);
        presence.removeStream(userId);
      });

      // Do NOT call next() — keep connection open
      return;
    }

    // GET /__editor/tree?root=<contentDir> — file tree for content directory
    if (url.startsWith('/__editor/tree') && req.method === 'GET') {
      const parsedUrl = new URL(url, 'http://localhost');
      const contentRoot = parsedUrl.searchParams.get('root');

      if (!contentRoot) {
        return sendJson(res, 400, { error: 'root query parameter is required' });
      }

      try {
        const tree = buildFileTree(contentRoot);
        return sendJson(res, 200, tree);
      } catch (err: any) {
        return sendJson(res, 500, { error: err.message || 'Failed to read directory' });
      }
    }

    // GET /__editor/stats — room and document stats for debugging
    if (url === '/__editor/stats' && req.method === 'GET') {
      return sendJson(res, 200, {
        rooms: yjsSync.getRoomStats(),
        documents: store.getDocumentStats(),
      });
    }

    // GET /__editor/system — metrics + cache-inspector snapshot for the
    //   "More Dev Tools" toolbar app. Polled every ~2s when the panel is open.
    if (url === '/__editor/system' && req.method === 'GET') {
      return sendJson(res, 200, {
        metrics: collectServerMetrics(),
        caches: {
          yjsRooms: yjsSync.getRoomStats(),
          editorDocs: store.getDocumentStats(),
          presence: presence.getStats(),
        },
      });
    }

    // Only accept POST for remaining endpoints
    if (req.method !== 'POST') {
      return sendJson(res, 405, { error: 'Method not allowed' });
    }

    try {
      const body = await parseBody(req);

      switch (url) {
        case '/__editor/presence': {
          const action = body as PresenceAction;
          if (!action.type || !action.userId) {
            return sendJson(res, 400, { error: 'type and userId are required' });
          }
          presence.handleAction(action);
          return sendJson(res, 200, { ok: true });
        }

        case '/__editor/open': {
          const { filePath } = body;
          if (!filePath || typeof filePath !== 'string') {
            return sendJson(res, 400, { error: 'filePath is required' });
          }

          const doc = store.openDocument(filePath);
          // Create Yjs room (idempotent — returns existing if already open)
          yjsSync.getOrCreateRoom(filePath, doc.raw);
          return sendJson(res, 200, {
            raw: doc.raw,
          });
        }

        case '/__editor/save': {
          const { filePath } = body;
          if (!filePath || typeof filePath !== 'string') {
            return sendJson(res, 400, { error: 'filePath is required' });
          }

          const result = store.saveDocument(filePath);
          return sendJson(res, 200, result);
        }

        case '/__editor/close': {
          const { filePath } = body;
          if (!filePath || typeof filePath !== 'string') {
            return sendJson(res, 400, { error: 'filePath is required' });
          }

          store.closeDocument(filePath);
          // Only destroy Yjs room if no other connections remain.
          // Use <= 1 because the closing user's WS disconnect may not have
          // been processed yet when this HTTP request arrives.
          const roomConns = yjsSync.getConnectionCount(filePath);
          if (roomConns <= 1) {
            yjsSync.destroyRoom(filePath);
          }

          return sendJson(res, 200, { success: true });
        }

        // ---- File CRUD ----

        case '/__editor/create-file': {
          const { parentDir, fileName } = body;
          if (!parentDir || !fileName) {
            return sendJson(res, 400, { error: 'parentDir and fileName are required' });
          }
          const result = store.createFile(parentDir, fileName);
          return sendJson(res, 200, result);
        }

        case '/__editor/create-folder': {
          const { parentDir, folderName } = body;
          if (!parentDir || !folderName) {
            return sendJson(res, 400, { error: 'parentDir and folderName are required' });
          }
          const folderPath = store.createFolder(parentDir, folderName);
          return sendJson(res, 200, { path: folderPath });
        }

        case '/__editor/rename': {
          const { oldPath, newName } = body;
          if (!oldPath || !newName) {
            return sendJson(res, 400, { error: 'oldPath and newName are required' });
          }
          // Destroy Yjs room if renaming a file that's open
          yjsSync.destroyRoom(oldPath);
          const newPath = store.renameItem(oldPath, newName);
          return sendJson(res, 200, { newPath });
        }

        case '/__editor/subtask-toggle': {
          const { filePath, state } = body;
          if (!filePath || typeof filePath !== 'string') {
            return sendJson(res, 400, { error: 'filePath is required' });
          }
          if (!filePath.endsWith('.md') || !filePath.includes('/subtasks/')) {
            return sendJson(res, 400, { error: 'Not a subtask file' });
          }
          const resolved = path.resolve(filePath);
          if (!fs.existsSync(resolved)) {
            return sendJson(res, 404, { error: 'Subtask file not found' });
          }
          const allowed = (store as any).config?.watchPaths as string[] | undefined;
          if (allowed && !allowed.some((wp) => resolved.startsWith(path.resolve(wp)))) {
            return sendJson(res, 403, { error: 'Path not allowed' });
          }
          // `state` is the sole source of truth — one of the 4 canonical values.
          const VALID = new Set(['open', 'review', 'closed', 'cancelled']);
          if (typeof state !== 'string' || !VALID.has(state)) {
            return sendJson(res, 400, { error: 'state is required (open|review|closed|cancelled)' });
          }
          const raw = fs.readFileSync(resolved, 'utf-8');
          const parsed = matter(raw);
          const data = { ...parsed.data, state };
          fs.writeFileSync(resolved, matter.stringify(parsed.content, data));
          return sendJson(res, 200, { ok: true, state });
        }

        case '/__editor/delete': {
          const { itemPath } = body;
          if (!itemPath) {
            return sendJson(res, 400, { error: 'itemPath is required' });
          }
          // Destroy Yjs room if deleting a file that's open
          yjsSync.destroyRoom(itemPath);
          store.deleteItem(itemPath);
          return sendJson(res, 200, { success: true });
        }

        default:
          return sendJson(res, 404, { error: 'Unknown editor endpoint' });
      }
    } catch (err: any) {
      console.error('[editor] Middleware error:', err);
      return sendJson(res, 500, { error: err.message || 'Internal server error' });
    }
  });

  console.log('[editor] Middleware registered (/__editor/*)');
}
