/**
 * Shared types for the issues index client runtime.
 * Split out so filters/groups/presets modules can import them without
 * reaching into client.ts.
 */
import { TERMINAL_STATUSES } from '@loaders/issue-status';

/** The list filter tabs are the four lifecycle CATEGORIES, plus a default
 *  "active" meta-tab (everything not Closed — preserves the old "closed hidden
 *  by default" UX) and "all". The individual status shows as the row badge. */
export type StateTab = 'active' | 'in-progress' | 'review' | 'not-started' | 'closed' | 'all';

export type ViewMode = 'cards' | 'table';

export type FilterState = {
  q: string;
  fields: Record<string, Set<string>>;
  sort: string | null;
  dir: 'asc' | 'desc' | null;
  page: number;
  state: StateTab;
  /** Group-by dimension (component | priority) or null */
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

export const FIELDS = ['priority', 'component', 'labels', 'assignees'] as const;
/** Fields that hold multiple values per row — encoded in the dataset as
 *  space-joined strings and split back to arrays in filter / group code. */
export const MULTI_FIELDS = new Set<string>(['labels', 'component', 'assignees']);

/**
 * Group-by dimensions that are DERIVED rather than declared.
 *
 * Every other dimension groups by a value the tracker's vocabulary lists, so
 * the sections have a declared order. These two have neither: `created` comes
 * from the issue's folder slug and `updated` from git history, so nothing
 * declares them and there is no fixed list of values to order.
 *
 * They also cannot group on their raw value. A date is unique per issue, so
 * grouping on it would produce one section per row — a list with extra
 * headings. They bucket into three tiers instead — **Today**, **Past week**
 * (1–7 days back), then **by calendar month** — ordered newest-first, which is
 * the tracker's own default reading order.
 *
 * The first two tiers are relative to the reader's clock, so the bucketing runs
 * in the BROWSER and never at build time. A "Today" heading rendered into
 * static HTML is right on the day it was built and silently wrong afterwards.
 * See `filters.ts → dateBucket`, which takes `now` as an argument to make that
 * impossible to get wrong by accident.
 */
export const DATE_GROUP_FIELDS = new Set<string>(['created', 'updated']);

/** Menu text for a group-by dimension. Anything absent falls back to the
 *  field name (CSS capitalizes it), which is right for vocabulary fields —
 *  "component" and "priority" are already the words a reader wants. */
export const GROUP_LABELS: Record<string, string> = {
  created: 'Date created',
  updated: 'Date updated',
};

export const groupLabel = (field: string): string => GROUP_LABELS[field] ?? field;
/** Statuses in the terminal (Closed) category — derived from the single
 *  framework vocabulary so it never drifts from the loader. */
export const CLOSED_STATUSES = new Set<string>(TERMINAL_STATUSES);

/** Per-field pseudo-values that don't appear in the row's dataset but stand
 *  for a derived condition. Currently only `assignees` uses these:
 *    `assigned`   → match when the row's assignees list is non-empty
 *    `unassigned` → match when the row's assignees list is empty
 *  Any other selected value still falls through to literal-name matching.
 *  Used by `rowMatchesExcluding` / `rowMatchesGlobal`. */
export const PSEUDO_VALUES: Record<string, Set<string>> = {
  assignees: new Set(['assigned', 'unassigned']),
};
