/**
 * Yjs client for CodeMirror 6
 *
 * WebSocket protocol: MSG_SYNC for CRDT updates, MSG_AWARENESS for cursor
 * sharing (y-codemirror.next), MSG_PING for keepalive, MSG_CONFIG for
 * server-sent settings.
 *
 * Rendering is fully client-side — no server render round-trips.
 */

import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

import type { Identity, SaveStatus, Disposable } from '../types.js';
import { editorFetch } from '../util/dom-helpers.js';

// WS message types — must match server (yjs-sync.ts)
const MSG_SYNC       = 0;
const MSG_PING       = 2;
const MSG_CONFIG     = 3;
const MSG_AWARENESS  = 6;

export interface YjsV2Handle extends Disposable {
  ydoc: Y.Doc;
  ytext: Y.Text;
  awareness: awarenessProtocol.Awareness;
  save: () => Promise<void>;
  close: () => Promise<void>;
}

export interface YjsV2Options {
  filePath: string;
  identity: Identity;
  onSynced: () => void;
  onStatusChange: (status: SaveStatus) => void;
}

export function initYjsClientV2(opts: YjsV2Options): YjsV2Handle {
  const { filePath, identity } = opts;

  const ydoc = new Y.Doc();
  const ytext = ydoc.getText('content');
  const awareness = new awarenessProtocol.Awareness(ydoc);

  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let pingTimer: ReturnType<typeof setInterval> | null = null;
  let disposed = false;
  let synced = false;
  let lastLatencyMs = 0;

  // Config from server (defaults until MSG_CONFIG received)
  let configPingInterval = 5000;

  // Set local awareness state
  awareness.setLocalStateField('user', {
    name: identity.name,
    color: identity.color,
    colorLight: identity.color + '33',
  });

  // ---- WS helpers ----

  function sendSync(data: Uint8Array): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try { ws.send(data); } catch { /* broken */ }
  }

  function sendJson(type: number, payload: Record<string, any>): void {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, type);
    encoding.writeVarString(encoder, JSON.stringify(payload));
    try { ws.send(encoding.toUint8Array(encoder)); } catch { /* broken */ }
  }

  // ---- Awareness sync ----

  awareness.on('update', ({ added, updated, removed }: any) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_AWARENESS);
    const awarenessUpdate = awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients);
    encoding.writeVarUint8Array(encoder, awarenessUpdate);
    sendSync(encoding.toUint8Array(encoder));
  });

  // ---- Detect first sync: Y.Text populated from server ----

  ytext.observe((_event, transaction) => {
    if (transaction.origin !== 'remote') return;
    if (!synced) {
      synced = true;
      console.log('[editor-v2:yjs] First sync complete, ytext length:', ytext.toString().length);
      opts.onSynced();
    }
  });

  // ---- Doc updates → server ----

  ydoc.on('update', (update: Uint8Array, origin: unknown) => {
    if (origin === 'remote') return;
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    sendSync(encoding.toUint8Array(encoder));
    opts.onStatusChange('unsaved');
  });

  // ---- Ping loop ----

  function startPingLoop(): void {
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => {
      sendJson(MSG_PING, { clientTime: Date.now(), latencyMs: lastLatencyMs });
    }, configPingInterval);
  }

  function stopPingLoop(): void {
    if (pingTimer) { clearInterval(pingTimer); pingTimer = null; }
  }

  // ---- WebSocket connection ----

  function connect(): void {
    if (disposed) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/__editor/yjs?file=${encodeURIComponent(filePath)}&userId=${encodeURIComponent(identity.userId)}`;
    ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.addEventListener('open', () => {
      if (disposed) { ws?.close(); return; }
      // Send SyncStep1
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, MSG_SYNC);
      syncProtocol.writeSyncStep1(encoder, ydoc);
      ws!.send(encoding.toUint8Array(encoder));

      // Send full awareness state
      const awarenessEncoder = encoding.createEncoder();
      encoding.writeVarUint(awarenessEncoder, MSG_AWARENESS);
      encoding.writeVarUint8Array(awarenessEncoder,
        awarenessProtocol.encodeAwarenessUpdate(awareness, [ydoc.clientID])
      );
      ws!.send(encoding.toUint8Array(awarenessEncoder));

      startPingLoop();
    });

    ws.addEventListener('message', (event) => {
      const data = new Uint8Array(event.data as ArrayBuffer);
      const decoder = decoding.createDecoder(data);
      const msgType = decoding.readVarUint(decoder);

      switch (msgType) {
        case MSG_SYNC: {
          const responseEncoder = encoding.createEncoder();
          encoding.writeVarUint(responseEncoder, MSG_SYNC);
          syncProtocol.readSyncMessage(decoder, responseEncoder, ydoc, 'remote');
          if (encoding.length(responseEncoder) > 1) {
            ws!.send(encoding.toUint8Array(responseEncoder));
          }
          // Sync detection moved to ytext.observe above
          break;
        }

        case MSG_AWARENESS: {
          const update = decoding.readVarUint8Array(decoder);
          awarenessProtocol.applyAwarenessUpdate(awareness, update, 'remote');
          break;
        }

        case MSG_PING: {
          try {
            const payload = JSON.parse(decoding.readVarString(decoder));
            if (payload.clientTime) lastLatencyMs = Date.now() - payload.clientTime;
          } catch { /* ignore */ }
          break;
        }

        case MSG_CONFIG: {
          try {
            const payload = JSON.parse(decoding.readVarString(decoder));
            if (payload.pingInterval) configPingInterval = payload.pingInterval;
            startPingLoop();
          } catch { /* ignore */ }
          break;
        }
      }
    });

    ws.addEventListener('close', () => {
      ws = null;
      stopPingLoop();
      if (!disposed) {
        reconnectTimer = setTimeout(connect, 2000);
      }
    });

    ws.addEventListener('error', () => {
      ws?.close();
    });
  }

  // ---- Save ----

  async function save(): Promise<void> {
    opts.onStatusChange('saving');
    try {
      await editorFetch('save', { filePath });
      opts.onStatusChange('saved');
    } catch (err: any) {
      console.error('[editor-v2] Save failed:', err);
      opts.onStatusChange('unsaved');
    }
  }

  // ---- Close ----

  async function close(): Promise<void> {
    cleanup();
    try {
      await editorFetch('close', { filePath });
    } catch (err: any) {
      console.error('[editor-v2] Close failed:', err);
    }
  }

  // ---- Cleanup ----

  function cleanup(): void {
    disposed = true;
    stopPingLoop();
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (ws) { ws.close(); ws = null; }
    awareness.destroy();
    ydoc.destroy();
  }

  // ---- Open document + connect ----

  editorFetch('open', { filePath }).then((_data) => {
    // Rendering is now client-side — no need for server-rendered HTML
    opts.onStatusChange('saved');
    connect();
    // Render timer no longer needed — client renders locally via ytext.observe
  }).catch((err) => {
    console.error('[editor-v2] Failed to open:', err);
  });

  return {
    ydoc,
    ytext,
    awareness,
    save,
    close,
    cleanup,
  };
}
