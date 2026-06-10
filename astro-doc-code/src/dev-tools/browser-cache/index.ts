/**
 * Browser Cache — Astro dev toolbar app.
 *
 * Lists the framework's localStorage state (sidebar collapse blobs, issues
 * filters, editor UI prefs) grouped by key prefix, with per-group and
 * clear-all actions. Companion to the Cache Inspector (which covers the
 * server-side in-memory caches); this one covers the browser side.
 */

import { devToolsSharedCss } from '../_shared/styles';

interface KeyGroup {
  label: string;
  /** Key matches when it starts with any of these prefixes (exact keys allowed). */
  prefixes: string[];
}

const GROUPS: KeyGroup[] = [
  { label: 'Docs sidebar collapse', prefixes: ['sidebar-collapse:'] },
  { label: 'Issues sidebar collapse', prefixes: ['issues-sidebar-collapse:'] },
  { label: 'Issues list filters', prefixes: ['issues-filters:', 'issues-filter-mode:', 'issues-page-size'] },
  { label: 'Editor UI prefs', prefixes: ['ev2-'] },
];

function matchGroup(key: string): KeyGroup | null {
  for (const g of GROUPS) {
    if (g.prefixes.some((p) => key.indexOf(p) === 0)) return g;
  }
  return null;
}

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function collect(): Map<KeyGroup, Array<{ key: string; bytes: number }>> {
  const byGroup = new Map<KeyGroup, Array<{ key: string; bytes: number }>>();
  for (const g of GROUPS) byGroup.set(g, []);
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const g = matchGroup(k);
    if (!g) continue;
    const v = localStorage.getItem(k) || '';
    byGroup.get(g)!.push({ key: k, bytes: k.length + v.length });
  }
  return byGroup;
}

export default {
  id: 'browser-cache',
  name: 'Browser Cache',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><path d="M10 12l2 2 4-4"/></svg>`,

  async init(canvas: ShadowRoot, app: any, _server: any) {
    const style = document.createElement('style');
    style.textContent = devToolsSharedCss + `
      .bc-root { min-width: 460px; }
      .bc-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 6px; border-bottom: 1px solid var(--dt-border-subtle); }
      .bc-row:last-child { border-bottom: none; }
      .bc-label { color: var(--dt-text); }
      .bc-meta { color: var(--dt-text-muted); font-size: var(--dt-text-micro); font-variant-numeric: tabular-nums; }
      .bc-keys { font-family: var(--dt-font-mono); font-size: var(--dt-text-micro); color: var(--dt-text-muted); word-break: break-all; margin-top: 2px; }
      .bc-btn { background: none; border: 1px solid var(--dt-border); color: var(--dt-text); border-radius: 4px; padding: 2px 10px; font-size: var(--dt-text-micro); cursor: pointer; white-space: nowrap; }
      .bc-btn:hover { border-color: var(--dt-warn); color: var(--dt-warn); }
      .bc-btn:disabled { opacity: 0.4; cursor: default; }
      .bc-btn:disabled:hover { border-color: var(--dt-border); color: var(--dt-text); }
      .bc-all { margin: 8px 6px 2px; display: flex; justify-content: flex-end; }
    `;
    canvas.appendChild(style);

    const win = document.createElement('astro-dev-toolbar-window');
    win.innerHTML = `
      <div class="dt-root bc-root">
        <div class="bc-body"></div>
        <div class="dt-status" data-status></div>
      </div>
    `;
    canvas.appendChild(win);

    const body = win.querySelector('.bc-body') as HTMLElement;
    const status = win.querySelector('[data-status]') as HTMLElement;

    function clearGroup(g: KeyGroup): number {
      const doomed: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && matchGroup(k) === g) doomed.push(k);
      }
      doomed.forEach((k) => localStorage.removeItem(k));
      return doomed.length;
    }

    function render() {
      const byGroup = collect();
      let total = 0;

      const rows = GROUPS.map((g, idx) => {
        const entries = byGroup.get(g)!;
        const bytes = entries.reduce((a, e) => a + e.bytes, 0);
        total += entries.length;
        const sample = entries.slice(0, 3).map((e) => escapeHtml(e.key)).join('<br>');
        return `
          <div class="bc-row">
            <div>
              <div class="bc-label">${escapeHtml(g.label)}</div>
              <div class="bc-meta">${entries.length} key${entries.length === 1 ? '' : 's'} · ${fmtBytes(bytes)}</div>
              ${entries.length ? `<div class="bc-keys">${sample}${entries.length > 3 ? '<br>…' : ''}</div>` : ''}
            </div>
            <button class="bc-btn" data-group="${idx}" ${entries.length ? '' : 'disabled'}>Clear</button>
          </div>`;
      }).join('');

      body.innerHTML = `
        <div class="dt-card">
          <div class="dt-head"><span>localStorage (this origin)</span><span>${total} framework key${total === 1 ? '' : 's'}</span></div>
          ${rows}
          <div class="bc-all">
            <button class="bc-btn" data-all ${total ? '' : 'disabled'}>Clear all framework keys</button>
          </div>
        </div>
      `;

      body.querySelectorAll<HTMLButtonElement>('.bc-btn[data-group]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const g = GROUPS[Number(btn.dataset.group)];
          const n = clearGroup(g);
          status.textContent = `Cleared ${n} key${n === 1 ? '' : 's'} (${g.label})`;
          render();
        });
      });
      const allBtn = body.querySelector<HTMLButtonElement>('.bc-btn[data-all]');
      if (allBtn) {
        allBtn.addEventListener('click', () => {
          let n = 0;
          for (const g of GROUPS) n += clearGroup(g);
          status.textContent = `Cleared ${n} key${n === 1 ? '' : 's'} (all groups)`;
          render();
        });
      }
    }

    app.onToggled(({ state }: { state: boolean }) => {
      if (state) {
        render();
        status.textContent = 'Cleared keys take effect on next page load.';
      }
    });
  },
};
