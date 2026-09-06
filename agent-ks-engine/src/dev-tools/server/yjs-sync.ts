/**
 * Yjs Sync - CRDT-based real-time text synchronization + multiplexed editor messages
 *
 * Manages Yjs documents (rooms) per file and syncs them over WebSocket.
 * Each room has a Y.Doc with a shared Y.Text ("content") that represents
 * the file's raw markdown. The Yjs CRDT handles concurrent edits correctly
 * without manual operational transform.
 *
 * In addition to Yjs sync (MSG_SYNC), the WebSocket carries awareness
 * (remote cursors), ping/latency, and config delivery. SSE is only
 * used for the global presence table (join/leave/page).
 * Rendering is fully client-side — no server render round-trips.
 *
 * Architecture:
 * - Server owns the authoritative Y.Doc per file
 * - Clients connect via WebSocket, exchange sync messages
 * - Any local edit → Y.Text change → Yjs broadcasts to all peers
 * - EditorStore.doc.raw is kept in sync via an observe callback
 *
 * Dev-only: never loaded in production builds.
 */

import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';
import type { PresenceManager, PresenceConfig } from './presence';
import type { EditorStore } from './editor-store';

// WS message types (first varuint in every frame)
const MSG_SYNC       = 0; // Yjs binary sync
const MSG_PING       = 2; // C→S: {clientTime, latencyMs}, S→C: {clientTime}
const MSG_CONFIG     = 3; // S→C: timing config on connect
const MSG_AWARENESS  = 6; // Bidirectional: awareness protocol (remote cursors)

interface YjsRoom {
  doc: Y.Doc;
  text: Y.Text;
  conns: Map<WebSocket, string>; // ws → userId
  lastActivity: number;
}

export class YjsSync {
  private rooms = new Map<string, YjsRoom>();
  private wss: WebSocketServer;
  private onContentChange: ((filePath: string, raw: string) => void) | null = null;
  private evictionTimer: ReturnType<typeof setInterval> | null = null;

  // Late-bound dependencies (set via setDependencies after construction)
  private presence: PresenceManager | null = null;
  private store: EditorStore | null = null;
  private config: PresenceConfig | null = null;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
  }

  /**
   * Inject dependencies that aren't available at construction time.
   * Called once from integration.ts after all components are created.
   */
  setDependencies(presence: PresenceManager, store: EditorStore, config: PresenceConfig): void {
    this.presence = presence;
    this.store = store;
    this.config = config;
  }

  /**
   * Set the callback that fires when a Yjs document's content changes
   * (from a client edit). Used to keep EditorStore.doc.raw in sync.
   */
  setContentChangeHandler(handler: (filePath: string, raw: string) => void): void {
    this.onContentChange = handler;
  }

  /**
   * Attach the WebSocket upgrade handler to Vite's HTTP server.
   * Handles upgrades on /__editor/yjs?file=<filePath>&userId=<userId>.
   */
  attachToServer(httpServer: Server): void {
    httpServer.on('upgrade', (request, socket, head) => {
      if (!request.url?.startsWith('/__editor/yjs')) return;

      const url = new URL(request.url, 'http://localhost');
      const filePath = url.searchParams.get('file');
      const userId = url.searchParams.get('userId');
      if (!filePath || !userId) {
        socket.destroy();
        return;
      }

      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.handleConnection(ws, filePath, userId);
      });
    });

    console.log('[yjs] WebSocket sync attached to server (/__editor/yjs)');
  }

  /**
   * Get or create a Yjs room for a file.
   * If the room already exists, returns it unchanged.
   * If not, creates a new Y.Doc initialized with the content.
   */
  getOrCreateRoom(filePath: string, initialContent: string): YjsRoom {
    const existing = this.rooms.get(filePath);
    if (existing) return existing;

    const doc = new Y.Doc();
    const text = doc.getText('content');

    // Initialize with file content
    doc.transact(() => {
      text.insert(0, initialContent);
    }, 'init');

    // Observe text changes from client edits → update EditorStore
    text.observe((_event: Y.YTextEvent, transaction: Y.Transaction) => {
      if (transaction.origin === 'init' || transaction.origin === 'reset') return;
      this.onContentChange?.(filePath, text.toString());
    });

    // Broadcast doc updates to all connected clients (except sender)
    doc.on('update', (update: Uint8Array, origin: unknown) => {
      const room = this.rooms.get(filePath);
      if (!room) return;

      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_SYNC);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);

      for (const [conn] of room.conns) {
        if (conn === origin) continue;
        if (conn.readyState === WebSocket.OPEN) {
          try { conn.send(message); } catch { /* broken connection */ }
        }
      }
    });

    const room: YjsRoom = { doc, text, conns: new Map(), lastActivity: Date.now() };
    this.rooms.set(filePath, room);

    console.log(`[yjs] Room created: ${filePath.split('/').slice(-3).join('/')}`);
    return room;
  }

  /**
   * Get the number of active connections to a room.
   */
  getConnectionCount(filePath: string): number {
    const room = this.rooms.get(filePath);
    if (!room) return 0;
    return room.conns.size;
  }

  /**
   * Destroy a Yjs room — closes all connections and removes the room.
   */
  destroyRoom(filePath: string): void {
    const room = this.rooms.get(filePath);
    if (!room) return;

    for (const [ws] of room.conns) {
      try { ws.close(); } catch { /* already closed */ }
    }
    room.doc.destroy();
    this.rooms.delete(filePath);

    console.log(`[yjs] Room destroyed: ${filePath.split('/').slice(-3).join('/')}`);
  }

  /**
   * Reset a room's content (for external file changes).
   * Replaces all text in the Y.Doc, which broadcasts to all clients.
   */
  resetContent(filePath: string, newContent: string): void {
    const room = this.rooms.get(filePath);
    if (!room) return;

    room.doc.transact(() => {
      room.text.delete(0, room.text.length);
      room.text.insert(0, newContent);
    }, 'reset');

    console.log(`[yjs] Content reset: ${filePath.split('/').slice(-3).join('/')}`);
  }

  /**
   * Check if a room has active connections.
   */
  hasConnections(filePath: string): boolean {
    const room = this.rooms.get(filePath);
    return room ? room.conns.size > 0 : false;
  }

  /**
   * Start periodic eviction of idle rooms (no connections for maxIdleMs).
   */
  startEviction(intervalMs = 60_000, maxIdleMs = 30 * 60_000): void {
    if (this.evictionTimer) return;
    this.evictionTimer = setInterval(() => {
      const now = Date.now();
      for (const [filePath, room] of this.rooms) {
        if (room.conns.size === 0 && now - room.lastActivity > maxIdleMs) {
          console.log(`[yjs] Evicting idle room: ${filePath.split('/').slice(-3).join('/')}`);
          this.destroyRoom(filePath);
        }
      }
    }, intervalMs);
  }

  /**
   * Stop the eviction timer.
   */
  stopEviction(): void {
    if (this.evictionTimer) {
      clearInterval(this.evictionTimer);
      this.evictionTimer = null;
    }
  }

  /**
   * Return stats for all active rooms (for /__editor/stats endpoint).
   */
  getRoomStats(): { filePath: string; connections: number; lastActivity: number; bytes: number; textLength: number }[] {
    return [...this.rooms.entries()].map(([filePath, room]) => ({
      filePath,
      connections: room.conns.size,
      lastActivity: room.lastActivity,
      bytes: Y.encodeStateAsUpdate(room.doc).byteLength,
      textLength: room.text.length,
    }));
  }

  // ---- Private helpers ----

  /**
   * Send a JSON-encoded message over WebSocket using lib0 framing.
   */
  private sendWsJson(ws: WebSocket, type: number, payload: Record<string, any>): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, type);
    encoding.writeVarString(encoder, JSON.stringify(payload));
    try { ws.send(encoding.toUint8Array(encoder)); } catch { /* broken */ }
  }

  /**
   * Handle a new WebSocket connection for a file.
   */
  private handleConnection(ws: WebSocket, filePath: string, userId: string): void {
    const room = this.rooms.get(filePath);
    if (!room) {
      ws.close(4004, 'Room not found — open the file first');
      return;
    }

    room.conns.set(ws, userId);
    room.lastActivity = Date.now();

    // Send config on connect
    if (this.config) {
      this.sendWsJson(ws, MSG_CONFIG, {
        pingInterval: this.config.pingInterval,
        cursorThrottle: this.config.cursorThrottle,
      });
    }

    // Send SyncStep1 (our state vector) so the client can respond with its diff
    const initEncoder = encoding.createEncoder();
    encoding.writeVarUint(initEncoder, MSG_SYNC);
    syncProtocol.writeSyncStep1(initEncoder, room.doc);
    ws.send(encoding.toUint8Array(initEncoder));

    // Handle incoming messages from client
    ws.on('message', (data: ArrayBuffer | Buffer) => {
      room.lastActivity = Date.now();
      try {
        const message = new Uint8Array(
          data instanceof ArrayBuffer
            ? data
            : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
        );
        const decoder = decoding.createDecoder(message);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case MSG_SYNC: {
            const responseEncoder = encoding.createEncoder();
            encoding.writeVarUint(responseEncoder, MSG_SYNC);
            syncProtocol.readSyncMessage(decoder, responseEncoder, room.doc, ws);
            if (encoding.length(responseEncoder) > 1) {
              ws.send(encoding.toUint8Array(responseEncoder));
            }
            break;
          }

          case MSG_PING: {
            const payload = JSON.parse(decoding.readVarString(decoder));
            // Update latency in presence
            if (typeof payload.latencyMs === 'number') {
              this.presence?.updateLatency(userId, payload.latencyMs);
            }
            // Echo clientTime for round-trip measurement
            this.sendWsJson(ws, MSG_PING, { clientTime: payload.clientTime });
            break;
          }

          case MSG_AWARENESS: {
            // v2: Forward awareness messages to all peers (cursor sharing)
            // Raw binary — no parsing, just rebroadcast to room peers
            const awarenessData = message; // Forward the entire raw message
            for (const [conn] of room.conns) {
              if (conn === ws) continue;
              if (conn.readyState === WebSocket.OPEN) {
                try { conn.send(awarenessData); } catch { /* broken */ }
              }
            }
            break;
          }

        }
      } catch (err) {
        console.error('[yjs] Error handling message:', err);
      }
    });

    ws.on('close', () => {
      room.conns.delete(ws);
      // Auto cursor-clear on disconnect
      this.presence?.handleAction({ type: 'cursor-clear', userId });
      console.log(`[yjs] Client disconnected (${room.conns.size} remaining)`);
    });

    ws.on('error', () => {
      room.conns.delete(ws);
    });

    console.log(`[yjs] Client connected: ${userId} (${room.conns.size} total)`);
  }
}
