/**
 * Issue lifecycle vocabulary — THE single source of truth.
 *
 * Decided 2026-07-02 (see the tracker issue
 * `2026-07-02-issue-lifecycle-and-creation-rules`, note
 * `notes/01_lifecycle-vocabulary.md`). Both the status set and the category
 * grouping are **fixed in framework code** — users cannot add statuses or
 * categories. The only permitted per-tracker customization is a colour
 * override in the root `settings.json` (`fields.status.colors`).
 *
 * Everything that needs to know about lifecycle vocabulary — the loader, the
 * layouts, the `guide.ts` panel, and (by mirrored copy, since it is `.mjs`)
 * the `docs-guide` CLI — consumes THIS module so the vocabulary is declared
 * exactly once on the framework side. Issues and subtasks share it: same seven
 * statuses, same field name (`status`), same validation.
 */

/** The seven canonical statuses. Order is the natural lifecycle progression. */
export const STATUSES = [
  'open',
  'blocked',
  'in-progress',
  'input-needed',
  'review',
  'done',
  'dropped',
] as const;

export type IssueStatus = (typeof STATUSES)[number];

/** The four categories, in UI display order (In Progress · Review · Not
 *  Started · Closed — Review highlighted). Each maps to its member statuses. */
export const CATEGORIES = [
  { id: 'in-progress', label: 'In Progress', statuses: ['in-progress'] },
  { id: 'review', label: 'Review', statuses: ['input-needed', 'review'] },
  { id: 'not-started', label: 'Not Started', statuses: ['open', 'blocked'] },
  { id: 'closed', label: 'Closed', statuses: ['done', 'dropped'] },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

/** Default colours (a tracker may override any of these in
 *  `settings.json → fields.status.colors`). Three are inherited unchanged from
 *  the old four-state palette (open/review/done≈closed) so existing trackers
 *  see minimal visual churn. */
export const DEFAULT_STATUS_COLORS: Record<IssueStatus, string> = {
  open: '#888888',
  blocked: '#d1854f',
  'in-progress': '#61afef',
  'input-needed': '#e8a54b',
  review: '#f0c674',
  done: '#7ec699',
  dropped: '#c678dd',
};

/** Legacy → canonical value map. The lifecycle field was previously the
 *  four-state `open | review | closed | cancelled`; `closed`→`done` and
 *  `cancelled`→`dropped` are the renames. Used by the loader to tolerate
 *  un-migrated data (with a warning) and by the migration script's mirror. */
export const LEGACY_STATUS_MAP: Record<string, IssueStatus> = {
  closed: 'done',
  cancelled: 'dropped',
};

const STATUS_SET = new Set<string>(STATUSES);
const STATUS_TO_CATEGORY = new Map<IssueStatus, CategoryId>();
for (const cat of CATEGORIES) {
  for (const s of cat.statuses) STATUS_TO_CATEGORY.set(s as IssueStatus, cat.id);
}

/** Statuses in the terminal (Closed) category — replaces the old TERMINAL list. */
export const TERMINAL_STATUSES: readonly IssueStatus[] = CATEGORIES.find(
  (c) => c.id === 'closed',
)!.statuses as readonly IssueStatus[];

/** Statuses in the Review category — the review-debt / needs-a-human bucket. */
export const REVIEW_STATUSES: readonly IssueStatus[] = CATEGORIES.find(
  (c) => c.id === 'review',
)!.statuses as readonly IssueStatus[];

export function isValidStatus(v: unknown): v is IssueStatus {
  return typeof v === 'string' && STATUS_SET.has(v);
}

export function categoryOf(status: IssueStatus): CategoryId {
  return STATUS_TO_CATEGORY.get(status)!;
}

export function isTerminalStatus(status: IssueStatus): boolean {
  return categoryOf(status) === 'closed';
}

/**
 * Normalise a raw lifecycle value read from disk into a canonical status.
 * Returns `{ status, legacy }` where `legacy` flags that a rename was applied
 * (caller may warn / nudge to migrate). Returns `null` when the value is
 * neither canonical nor a known legacy value — the caller then raises the hard
 * "unknown status" error. `undefined`/empty is treated as the default `open`.
 */
export function normalizeStatus(
  raw: unknown,
): { status: IssueStatus; legacy: boolean } | null {
  if (raw == null || raw === '') return { status: 'open', legacy: false };
  if (typeof raw !== 'string') return null;
  if (STATUS_SET.has(raw)) return { status: raw as IssueStatus, legacy: false };
  const mapped = LEGACY_STATUS_MAP[raw];
  if (mapped) return { status: mapped, legacy: true };
  return null;
}

/** The detailed, copy-pasteable message shown when a file carries a status
 *  outside the fixed vocabulary. Names the offender and the legal set so it can
 *  be handed straight to an agent (or a human) to fix. */
export function unknownStatusMessage(rawValue: string, fileHint: string): string {
  return [
    `[issues] Invalid lifecycle status "${rawValue}" in ${fileHint}.`,
    `Statuses are fixed by the framework and cannot be invented per-tracker.`,
    `Allowed values: ${STATUSES.join(' | ')}.`,
    `Legacy values are auto-mapped (closed→done, cancelled→dropped) — if you see`,
    `this for a legacy value, run the state→status migration script`,
    `(plugins/documentation-guide/.../migration/2026-07-02_state-to-status.py).`,
  ].join('\n');
}
