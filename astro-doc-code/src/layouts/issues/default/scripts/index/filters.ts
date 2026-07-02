/**
 * Pure row-matching + sort helpers. No DOM state outside row data
 * attributes; all context flows in via arguments.
 */
import { CLOSED_STATUSES, FIELDS, MULTI_FIELDS, PSEUDO_VALUES } from './types';
import type { Config, FilterState, StateTab } from './types';
import { categoryOf, isValidStatus } from '@loaders/issue-status';

/** Category a row's status rolls up to (`''` when the status is unknown). */
function rowCategory(row: HTMLElement): string {
  const status = row.dataset.status || '';
  return isValidStatus(status) ? categoryOf(status) : '';
}

/**
 * OR-match a row's values for one field against the user's selected set,
 * with per-field pseudo-value support. Pseudo + literal values OR together
 * so e.g. `assignees=assigned,sid` reads as "anything in flight, plus
 * anything sid touches even if it would also match unassigned." Mirrors
 * the script-side logic in `list.mjs --assignee`.
 */
function rowFieldMatches(row: HTMLElement, field: string, selected: Set<string>): boolean {
  if (selected.size === 0) return true;
  const vals = rowValues(row, field);
  const pseudos = PSEUDO_VALUES[field];
  if (pseudos) {
    if (selected.has('unassigned') && vals.length === 0) return true;
    if (selected.has('assigned') && vals.length > 0) return true;
    // Strip pseudos from the literal-match set so "unassigned" never matches a
    // real author named "unassigned" (unlikely, but the asymmetry would surprise).
    const literalMatch = vals.some((v) => selected.has(v) && !pseudos.has(v));
    if (literalMatch) return true;
    return false;
  }
  return vals.some((v) => selected.has(v));
}

export function needsReview(row: HTMLElement): boolean {
  const cat = rowCategory(row);
  // The issue's own status is in the Review category (review | input-needed)…
  if (cat === 'review') return true;
  // …or it's still active (not closed) and carries a review-debt subtask.
  if (cat === 'closed') return false;
  return row.dataset.hasReviewSubtask === '1';
}

export function rowMatchesStateTab(row: HTMLElement, tab: StateTab): boolean {
  if (tab === 'all') return true;
  const cat = rowCategory(row);
  // Active = everything not in the Closed category (the default view).
  if (tab === 'active') return cat !== 'closed';
  // Review covers the Review category AND active issues with a review-debt subtask.
  if (tab === 'review') return needsReview(row);
  // Closed is never promoted elsewhere; the active categories yield their
  // review-debt rows to the Review tab so an item shows under exactly one tab.
  if (tab === 'closed') return cat === 'closed';
  return cat === tab && !needsReview(row);
}

/** Read a row's values for a field. Multi-valued fields (labels, component)
 * are space-joined in the dataset and split here. Single-valued fields
 * return a one-element array (or empty). */
export function rowValues(row: HTMLElement, field: string): string[] {
  if (MULTI_FIELDS.has(field)) {
    return (row.dataset[field as keyof DOMStringMap] as string || '').split(' ').filter(Boolean);
  }
  const v = row.dataset[field as keyof DOMStringMap] as string | undefined;
  return v ? [v] : [];
}

/** Global filters only — search + field chips. Used by the grouped view
 * where each group has its own independent state tab. */
export function rowMatchesGlobal(row: HTMLElement, state: FilterState): boolean {
  if (state.q) {
    const blob = row.dataset.search || '';
    if (!blob.includes(state.q.toLowerCase())) return false;
  }
  for (const f of FIELDS) {
    if (!rowFieldMatches(row, f, state.fields[f])) return false;
  }
  return true;
}

/** Full filter: state tab + search + chips, optionally excluding one field
 * (used when counting what each filter value would yield). */
export function rowMatchesExcluding(
  row: HTMLElement,
  state: FilterState,
  excludeField: string | null,
): boolean {
  if (!rowMatchesStateTab(row, state.state)) return false;
  if (state.q) {
    const blob = row.dataset.search || '';
    if (!blob.includes(state.q.toLowerCase())) return false;
  }
  for (const f of FIELDS) {
    if (f === excludeField) continue;
    if (!rowFieldMatches(row, f, state.fields[f])) return false;
  }
  return true;
}

export function sortValue(row: HTMLElement, field: string, cfg: Config): number | string {
  const ds = row.dataset;
  switch (field) {
    case 'priority': {
      const idx = cfg.priorityOrder.indexOf(ds.priority || '');
      return idx === -1 ? 999 : idx;
    }
    case 'status': {
      const idx = cfg.statusOrder.indexOf(ds.status || '');
      return idx === -1 ? 999 : idx;
    }
    case 'title':     return (ds.title || '').toLowerCase();
    // For multi-valued component, sort by the first value alphabetically —
    // good enough for column-sort ordering; group-by remains the proper view
    // when an issue spans several components.
    case 'component': return (ds.component || '').split(' ').filter(Boolean)[0] || '';
    // Sort by first assignee alphabetically; unassigned issues sink to the
    // bottom in ascending order (and rise to the top in descending) — the
    // "~" suffix exploits ASCII ordering without needing a special-case.
    case 'assignees': {
      const first = (ds.assignees || '').split(' ').filter(Boolean)[0];
      return first ? first.toLowerCase() : '~';
    }
    case 'created':   return ds.created || '';
    case 'updated':   return ds.updated || '';
    default:          return '';
  }
}
