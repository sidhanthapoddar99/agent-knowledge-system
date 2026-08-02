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
 * the `agent-ks` CLI — consumes THIS module so the vocabulary is declared
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

/**
 * The statuses that mean something for a RUN — an agent-log folder. A strict
 * subset of {@link STATUSES}: one vocabulary and one palette, fewer values,
 * never a second set of words.
 *
 * `blocked` and `review` are excluded because both describe a work item rather
 * than a run: a run does not wait on another run, and runs are not signed off —
 * the subtask is. A run's `status` answers **did the agent finish**, not *was
 * the news good*, which is why a completed audit that found five defects is
 * `done`.
 *
 * Exported so the guide legend and the validator read one list. The same five
 * are currently hand-written in `check.mjs` and in five places of skill prose;
 * this is the definition they should collapse onto.
 */
export const RUN_STATUSES = ['open', 'in-progress', 'input-needed', 'done', 'dropped'] as const;

export type RunStatus = (typeof RUN_STATUSES)[number];

/**
 * The CSS custom property carrying a status's colour — `--status-open`,
 * `--status-in-progress`, and so on, one per value in {@link STATUSES}.
 *
 * The token name is derived from the status, so there is nothing to keep in
 * sync: a status with no variable is a missing theme token, never a silent
 * fallback to some other status's colour.
 */
export function statusVar(status: IssueStatus | string): string {
  return `var(--status-${status})`;
}

/**
 * The status→colour map every status surface reads. Values are CSS variable
 * references, not hexes.
 *
 * **Colours are theme-owned and live in `styles/color.css`; they are not
 * configurable per tracker.** This was previously a map of literal hexes that a
 * tracker could override under a top-level `statusColors` key. Two things were
 * wrong with that:
 *
 * 1. **One value had to serve both colour modes.** The shipped hexes were
 *    dark-mode colours rendered unchanged on a light background, and JSON had
 *    nowhere to put a second value. CSS has `[data-theme="dark"]`.
 * 2. **A second copy of the palette drifted.** The bundled Guide hand-wrote its
 *    own tint map and disagreed with this one on two statuses.
 *
 * What deliberately did NOT change: the map is still resolved once and passed
 * down as a prop. Threading it is mildly redundant now that the values are
 * variables any stylesheet could reach — but unpicking that touches eleven
 * components to no visible end, so it stays until something else needs them
 * opened. The colours being theme-owned is the part that mattered.
 */
export const STATUS_CSS_VARS: Record<IssueStatus, string> = Object.fromEntries(
  STATUSES.map((s) => [s, statusVar(s)]),
) as Record<IssueStatus, string>;

/** Legacy → canonical value map. The lifecycle field was previously the
 *  four-state `open | review | closed | cancelled`; `closed`→`done` and
 *  `cancelled`→`dropped` are the renames. Used by the loader to tolerate
 *  un-migrated data (with a warning) and by the migration script's mirror. */
export const LEGACY_STATUS_MAP: Record<string, IssueStatus> = {
  closed: 'done',
  cancelled: 'dropped',
};

/** Human display label per status — used by badges and status-icon tooltips. */
export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  blocked: 'Blocked',
  'in-progress': 'In Progress',
  'input-needed': 'Input Needed',
  review: 'Review',
  done: 'Done',
  dropped: 'Dropped',
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
    `(migration/0.1.1_state-to-status.py).`,
  ].join('\n');
}

/** Message when a tracker still declares `fields.status` in its root settings.
 *  The status axis is code-fixed and nothing about it is per-tracker — not the
 *  values, and since colours moved to CSS, not those either. A stray `values`
 *  list reads as authoritative and would eventually be consumed as the
 *  vocabulary, so we reject it loudly instead of ignoring it. */
export function statusFieldForbiddenMessage(fileHint: string): string {
  return [
    `[issues] "${fileHint}" declares \`fields.status\`, but statuses are fixed by the`,
    `framework and cannot be defined per-tracker. A \`values\` list here reads as`,
    `authoritative and will eventually be consumed as the vocabulary — which is wrong.`,
    `Fix: delete the entire \`fields.status\` block. Colours are no longer configurable`,
    `here either — they are theme CSS variables (\`--status-<name>\`) in color.css.`,
    `Valid statuses: ${STATUSES.join(' | ')}.`,
    `See the migration script`,
    `(migration/0.1.2_root-settings-schema.py)`,
    `for the exact rewrite.`,
  ].join('\n');
}

/**
 * Message when a tracker still carries a top-level `statusColors` map.
 *
 * Colours moved out of settings and into theme CSS (`--status-<name>` in
 * `color.css`). A leftover map is rejected rather than ignored, for the same
 * reason `fields.status` is: an override that silently stops applying is worse
 * than a build that says why. The colours it declares are almost certainly the
 * defaults it was copied from, so deleting the block is usually the whole fix.
 */
export function statusColorsForbiddenMessage(fileHint: string): string {
  return [
    `[issues] "${fileHint}" declares a top-level \`statusColors\` map, but status`,
    `colours are no longer configurable per tracker — they are theme CSS variables.`,
    `Fix: delete the \`statusColors\` block. To restyle the lifecycle, override the`,
    `\`--status-<name>\` variables in your theme's color.css — e.g.`,
    `[data-theme="dark"] { --status-dropped: #ef4444; }`,
    `One per status: ${STATUSES.map((s) => `--status-${s}`).join(' | ')}.`,
    `CSS also lets light and dark differ, which the JSON map could not express.`,
    `See migration/0.1.3_status-colors-to-css.py for the exact rewrite.`,
  ].join('\n');
}
