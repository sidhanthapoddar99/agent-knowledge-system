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

/** One-line meaning per status — the fixed vocabulary's built-in legend, shared
 *  by the tracker Guide modal (and available to `guide.ts`) so the glosses are
 *  declared once alongside the statuses they describe. */
export const STATUS_DESCRIPTIONS: Record<IssueStatus, string> = {
  open: 'Untouched — no work started yet.',
  blocked: 'Waiting on another issue or subtask; the reason is in prose.',
  'in-progress': 'Actively being worked. Agents set this automatically when they pick an item up.',
  'input-needed': 'An agent hit a wall and needs a human answer — the question is written inline in the item.',
  review: 'Work is done and awaiting human sign-off.',
  done: 'Shipped. Human-only — an agent never sets this.',
  dropped: 'Deliberately abandoned. Human-only, and needs a comment saying why.',
};

/** One-line meaning per category, in the same UI order as {@link CATEGORIES}. */
export const CATEGORY_DESCRIPTIONS: Record<CategoryId, string> = {
  'in-progress': 'Actively moving.',
  review: 'Needs a human — either an answer or a sign-off.',
  'not-started': 'Not begun yet.',
  closed: 'Finished — shipped or abandoned.',
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

/** Message when a tracker still declares `fields.status` in its root settings.
 *  The status axis is code-fixed; the only permitted per-tracker customization
 *  is colours, which live under a top-level `statusColors` map. A stray
 *  `values` list under `fields.status` reads as authoritative and would
 *  eventually be consumed as the vocabulary — so we reject it loudly instead of
 *  ignoring it. */
export function statusFieldForbiddenMessage(fileHint: string): string {
  return [
    `[issues] "${fileHint}" declares \`fields.status\`, but statuses are fixed by the`,
    `framework and cannot be defined per-tracker. A \`values\` list here reads as`,
    `authoritative and will eventually be consumed as the vocabulary — which is wrong.`,
    `Fix: delete the entire \`fields.status\` block. To override colours, add a`,
    `top-level \`statusColors\` map instead — e.g. { "statusColors": { "review": "#f0c674" } }.`,
    `Keys must be a subset of: ${STATUSES.join(' | ')}.`,
    `See the migration script migration/2026-07-03_root-settings-schema.py for the exact rewrite.`,
  ].join('\n');
}

/** Message when a `statusColors` override names a status outside the fixed set —
 *  a colour for a status that doesn't exist is a typo, not an override. */
export function unknownStatusColorMessage(key: string, fileHint: string): string {
  return [
    `[issues] "${fileHint}" sets a colour for unknown status "${key}" under \`statusColors\`.`,
    `A colour for a status that doesn't exist is a typo, not an override.`,
    `Valid statuses: ${STATUSES.join(' | ')}.`,
  ].join('\n');
}

/**
 * Validate and merge per-tracker status-colour overrides onto the fixed
 * defaults. Throws {@link unknownStatusColorMessage} on a key outside the
 * vocabulary. Returns the resolved seven-colour map every status surface reads.
 */
export function resolveStatusColors(
  overrides: Record<string, string> | undefined,
  fileHint: string,
): Record<IssueStatus, string> {
  const resolved: Record<string, string> = { ...DEFAULT_STATUS_COLORS };
  if (overrides && typeof overrides === 'object') {
    for (const [key, value] of Object.entries(overrides)) {
      if (!STATUS_SET.has(key)) throw new Error(unknownStatusColorMessage(key, fileHint));
      if (typeof value === 'string' && value) resolved[key] = value;
    }
  }
  return resolved as Record<IssueStatus, string>;
}
