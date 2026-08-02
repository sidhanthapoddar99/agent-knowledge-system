/**
 * Panel switching. A panel is identified by data-panel="<key>". The left
 * sidebar buttons fire activate(), which:
 *   - toggles .is-active on the matching sidebar button
 *   - shows the matching <section class="issue-panel">
 *   - swaps the right-rail TOC panel (data-meta-panel) to match, falling
 *     back to the overview panel if there is no per-panel TOC
 *
 * Deep-link support: #panel-key on page load, and the special
 * #comprehensive-<slug> form which activates Comprehensive then scrolls
 * to the referenced sub-item.
 */

export function knownPanel(key: string): boolean {
  return !!document.querySelector(`.issue-panel[data-panel="${CSS.escape(key)}"]`);
}

/**
 * Rewrite old hash-panel URLs (`#subtask-foo`, `#note-<group>--<name>`,
 * `#log-<group>--<subgroup>--<name>`) into the new sub-doc path. Segments are
 * joined with `--`. Returns the full path + search string, or null when the
 * hash is not a sub-doc hash.
 *
 * The prefix → section-segment map is a **build-time copy** of the registry in
 * `loaders/issue-sections.ts`. This module is client-side and must not pull a
 * loader (and its `fs` imports) into the browser bundle, so the copy is
 * deliberate — the same wall the CLI's status mirror sits behind. Longest
 * prefix wins, so a shorter prefix added later cannot shadow `brainstorm-`.
 */
const PANEL_PREFIX_TO_SECTION: Record<string, string> = {
  'subtask-': 'subtasks',
  'note-': 'notes',
  'brainstorm-': 'brainstorm',
  'memory-': 'agent-memory',
  'log-': 'agent-log',
  'plan-': 'plans',
};

export function legacyHashRedirect(hash: string): string | null {
  const base = location.pathname.replace(/\/+$/, '');
  let best: [string, string] | null = null;
  for (const [prefix, section] of Object.entries(PANEL_PREFIX_TO_SECTION)) {
    if (!hash.startsWith(prefix)) continue;
    if (!best || prefix.length > best[0].length) best = [prefix, section];
  }
  if (!best) return null;
  const segments = hash.slice(best[0].length).split('--');
  return `${base}/${best[1]}/${segments.join('/')}${location.search}`;
}

export function expandSectionFor(panelKey: string) {
  const sidebar = document.querySelector<HTMLElement>('.issue-sidebar');
  const btn = sidebar?.querySelector<HTMLElement>(
    `.issue-sidebar__item[data-panel="${CSS.escape(panelKey)}"]`,
  );
  const section = btn?.closest<HTMLDetailsElement>('details.issue-sidebar__section');
  if (section && !section.open) section.open = true;
}

export function activate(panelKey: string, opts: { updateHash?: boolean } = {}) {
  const sidebar = document.querySelector<HTMLElement>('.issue-sidebar');
  sidebar?.querySelectorAll<HTMLElement>('.issue-sidebar__item').forEach((b) => {
    const active = b.dataset.panel === panelKey;
    b.classList.toggle('is-active', active);
    if (active) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  document.querySelectorAll<HTMLElement>('.issue-panel').forEach((p) => {
    const match = p.dataset.panel === panelKey;
    p.classList.toggle('is-active', match);
    if (match) p.removeAttribute('hidden');
    else p.setAttribute('hidden', '');
  });
  const metaPanels = document.querySelectorAll<HTMLElement>('.issue-meta__panel');
  const hasMatch = Array.from(metaPanels).some((p) => p.dataset.metaPanel === panelKey);
  const metaPanelKey = hasMatch ? panelKey : 'overview';
  metaPanels.forEach((p) => {
    const match = p.dataset.metaPanel === metaPanelKey;
    p.classList.toggle('is-active', match);
    if (match) p.removeAttribute('hidden');
    else p.setAttribute('hidden', '');
  });
  expandSectionFor(panelKey);
  if (opts.updateHash !== false) {
    const desired = panelKey === 'overview' ? ' ' : `#${panelKey}`;
    if (desired === ' ') history.replaceState(null, '', location.pathname + location.search);
    else history.replaceState(null, '', desired);
  }
}

export function wirePanelSwitching() {
  const sidebar = document.querySelector<HTMLElement>('.issue-sidebar');
  // Only buttons swap panels. Anchors navigate away on their own, even if
  // they also carry data-panel for active-state styling.
  sidebar?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-panel]');
    if (!btn) return;
    activate(btn.dataset.panel!);
    // Comment entries swap to the comments panel, then scroll to the item.
    const scrollTarget = btn.dataset.scroll;
    if (scrollTarget) {
      requestAnimationFrame(() => {
        document.getElementById(scrollTarget)?.scrollIntoView({ block: 'start' });
      });
    }
  });

  const rawHash = decodeURIComponent(location.hash.slice(1));
  if (rawHash) {
    const redirect = legacyHashRedirect(rawHash);
    if (redirect) {
      location.replace(redirect);
      return;
    }
    if (rawHash.startsWith('comprehensive-')) {
      activate('comprehensive', { updateHash: false });
      requestAnimationFrame(() => {
        document.getElementById(rawHash)?.scrollIntoView({ block: 'start' });
      });
    } else if (rawHash === 'comment-issue' || rawHash.startsWith('comment-')) {
      activate('comments', { updateHash: false });
      requestAnimationFrame(() => {
        document.getElementById(rawHash)?.scrollIntoView({ block: 'start' });
      });
    } else if (rawHash.startsWith('guide-')) {
      activate('guide', { updateHash: false });
      requestAnimationFrame(() => {
        document.getElementById(rawHash)?.scrollIntoView({ block: 'start' });
      });
    } else if (knownPanel(rawHash)) {
      activate(rawHash, { updateHash: false });
    }
  }

  window.addEventListener('hashchange', () => {
    const key = decodeURIComponent(location.hash.slice(1)) || 'overview';
    if (key.startsWith('comprehensive-')) {
      activate('comprehensive', { updateHash: false });
      document.getElementById(key)?.scrollIntoView({ block: 'start' });
    } else if (key.startsWith('comment-')) {
      activate('comments', { updateHash: false });
      document.getElementById(key)?.scrollIntoView({ block: 'start' });
    } else if (key.startsWith('guide-')) {
      activate('guide', { updateHash: false });
      document.getElementById(key)?.scrollIntoView({ block: 'start' });
    } else if (key === 'overview' || knownPanel(key)) {
      activate(key, { updateHash: false });
    }
  });
}
