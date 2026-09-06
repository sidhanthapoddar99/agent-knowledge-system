/**
 * Grouped view: each group value becomes its own mini-board (table +
 * pagination). Status filter, search, field chips and sort are GLOBAL —
 * one value applied uniformly across all groups. Only pagination is
 * actually per-group (each group has its own page cursor).
 */
import { rowMatchesStateTab, sortValue } from './filters';
import type { Config, FilterState, GroupSubState, StateTab } from './types';

/** In-memory state per group value. Reset when the group dimension changes. */
const perGroupState = new Map<string, GroupSubState>();
let lastGroupField: string | null = null;

export function resetGroupStateIfNeeded(groupField: string | null): void {
  if (groupField !== lastGroupField) {
    perGroupState.clear();
    lastGroupField = groupField;
  }
}

export function getGroupSub(value: string): GroupSubState {
  let s = perGroupState.get(value);
  if (!s) {
    s = { page: 1 };
    perGroupState.set(value, s);
  }
  return s;
}

/** Reset every group's page to 1 — called when page-size changes or when
 *  the global status tab changes (since the result set shrinks/grows). */
export function resetAllGroupPages(): void {
  perGroupState.forEach((s) => (s.page = 1));
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!
  ));
}

/** Builds one fully-independent group section: title + its own state tabs
 * + its own table + its own pagination. Reads UI state from getGroupSub. */
export function buildGroupSection(
  value: string,
  groupRows: HTMLElement[],
  state: FilterState,
  cfg: Config,
  mainTable: HTMLElement,
  pageSize: number,
): HTMLElement {
  const sub = getGroupSub(value);

  // Count per category tab within this group (global filters already applied).
  const counts: Record<StateTab, number> = {
    active: 0, 'in-progress': 0, review: 0, 'not-started': 0, closed: 0, all: 0,
  };
  for (const r of groupRows) {
    counts.all++;
    for (const tab of ['active', 'in-progress', 'review', 'not-started', 'closed'] as StateTab[]) {
      if (rowMatchesStateTab(r, tab)) counts[tab]++;
    }
  }

  // Status filter is GLOBAL — every group section reads the same
  // `state.state` value. Subtask 21: this used to be `sub.tab`, a per-group
  // in-memory toggle that didn't persist across refresh and let groups drift
  // out of sync from each other.
  let filtered = groupRows.filter((r) => rowMatchesStateTab(r, state.state));

  if (state.sort && state.dir) {
    const dirMul = state.dir === 'asc' ? 1 : -1;
    filtered = filtered.slice().sort((a, b) => {
      const va = sortValue(a, state.sort!, cfg);
      const vb = sortValue(b, state.sort!, cfg);
      if (va < vb) return -1 * dirMul;
      if (va > vb) return 1 * dirMul;
      return 0;
    });
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (sub.page > totalPages) sub.page = totalPages;
  const start = (sub.page - 1) * pageSize;
  const shown = filtered.slice(start, start + pageSize);

  const section = document.createElement('section');
  section.className = 'issues-table__group-section';
  section.setAttribute('data-group-value', value);

  // Title bar owns the whole header strip: group name (left) + compact
  // state-tab filter (right, inline). No second row of tabs below.
  const titleBar = document.createElement('div');
  titleBar.className = 'issues-table__group-title-bar';
  const titleInner = document.createElement('div');
  titleInner.className = 'issues-table__group-title-text';
  titleInner.innerHTML = `
    <h2 class="issues-table__group-title">${escapeHtml(value)}</h2>
    <span class="issues-table__group-count">${counts.all} ${counts.all === 1 ? 'issue' : 'issues'}</span>`;
  titleBar.appendChild(titleInner);

  const globalTabs = document.getElementById('issues-state-tabs');
  if (globalTabs) {
    const tabsClone = globalTabs.cloneNode(true) as HTMLElement;
    tabsClone.removeAttribute('id');
    tabsClone.removeAttribute('hidden');
    tabsClone.classList.add('issues-state-tabs--compact');
    tabsClone.querySelectorAll<HTMLElement>('[data-state-tab]').forEach((btn) => {
      const tab = btn.dataset.stateTab as StateTab;
      // All cloned strips reflect the SAME global value — every group section
      // shows the active tab matching `state.state`.
      const active = tab === state.state;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      const countEl = btn.querySelector<HTMLElement>('[data-state-count]');
      if (countEl) countEl.textContent = String(counts[tab]);
    });
    titleBar.appendChild(tabsClone);
  }
  section.appendChild(titleBar);

  // Table — deep clone of the main table so all Astro scoped-style
  // attributes (data-astro-cid-*) are inherited and the rows look identical.
  const sectionTable = mainTable.cloneNode(true) as HTMLElement;
  sectionTable.removeAttribute('id');
  sectionTable.style.display = '';
  sectionTable.querySelectorAll<HTMLElement>('thead th').forEach((th) => {
    th.style.position = 'static';
  });
  const sectionTbody = sectionTable.querySelector('tbody');
  if (sectionTbody) {
    sectionTbody.removeAttribute('id');
    sectionTbody.innerHTML = '';
    shown.forEach((r) => {
      const clone = r.cloneNode(true) as HTMLElement;
      clone.removeAttribute('id');
      clone.style.display = '';
      clone.setAttribute('data-group-clone', '');
      sectionTbody.appendChild(clone);
    });
  }
  section.appendChild(sectionTable);

  // Pagination — clone the global nav, strip ids, tag controls for
  // delegated handlers to resolve the section via data-group-value.
  const globalPagi = document.getElementById('issues-pagination');
  if (globalPagi) {
    const pagiClone = globalPagi.cloneNode(true) as HTMLElement;
    pagiClone.removeAttribute('id');
    pagiClone.removeAttribute('hidden');
    const rangeEl = pagiClone.querySelector('#issues-range');
    rangeEl?.removeAttribute('id');
    if (rangeEl) {
      rangeEl.textContent = total === 0
        ? '0 of 0'
        : `${start + 1}–${Math.min(start + pageSize, total)} of ${total}`;
    }
    const pageNumEl = pagiClone.querySelector('#issues-page-num');
    pageNumEl?.removeAttribute('id');
    if (pageNumEl) pageNumEl.textContent = String(sub.page);
    const pageTotalEl = pagiClone.querySelector('#issues-page-total');
    pageTotalEl?.removeAttribute('id');
    if (pageTotalEl) pageTotalEl.textContent = String(totalPages);
    const prev = pagiClone.querySelector<HTMLButtonElement>('#issues-prev');
    prev?.removeAttribute('id');
    if (prev) { prev.disabled = sub.page <= 1; prev.setAttribute('data-group-prev', ''); }
    const next = pagiClone.querySelector<HTMLButtonElement>('#issues-next');
    next?.removeAttribute('id');
    if (next) { next.disabled = sub.page >= totalPages; next.setAttribute('data-group-next', ''); }
    const sizeSel = pagiClone.querySelector<HTMLSelectElement>('#issues-page-size');
    sizeSel?.removeAttribute('id');
    if (sizeSel) { sizeSel.value = String(pageSize); sizeSel.setAttribute('data-group-size', ''); }
    pagiClone.classList.add('issues-pagination--group');
    section.appendChild(pagiClone);
  }

  return section;
}
