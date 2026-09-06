/**
 * Cache Inspector — Astro dev toolbar app.
 *
 * Flat listing of server-side in-memory caches (Yjs rooms, editor docs,
 * presence). Each row: key + size + short metadata; full payloads stay
 * abstracted. Polls `/__editor/system` every 2s while open.
 */

import { devToolsSharedCss } from '../_shared/styles';

interface RoomStat { filePath: string; connections: number; lastActivity: number; bytes: number; textLength: number }
interface DocStat { filePath: string; dirty: boolean; bytes: number }
interface PresenceStat {
  userCount: number; streamCount: number;
  users: Array<{ userId: string; name: string; currentPage: string; editingFile: string | null; latencyMs: number }>;
}
interface SystemResponse { caches: { yjsRooms: RoomStat[]; editorDocs: DocStat[]; presence: PresenceStat } }

const POLL_MS = 2000;
const LARGE_BYTES = 100 * 1024;

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function fmtAgeMs(ms: number): string {
  if (ms < 1000) return 'just now';
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  return `${Math.floor(ms / 3_600_000)}h ago`;
}
function basename(p: string): string {
  const i = p.replace(/\\/g, '/').lastIndexOf('/');
  return i < 0 ? p : p.slice(i + 1);
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export default {
  id: 'cache-inspector',
  name: 'Cache Inspector',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>`,

  async init(canvas: ShadowRoot, app: any, _server: any) {
    const style = document.createElement('style');
    style.textContent = devToolsSharedCss + `
      .ci-root { min-width: 520px; }
      .ci-table { width: 100%; border-collapse: collapse; font-size: var(--dt-text-label); }
      .ci-table th { text-align: left; color: var(--dt-text-muted); font-weight: 500; padding: 4px 6px; border-bottom: 1px solid var(--dt-border); font-size: var(--dt-text-micro); text-transform: uppercase; }
      .ci-table td { padding: 4px 6px; border-bottom: 1px solid var(--dt-border-subtle); font-variant-numeric: tabular-nums; }
      .ci-table tr:hover { background: var(--dt-border-subtle); }
      .ci-key { font-family: var(--dt-font-mono); color: var(--dt-text-code); word-break: break-all; max-width: 320px; }
      .ci-size { text-align: right; color: var(--dt-text); white-space: nowrap; }
      .ci-size.is-large { color: var(--dt-warn); font-weight: 600; }
      .ci-meta { color: var(--dt-text-muted); font-size: var(--dt-text-micro); }
    `;
    canvas.appendChild(style);

    const win = document.createElement('astro-dev-toolbar-window');
    win.innerHTML = `
      <div class="dt-root ci-root">
        <div class="ci-body"><div class="dt-empty">Loading…</div></div>
        <div class="dt-status" data-status></div>
      </div>
    `;
    canvas.appendChild(win);

    const root = win.querySelector('.ci-root') as HTMLElement;
    const body = root.querySelector('.ci-body') as HTMLElement;
    const status = root.querySelector('[data-status]') as HTMLElement;

    let timer: ReturnType<typeof setInterval> | null = null;
    let inflight = false;

    async function tick() {
      if (inflight) return;
      inflight = true;
      try {
        const res = await fetch('/__editor/system');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SystemResponse = await res.json();
        render(data.caches);
        status.textContent = `Updated ${new Date().toLocaleTimeString()}`;
      } catch (err: any) {
        status.textContent = `Fetch failed: ${err.message || err}`;
      } finally {
        inflight = false;
      }
    }

    app.onToggled(({ state }: { state: boolean }) => {
      if (state) {
        if (!timer) { tick(); timer = setInterval(tick, POLL_MS); }
      } else if (timer) { clearInterval(timer); timer = null; }
    });

    function render(c: SystemResponse['caches']) {
      const now = Date.now();
      const largeClass = (b: number) => (b >= LARGE_BYTES ? 'is-large' : '');

      const yjsRows = c.yjsRooms.length
        ? c.yjsRooms
            .sort((a, b) => b.bytes - a.bytes)
            .map((r) => `
              <tr>
                <td class="ci-key" title="${escapeHtml(r.filePath)}">${escapeHtml(basename(r.filePath))}</td>
                <td class="ci-size ${largeClass(r.bytes)}">${fmtBytes(r.bytes)}</td>
                <td class="ci-meta">${r.connections} conn · ${r.textLength.toLocaleString()} chars · ${fmtAgeMs(now - r.lastActivity)}</td>
              </tr>`).join('')
        : `<tr><td colspan="3" class="dt-empty">No open rooms</td></tr>`;

      const docRows = c.editorDocs.length
        ? c.editorDocs
            .sort((a, b) => b.bytes - a.bytes)
            .map((d) => `
              <tr>
                <td class="ci-key" title="${escapeHtml(d.filePath)}">${escapeHtml(basename(d.filePath))}</td>
                <td class="ci-size ${largeClass(d.bytes)}">${fmtBytes(d.bytes)}</td>
                <td class="ci-meta">${d.dirty ? 'dirty' : 'clean'}</td>
              </tr>`).join('')
        : `<tr><td colspan="3" class="dt-empty">No open docs</td></tr>`;

      const userRows = c.presence.users.length
        ? c.presence.users.map((u) => `
              <tr>
                <td class="ci-key">${escapeHtml(u.name || u.userId)}</td>
                <td class="ci-size">${u.latencyMs}ms</td>
                <td class="ci-meta">${escapeHtml(u.currentPage || '—')}${u.editingFile ? ` · editing ${escapeHtml(basename(u.editingFile))}` : ''}</td>
              </tr>`).join('')
        : `<tr><td colspan="3" class="dt-empty">No active users</td></tr>`;

      const totalYjs = c.yjsRooms.reduce((a, r) => a + r.bytes, 0);
      const totalDocs = c.editorDocs.reduce((a, d) => a + d.bytes, 0);

      body.innerHTML = `
        <div class="dt-card">
          <div class="dt-head"><span>Yjs rooms (live-editor cache)</span><span>${c.yjsRooms.length} · ${fmtBytes(totalYjs)}</span></div>
          <table class="ci-table">
            <thead><tr><th>File</th><th style="text-align: right">Size</th><th>Meta</th></tr></thead>
            <tbody>${yjsRows}</tbody>
          </table>
        </div>

        <div class="dt-card">
          <div class="dt-head"><span>Editor docs (raw)</span><span>${c.editorDocs.length} · ${fmtBytes(totalDocs)}</span></div>
          <table class="ci-table">
            <thead><tr><th>File</th><th style="text-align: right">Size</th><th>State</th></tr></thead>
            <tbody>${docRows}</tbody>
          </table>
        </div>

        <div class="dt-card">
          <div class="dt-head"><span>Presence</span><span>${c.presence.userCount} users · ${c.presence.streamCount} SSE streams</span></div>
          <table class="ci-table">
            <thead><tr><th>User</th><th style="text-align: right">Ping</th><th>Page</th></tr></thead>
            <tbody>${userRows}</tbody>
          </table>
        </div>
      `;
    }
  },
};
