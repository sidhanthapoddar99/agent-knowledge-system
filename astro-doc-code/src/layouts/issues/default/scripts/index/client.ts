/**
 * Issues index client-side entry point.
 *
 * Responsibilities kept here: URL ⇄ state sync, the master `apply()`
 * render pass, and event wiring. Domain logic is split into siblings:
 *   - issues-types.ts     → types + FIELDS + CLOSED_STATUSES
 *   - issues-filters.ts   → row matching / sorting (pure)
 *   - issues-groups.ts    → per-group mini-boards (DOM build)
 *   - issues-presets.ts   → preset view helpers
 */
import {
  FIELDS,
  PSEUDO_VALUES,
  type Config,
  type FilterState,
  type StateTab,
  type ViewMode,
} from './types';
import {
  needsReview,
  rowMatchesExcluding,
  rowMatchesStateTab,
  rowValues,
  sortValue,
  rowMatchesGlobal,
} from './filters';
import {
  buildGroupSection,
  getGroupSub,
  resetAllGroupPages,
  resetGroupStateIfNeeded,
} from './groups';
import {
  presetMatchesState,
  presetToParams,
} from './presets';

const VIEW_KEY = 'issues-view-mode';
const PAGESIZE_KEY = 'issues-page-size';
/** Per-tracker filter-state cache key. Scoped by pathname so separate
 *  trackers (e.g. /todo, /bugs) keep independent filters. */
const FILTER_CACHE_KEY = `issues-filters:${location.pathname}`;
const COMPACT_MODE_KEY = `issues-filter-mode:${location.pathname}`;

// ================= state cache (localStorage) =================

function saveFilterCache(state: FilterState) {
  try {
    const payload = {
      q: state.q,
      fields: Object.fromEntries(
        FIELDS.map((f) => [f, Array.from(state.fields[f])]),
      ),
      sort: state.sort,
      dir: state.dir,
      state: state.state,
      group: state.group,
    };
    localStorage.setItem(FILTER_CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

function loadFilterCache(): URLSearchParams | null {
  try {
    const raw = localStorage.getItem(FILTER_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const params = new URLSearchParams();
    if (data.q) params.set('q', data.q);
    if (data.fields) {
      for (const f of FIELDS) {
        const vals = (data.fields as Record<string, string[]>)[f];
        if (vals && vals.length) params.set(f, vals.join(','));
      }
    }
    if (data.state && data.state !== 'active') params.set('state', data.state);
    if (data.group) params.set('group', data.group);
    if (data.sort && data.dir) {
      params.set('sort', data.sort);
      params.set('dir', data.dir);
    }
    return params;
  } catch {
    return null;
  }
}

// ================= config (server → client) =================

function readConfig(): Config {
  const fallback: Config = {
    priorityOrder: [], statusOrder: [], colorsByField: {},
    groupDimensions: [], groupOrderByField: {}, presets: [],
  };
  const el = document.getElementById('issues-config');
  if (!el?.textContent) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(el.textContent) as Partial<Config>) };
  } catch {
    return fallback;
  }
}

// ================= URL ⇄ FilterState =================

function readState(): FilterState {
  const params = new URLSearchParams(location.search);
  const rawTab = params.get('state');
  const VALID_TABS: StateTab[] = ['active', 'in-progress', 'review', 'not-started', 'closed', 'all'];
  const tab: StateTab = VALID_TABS.includes(rawTab as StateTab) ? (rawTab as StateTab) : 'active';
  const state: FilterState = {
    q: params.get('q') || '',
    fields: {},
    sort: params.get('sort'),
    dir: (params.get('dir') as 'asc' | 'desc' | null) || null,
    page: Math.max(1, parseInt(params.get('page') || '1', 10) || 1),
    state: tab,
    group: params.get('group') || null,
  };
  for (const f of FIELDS) {
    const raw = params.get(f);
    state.fields[f] = new Set(raw ? raw.split(',').filter(Boolean) : []);
  }
  return state;
}

function writeState(state: FilterState) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  for (const f of FIELDS) {
    const vals = Array.from(state.fields[f]);
    if (vals.length > 0) params.set(f, vals.join(','));
  }
  if (state.state !== 'active') params.set('state', state.state);
  if (state.group) params.set('group', state.group);
  if (state.sort && state.dir) {
    params.set('sort', state.sort);
    params.set('dir', state.dir);
  }
  if (state.page > 1) params.set('page', String(state.page));
  const qs = params.toString();
  const url = qs ? `${location.pathname}?${qs}` : location.pathname;
  history.replaceState(null, '', url);
  saveFilterCache(state);
}

// ================= small DOM helpers =================

function activeView(): HTMLElement | null {
  return document.querySelector<HTMLElement>('.issues-view.is-active');
}

function pageSize(): number {
  try {
    const v = parseInt(localStorage.getItem(PAGESIZE_KEY) || '25', 10);
    return [10, 25, 50, 100].includes(v) ? v : 25;
  } catch { return 25; }
}

// ================= UI renderers (active tags, add-menus, etc.) =================

function renderActiveTags(state: FilterState, cfg: Config, onToggle: (f: string, v: string) => void) {
  for (const field of FIELDS) {
    const container = document.querySelector(`[data-tags-for="${field}"]`);
    if (!container) continue;
    container.innerHTML = '';
    const values = Array.from(state.fields[field]);
    for (const v of values) {
      const chip = document.createElement('span');
      chip.className = 'issues-filters__tag';
      const color = cfg.colorsByField?.[field]?.[v];
      if (color) chip.style.setProperty('--chip-color', color);
      chip.innerHTML = `
        <span class="issues-filters__tag-dot" aria-hidden="true"></span>
        <span class="issues-filters__tag-label">${v}</span>
        <button type="button" class="issues-filters__tag-remove" aria-label="Remove filter">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="3.5" y1="3.5" x2="12.5" y2="12.5"/>
            <line x1="12.5" y1="3.5" x2="3.5" y2="12.5"/>
          </svg>
        </button>
      `;
      chip.querySelector('.issues-filters__tag-remove')?.addEventListener('click', () => {
        onToggle(field, v);
      });
      container.appendChild(chip);
    }
    const clearBtn = document.querySelector<HTMLElement>(`[data-clear-field="${field}"]`);
    if (clearBtn) clearBtn.hidden = values.length === 0;
  }
}

function renderStateTabs(state: FilterState, allRows: HTMLElement[]) {
  const counts: Record<StateTab, number> = {
    active: 0, 'in-progress': 0, review: 0, 'not-started': 0, closed: 0, all: 0,
  };
  const stateNeutralState = { ...state, state: 'all' as StateTab };
  for (const row of allRows) {
    if (!rowMatchesExcluding(row, stateNeutralState, null)) continue;
    counts.all++;
    // Count each row under exactly one primary category tab (Review absorbs
    // active review-debt), plus the Active meta-tab for anything non-closed.
    for (const tab of ['active', 'in-progress', 'review', 'not-started', 'closed'] as StateTab[]) {
      if (rowMatchesStateTab(row, tab)) counts[tab]++;
    }
  }
  // Only update the GLOBAL strip (id=issues-state-tabs). Group clones carry
  // no id so they're left untouched — buildGroupSection sets their counts.
  const strip = document.getElementById('issues-state-tabs');
  strip?.querySelectorAll<HTMLElement>('[data-state-tab]').forEach((btn) => {
    const tab = btn.dataset.stateTab as StateTab;
    const active = tab === state.state;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    const countEl = btn.querySelector<HTMLElement>('[data-state-count]');
    if (countEl) countEl.textContent = String(counts[tab]);
  });
  // The status badge stays visible in every category tab (a category spans
  // several statuses) — only the "All" view is unchanged. Never hide it now.
  document.querySelectorAll<HTMLElement>('.issues-table').forEach((tbl) => {
    tbl.classList.remove('is-hide-status');
  });
}

function renderAddMenus(state: FilterState, allRows: HTMLElement[]) {
  for (const field of FIELDS) {
    const menu = document.querySelector(`[data-add-menu="${field}"]`);
    if (!menu) continue;
    const pseudos = PSEUDO_VALUES[field];
    menu.querySelectorAll<HTMLButtonElement>('[data-add-value]').forEach((opt) => {
      const value = opt.dataset.addValue!;
      const already = state.fields[field].has(value);
      opt.classList.toggle('is-selected', already);
      opt.disabled = already;

      let count = 0;
      for (const row of allRows) {
        if (!rowMatchesExcluding(row, state, field)) continue;
        const vals = rowValues(row, field);
        // Pseudo-values match a derived condition rather than a literal entry
        // in the row's value list — see types.ts → PSEUDO_VALUES.
        if (pseudos?.has(value)) {
          if (value === 'unassigned' && vals.length === 0) count++;
          else if (value === 'assigned' && vals.length > 0) count++;
        } else if (vals.includes(value)) {
          count++;
        }
      }
      const countEl = opt.querySelector<HTMLElement>('[data-add-count]');
      if (countEl) countEl.textContent = String(count);
      opt.classList.toggle('is-empty', count === 0 && !already);
    });
  }
}

/** Compact chips container: mirrors active filter chips into a single row
 * visible when the filter bar is collapsed. */
function renderCompactChips(state: FilterState, cfg: Config) {
  const container = document.getElementById('issues-compact-chips');
  if (!container) return;
  container.innerHTML = '';
  for (const f of FIELDS) {
    for (const v of state.fields[f]) {
      const chip = document.createElement('span');
      chip.className = 'issues-filters__tag';
      const color = cfg.colorsByField?.[f]?.[v];
      if (color) chip.style.setProperty('--chip-color', color);
      chip.innerHTML = `
        <span class="issues-filters__tag-dot" aria-hidden="true"></span>
        <span class="issues-filters__tag-label">${v}</span>
        <button type="button" class="issues-filters__tag-remove" aria-label="Remove filter">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="3.5" y1="3.5" x2="12.5" y2="12.5"/>
            <line x1="12.5" y1="3.5" x2="3.5" y2="12.5"/>
          </svg>
        </button>`;
      chip.querySelector('.issues-filters__tag-remove')?.addEventListener('click', () => {
        toggleFieldValue(f, v);
      });
      container.appendChild(chip);
    }
  }
}

// ================= main render loop =================

function apply(cfg: Config) {
  const state = readState();
  const view = activeView();
  if (!view) return;

  // Original rows only — skip any clones rendered for grouped view.
  const rows = Array.from(view.querySelectorAll<HTMLElement>('[data-issue]:not([data-group-clone])'));

  const isTable = view.matches('.issues-view--table');
  const mainTbody = isTable ? document.getElementById('issues-table-tbody') : null;
  const mainTable = isTable ? document.getElementById('issues-table-main') : null;
  const mainWrap = isTable ? view.querySelector('.issues-table-wrap') as HTMLElement | null : null;
  const groupsContainer = isTable ? view.querySelector('.issues-table__groups') as HTMLElement | null : null;

  const parent: HTMLElement = isTable ? (mainTbody as HTMLElement) : (view as HTMLElement);
  const groupField = state.group && cfg.groupDimensions.includes(state.group) ? state.group : null;

  // Hide/show the grouped-on column on the main table.
  if (mainTable) {
    mainTable.classList.remove('is-hide-col-component', 'is-hide-col-priority');
    if (groupField) mainTable.classList.add(`is-hide-col-${groupField}`);
  }

  // Global chrome is hidden in grouped mode (each section owns its own).
  const globalStateTabs = document.getElementById('issues-state-tabs');
  const globalPagination = document.getElementById('issues-pagination');
  if (groupField) {
    if (globalStateTabs) globalStateTabs.hidden = true;
    if (globalPagination) globalPagination.hidden = true;
  } else {
    if (globalStateTabs) globalStateTabs.hidden = false;
    // Global pagination's visibility in non-grouped mode is set below.
  }

  if (!groupField) {
    // -------- Flat (non-grouped) table or cards --------
    if (groupsContainer) groupsContainer.remove();
    // Cards view: sweep any leftover group-headers / clones from a prior
    // grouped render, otherwise they'd stack with the flat list.
    if (!isTable) {
      view.querySelectorAll('[data-group-header]').forEach((el) => el.remove());
      view.querySelectorAll('[data-group-clone]').forEach((el) => el.remove());
    }
    if (mainWrap) mainWrap.style.display = '';
    if (mainTable) (mainTable as HTMLElement).style.display = '';

    let visibleRows = rows.filter((r) => rowMatchesExcluding(r, state, null));

    if (state.sort && state.dir) {
      const dirMul = state.dir === 'asc' ? 1 : -1;
      visibleRows.sort((a, b) => {
        const va = sortValue(a, state.sort!, cfg);
        const vb = sortValue(b, state.sort!, cfg);
        if (va < vb) return -1 * dirMul;
        if (va > vb) return 1 * dirMul;
        return 0;
      });
    } else {
      // Default order: priority desc (urgent first), then updated desc.
      // priorityOrder is asc-ranked in the vocabulary (low → urgent), so a
      // lower index means lower priority — sort by descending index.
      visibleRows.sort((a, b) => {
        const pa = sortValue(a, 'priority', cfg) as number;
        const pb = sortValue(b, 'priority', cfg) as number;
        if (pa !== pb) return pb - pa;
        const ua = sortValue(a, 'updated', cfg) as string;
        const ub = sortValue(b, 'updated', cfg) as string;
        if (ua < ub) return 1;
        if (ua > ub) return -1;
        return 0;
      });
    }

    rows.forEach((r) => { r.style.display = 'none'; });

    const ps = pageSize();
    const total = visibleRows.length;
    const totalPages = Math.max(1, Math.ceil(total / ps));
    const curPage = Math.min(state.page, totalPages);
    const start = (curPage - 1) * ps;
    const end = start + ps;
    const shown = visibleRows.slice(start, end);

    shown.forEach((r) => {
      r.style.display = '';
      parent.appendChild(r);
    });

    const countEl = document.getElementById('issues-count');
    if (countEl) countEl.textContent = String(total);

    const emptyEl = document.getElementById('issues-empty');
    if (emptyEl) {
      const anyFilter = state.q || state.state !== 'active' || FIELDS.some((f) => state.fields[f].size > 0);
      emptyEl.hidden = !(total === 0 && anyFilter);
    }

    if (globalPagination) globalPagination.hidden = total === 0;
    const rangeEl = document.getElementById('issues-range');
    if (rangeEl) {
      rangeEl.textContent = total === 0 ? '0 of 0' : `${start + 1}–${Math.min(end, total)} of ${total}`;
    }
    const pageNumEl = document.getElementById('issues-page-num');
    if (pageNumEl) pageNumEl.textContent = String(curPage);
    const pageTotalEl = document.getElementById('issues-page-total');
    if (pageTotalEl) pageTotalEl.textContent = String(totalPages);
    const prevBtn = document.getElementById('issues-prev') as HTMLButtonElement | null;
    const nextBtn = document.getElementById('issues-next') as HTMLButtonElement | null;
    if (prevBtn) prevBtn.disabled = curPage <= 1;
    if (nextBtn) nextBtn.disabled = curPage >= totalPages;
  } else {
    // -------- Grouped: N independent mini-boards --------
    resetGroupStateIfNeeded(groupField);

    const order = cfg.groupOrderByField[groupField] || [];
    const buckets = new Map<string, HTMLElement[]>();
    for (const v of order) buckets.set(v, []);
    const unknown: HTMLElement[] = [];
    for (const r of rows) {
      if (!rowMatchesGlobal(r, state)) continue;
      // Multi-valued fields (e.g. component) put the row into EVERY matching
      // bucket. Unknown values fall through to a trailing "—" bucket.
      const vals = rowValues(r, groupField);
      if (vals.length === 0) {
        unknown.push(r);
        continue;
      }
      let placed = false;
      for (const v of vals) {
        if (buckets.has(v)) {
          buckets.get(v)!.push(r);
          placed = true;
        }
      }
      if (!placed) unknown.push(r);
    }
    const sections: Array<[string, HTMLElement[]]> = [];
    for (const v of order) {
      const rs = buckets.get(v)!;
      if (rs.length) sections.push([v, rs]);
    }
    if (unknown.length) sections.push(['—', unknown]);

    if (isTable) {
      if (mainWrap) mainWrap.style.display = 'none';
      let container = groupsContainer;
      if (!container) {
        container = document.createElement('div');
        container.className = 'issues-table__groups';
        view.appendChild(container);
      }
      container.innerHTML = '';

      if (mainTable) {
        const ps = pageSize();
        for (const [value, groupRows] of sections) {
          const section = buildGroupSection(value, groupRows, state, cfg, mainTable as HTMLElement, ps);
          container.appendChild(section);
        }
      }

      const countEl = document.getElementById('issues-count');
      const totalShown = sections.reduce((acc, [, rs]) => acc + rs.length, 0);
      if (countEl) countEl.textContent = String(totalShown);
    } else {
      // Cards view — simple section banners over each group's rows.
      // Originals stay hidden (display:none from above); each placement is a
      // clone marked with data-group-clone so a row can appear in multiple
      // groups (multi-valued component) without DOM-move conflicts.
      parent.querySelectorAll('[data-group-header]').forEach((el) => el.remove());
      parent.querySelectorAll('[data-group-clone]').forEach((el) => el.remove());
      sections.forEach(([label, groupRows], idx) => {
        const firstClass = idx === 0 ? ' is-first' : '';
        const header = document.createElement('div');
        header.setAttribute('data-group-header', '');
        header.className = `issues-cards__group-header${firstClass}`;
        header.innerHTML = `
          <span class="issues-cards__group-title">${label}</span>
          <span class="issues-cards__group-count">${groupRows.length}</span>`;
        parent.appendChild(header);
        groupRows.forEach((r) => {
          const clone = r.cloneNode(true) as HTMLElement;
          clone.removeAttribute('id');
          clone.style.display = '';
          clone.setAttribute('data-group-clone', '');
          parent.appendChild(clone);
        });
      });
    }
  }

  // ===== chrome that always renders =====

  document.querySelectorAll<HTMLElement>('[data-sort-icon]').forEach((el) => {
    const field = el.dataset.sortIcon!;
    if (state.sort === field && state.dir) {
      el.textContent = state.dir === 'asc' ? '↑' : '↓';
      el.classList.add('is-active');
    } else {
      el.textContent = '⇅';
      el.classList.remove('is-active');
    }
  });

  renderActiveTags(state, cfg, toggleFieldValue);
  renderAddMenus(state, rows);
  renderStateTabs(state, rows);

  const searchEl = document.getElementById('issues-search') as HTMLInputElement | null;
  if (searchEl && searchEl.value !== state.q) searchEl.value = state.q;
  const psSel = document.getElementById('issues-page-size') as HTMLSelectElement | null;
  if (psSel && psSel.value !== String(pageSize())) psSel.value = String(pageSize());

  // Group-by dropdown sync
  const gWrap = document.getElementById('issues-groupby-wrap');
  const gValue = document.getElementById('issues-groupby-value');
  const groupActive = !!(state.group && cfg.groupDimensions.includes(state.group));
  gWrap?.classList.toggle('is-active', groupActive);
  if (gValue) gValue.textContent = groupActive ? state.group! : 'None';
  document.querySelectorAll<HTMLElement>('[data-group-option]').forEach((opt) => {
    opt.classList.toggle('is-selected', (opt.dataset.groupOption || '') === (state.group || ''));
  });

  // Active preset highlight
  document.querySelectorAll<HTMLElement>('[data-preset-index]').forEach((btn) => {
    const idx = parseInt(btn.dataset.presetIndex || '-1', 10);
    const preset = cfg.presets[idx];
    const active = !!preset && presetMatchesState(preset, state);
    btn.classList.toggle('is-active', active);
  });

  renderCompactChips(state, cfg);
}

// ================= mutators =================

let _cfg: Config = {
  priorityOrder: [], statusOrder: [], colorsByField: {},
  groupDimensions: [], groupOrderByField: {}, presets: [],
};

function toggleFieldValue(field: string, value: string) {
  const state = readState();
  const set = state.fields[field];
  if (set.has(value)) set.delete(value);
  else set.add(value);
  state.page = 1;
  writeState(state);
  apply(_cfg);
}

function clearField(field: string) {
  const state = readState();
  state.fields[field] = new Set();
  state.page = 1;
  writeState(state);
  apply(_cfg);
}

function toggleSort(field: string) {
  const state = readState();
  if (state.sort !== field) {
    state.sort = field;
    state.dir = 'asc';
  } else if (state.dir === 'asc') {
    state.dir = 'desc';
  } else {
    state.sort = null;
    state.dir = null;
  }
  state.page = 1;
  writeState(state);
  apply(_cfg);
}

function setView(mode: ViewMode) {
  document.querySelectorAll<HTMLElement>('.issues-view').forEach((v) => {
    v.classList.toggle('is-active', v.id === `view-${mode}`);
  });
  document.querySelectorAll<HTMLElement>('.issues-view-toggle__btn').forEach((b) => {
    const active = b.dataset.view === mode;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  try { localStorage.setItem(VIEW_KEY, mode); } catch {}
  apply(_cfg);
}

function applyPreset(preset: import('./issues-types').PresetView) {
  const currentState = readState();
  const params = presetToParams(preset, currentState.state);
  const qs = params.toString();
  history.replaceState(null, '', qs ? `${location.pathname}?${qs}` : location.pathname);
  apply(_cfg);
  saveFilterCache(readState());
}

function closeAllAddMenus() {
  document.querySelectorAll('.issues-filters__add.is-open').forEach((el) => {
    el.classList.remove('is-open');
  });
}

// ================= init =================

export function initIssuesIndex() {
  _cfg = readConfig();

  // Subtask 10: restore cached filters when URL has no query params.
  if (!location.search) {
    const cached = loadFilterCache();
    if (cached) {
      const qs = cached.toString();
      if (qs) history.replaceState(null, '', `${location.pathname}?${qs}`);
    }
  }

  // Add-filter dropdowns
  document.querySelectorAll<HTMLElement>('[data-add-toggle]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const field = btn.dataset.addToggle!;
      const wrap = document.querySelector<HTMLElement>(`[data-add-wrap="${field}"]`);
      if (!wrap) return;
      const wasOpen = wrap.classList.contains('is-open');
      closeAllAddMenus();
      if (!wasOpen) wrap.classList.add('is-open');
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-add-value]').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      if (opt.disabled) return;
      toggleFieldValue(opt.dataset.addField!, opt.dataset.addValue!);
    });
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.issues-filters__add')) closeAllAddMenus();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllAddMenus();
  });

  // Per-field clear
  document.querySelectorAll<HTMLElement>('[data-clear-field]').forEach((btn) => {
    btn.addEventListener('click', () => clearField(btn.dataset.clearField!));
  });

  // Sort — delegated so dynamically-inserted group-table theads also work.
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-sort]');
    if (btn && btn.closest('.issues-table')) toggleSort(btn.dataset.sort!);
  });

  // Search (debounced)
  const searchInput = document.getElementById('issues-search') as HTMLInputElement | null;
  if (searchInput) {
    let t: number | undefined;
    searchInput.addEventListener('input', () => {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const state = readState();
        state.q = searchInput.value;
        state.page = 1;
        writeState(state);
        apply(_cfg);
      }, 80);
    });
  }

  // View toggle
  document.querySelectorAll<HTMLElement>('.issues-view-toggle__btn').forEach((btn) => {
    btn.addEventListener('click', () => setView(btn.dataset.view as ViewMode));
  });

  // State-tab delegation — handles BOTH the global strip and cloned
  // per-group strips. Status is a single global value (`state.state`), so
  // clicks in either place run the SAME update path: persist to the URL
  // + localStorage, reset every group's page cursor (the visible-row count
  // just changed), and re-render. After re-render every cloned strip in
  // every group section reflects the new value.
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-state-tab]');
    if (!btn) return;
    const tab = btn.dataset.stateTab as StateTab;
    const state = readState();
    if (state.state === tab) return;
    state.state = tab;
    state.page = 1;
    writeState(state);
    resetAllGroupPages();
    apply(_cfg);
  });

  // Per-group pagination (prev/next/size) — delegated.
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const section = target.closest<HTMLElement>('[data-group-value]');
    if (!section) return;
    const sub = getGroupSub(section.dataset.groupValue!);
    if (target.closest('[data-group-prev]')) {
      sub.page = Math.max(1, sub.page - 1);
      apply(_cfg);
    } else if (target.closest('[data-group-next]')) {
      sub.page += 1;
      apply(_cfg);
    }
  });
  document.addEventListener('change', (e) => {
    const sel = (e.target as HTMLElement).closest<HTMLSelectElement>('[data-group-size]');
    if (!sel) return;
    const n = parseInt(sel.value, 10);
    try { localStorage.setItem(PAGESIZE_KEY, String(n)); } catch {}
    resetAllGroupPages();
    apply(_cfg);
  });

  // Row click → navigate (delegated, covers both main + cloned rows).
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, input, button, label')) return;
    const row = target.closest<HTMLElement>('.issues-table__row');
    if (!row) return;
    const href = row.dataset.href;
    if (href) location.href = href;
  });

  // Global pagination controls
  document.getElementById('issues-prev')?.addEventListener('click', () => {
    const s = readState(); s.page = Math.max(1, s.page - 1); writeState(s); apply(_cfg);
  });
  document.getElementById('issues-next')?.addEventListener('click', () => {
    const s = readState(); s.page = s.page + 1; writeState(s); apply(_cfg);
  });
  document.getElementById('issues-page-size')?.addEventListener('change', (e) => {
    const n = parseInt((e.target as HTMLSelectElement).value, 10);
    try { localStorage.setItem(PAGESIZE_KEY, String(n)); } catch {}
    const s = readState(); s.page = 1; writeState(s); apply(_cfg);
  });

  // Clear all
  const clearAll = (ev?: Event) => {
    ev?.preventDefault();
    history.replaceState(null, '', location.pathname);
    try { localStorage.removeItem(FILTER_CACHE_KEY); } catch {}
    if (searchInput) searchInput.value = '';
    apply(_cfg);
  };
  document.getElementById('issues-clear')?.addEventListener('click', clearAll);
  document.getElementById('issues-reset')?.addEventListener('click', clearAll);

  // Group-by custom dropdown
  const groupWrap = document.getElementById('issues-groupby-wrap');
  const groupBtn = document.getElementById('issues-groupby-btn');
  groupBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = groupWrap?.classList.toggle('is-open');
    groupBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll<HTMLElement>('[data-group-option]').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = opt.dataset.groupOption || '';
      const s = readState();
      s.group = val || null;
      s.page = 1;
      writeState(s);
      groupWrap?.classList.remove('is-open');
      groupBtn?.setAttribute('aria-expanded', 'false');
      apply(_cfg);
    });
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('#issues-groupby-wrap')) {
      groupWrap?.classList.remove('is-open');
      groupBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  // Preset buttons
  document.querySelectorAll<HTMLElement>('[data-preset-index]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.presetIndex || '-1', 10);
      const preset = _cfg.presets[idx];
      if (preset) applyPreset(preset);
    });
  });

  // Compact-mode toggle (persisted per-tracker in localStorage)
  const filterBar = document.getElementById('issues-filters');
  const compactBtn = document.getElementById('issues-compact-toggle');
  const applyCompact = (compact: boolean) => {
    filterBar?.classList.toggle('is-compact', compact);
    compactBtn?.setAttribute('aria-expanded', compact ? 'false' : 'true');
  };
  let compactStart = false;
  try { compactStart = localStorage.getItem(COMPACT_MODE_KEY) === '1'; } catch {}
  applyCompact(compactStart);
  compactBtn?.addEventListener('click', () => {
    const next = !filterBar?.classList.contains('is-compact');
    applyCompact(next);
    try { localStorage.setItem(COMPACT_MODE_KEY, next ? '1' : '0'); } catch {}
  });

  // Restore view preference (default: table)
  let savedView: ViewMode = 'table';
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'table' || v === 'cards') savedView = v;
  } catch {}
  setView(savedView);
}
