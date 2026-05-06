/**
 * Shared types for the issues index client runtime.
 * Split out so filters/groups/presets modules can import them without
 * reaching into client.ts.
 */

export type StateTab = 'open' | 'review' | 'closed' | 'cancelled' | 'all';

export type ViewMode = 'cards' | 'table';

export type FilterState = {
  q: string;
  fields: Record<string, Set<string>>;
  sort: string | null;
  dir: 'asc' | 'desc' | null;
  page: number;
  state: StateTab;
  /** Group-by dimension (component | milestone | priority) or null */
  group: string | null;
};

export interface PresetView {
  name: string;
  filters?: Record<string, string[]>;
  /** DEPRECATED / IGNORED — views cannot pin status tabs. Warn if present. */
  state?: string;
  group?: string;
  search?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}

export interface Config {
  priorityOrder: string[];
  statusOrder: string[];
  colorsByField: Record<string, Record<string, string>>;
  groupDimensions: string[];
  groupOrderByField: Record<string, string[]>;
  presets: PresetView[];
}

/** Per-group UI state that's genuinely scoped to a single group section.
 *  Status is NOT here — it's a single global value (`FilterState.state`)
 *  shared across all groups so it can persist via the existing localStorage
 *  cache. See subtask 21 (issues-layout) for the rationale. */
export type GroupSubState = { page: number };

export const FIELDS = ['priority', 'component', 'milestone', 'labels', 'assignees'] as const;
/** Fields that hold multiple values per row — encoded in the dataset as
 *  space-joined strings and split back to arrays in filter / group code. */
export const MULTI_FIELDS = new Set<string>(['labels', 'component', 'assignees']);
export const CLOSED_STATUSES = new Set(['closed', 'cancelled']);

/** Per-field pseudo-values that don't appear in the row's dataset but stand
 *  for a derived condition. Currently only `assignees` uses these:
 *    `assigned`   → match when the row's assignees list is non-empty
 *    `unassigned` → match when the row's assignees list is empty
 *  Any other selected value still falls through to literal-name matching.
 *  Used by `rowMatchesExcluding` / `rowMatchesGlobal`. */
export const PSEUDO_VALUES: Record<string, Set<string>> = {
  assignees: new Set(['assigned', 'unassigned']),
};
