/**
 * Small server-side utilities shared across the detail-page components.
 * Kept here so the .astro files stay focused on templating.
 */
import type {
  Issue, IssueAgentLog, IssueNote, IssueSubtask, IssueStatus,
  IssuePlan, IssuePlanStage, IssueSection,
} from '@loaders/issues';
import {
  TERMINAL_STATUSES, isTerminalStatus, categoryOf,
  sectionById, sectionPanelKey,
} from '@loaders/issues';
import { extractAndPrefixToc, type TocEntry } from './toc';

export const TERMINAL: readonly IssueStatus[] = TERMINAL_STATUSES;

/** Review-debt: an issue that should surface under the Review tab. True when its
 *  own status is in the Review category, OR it's active (not closed, not already
 *  review) with ≥1 subtask awaiting review. A closed issue never carries debt.
 *  This is THE predicate the Review tab and the review-debt badge both consume,
 *  so the two can never disagree. */
export function needsReview(issue: Issue): boolean {
  const cat = categoryOf(issue.meta.status);
  if (cat === 'review') return true;
  if (cat === 'closed') return false;
  return issue.subtasks.some((s) => s.category === 'review');
}

/** Effective *display* status: the stored status, overridden to `review` when
 *  review-debt promotion pulls an active, non-review issue into the Review tab —
 *  so the badge agrees with the tab it's filed under. Display-only: the stored
 *  status is never mutated (the CLI / `--json` still report it) and reverts on
 *  its own once the review subtask moves on. */
export function effectiveStatus(issue: Issue): IssueStatus {
  const cat = categoryOf(issue.meta.status);
  if (cat !== 'review' && cat !== 'closed' && issue.subtasks.some((s) => s.category === 'review')) {
    return 'review';
  }
  return issue.meta.status;
}

/** Pad a sequence number with a leading zero (`1` → `01`). Null → empty. */
export function pad(n: number | null): string {
  if (n === null) return '';
  return String(n).padStart(2, '0');
}

/** Status-grouped subtask sort: active statuses (anything not in the Closed
 *  category) first, terminal (Closed: done | dropped) after; within each group,
 *  ascending by sequence. Drives the Overview panel, MetaSidebar, the
 *  active/terminal divider, and Comprehensive-doc order. NOT the detail sidebar
 *  tree — that sorts by sequence only (see SubtaskTree.astro). */
export function sortSubtasksByState(subtasks: IssueSubtask[]): IssueSubtask[] {
  return [...subtasks].sort((a, b) => {
    const g = (isTerminalStatus(a.status) ? 1 : 0) - (isTerminalStatus(b.status) ? 1 : 0);
    if (g !== 0) return g;
    const sa = a.sequence ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sequence ?? Number.MAX_SAFE_INTEGER;
    return sa - sb;
  });
}

/** Where the terminal group starts in a sidebar-sorted list; used to insert
 *  the "is-group-start" divider between active and terminal subtasks. */
export function terminalStartIndex(sorted: IssueSubtask[]): number {
  return sorted.findIndex((s) => isTerminalStatus(s.status));
}

/**
 * Format an ISO 8601 timestamp as relative time, with a fall-through to a
 * full date+time string once the gap exceeds a week.
 *
 *   < 1 min   → "n sec ago"
 *   < 1 hour  → "n min ago"
 *   < 1 day   → "n hour(s) ago"
 *   < 7 days  → "n day(s) ago"
 *   ≥ 7 days  → "MMM D, YYYY HH:mm"
 *
 * Returns both the relative string and a full-precision form intended for a
 * `title=` attribute (so the tooltip always shows the precise timestamp).
 * Sub-second / negative deltas (clock skew) clamp to "0 sec ago".
 *
 * Date-only inputs ("YYYY-MM-DD" — happens when an issue's `updated` falls
 * back to its folder-slug `created` because no commit touches the folder
 * yet) are parsed as **local** midnight (not UTC, which would put them in
 * the future for any reader east of GMT before midnight UTC) and displayed
 * as a plain date — "0 sec ago" for a date-only source is misleading.
 */
export function formatRelativeTime(iso: string | null | undefined): { rel: string; full: string } {
  if (!iso) return { rel: '', full: '' };

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  const d = dateOnly ? new Date(iso + 'T00:00:00') : new Date(iso);
  if (Number.isNaN(d.getTime())) return { rel: '', full: '' };

  // Date-only source has no time precision; show the date literally instead
  // of a fake-precise "n sec ago".
  if (dateOnly) {
    const dateLabel = formatDateOnly(d);
    return { rel: dateLabel, full: dateLabel };
  }

  const full = formatFullDateTime(d);
  const diffSec = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));

  if (diffSec < 60) return { rel: `${diffSec} sec ago`, full };
  const min = Math.floor(diffSec / 60);
  if (min < 60) return { rel: `${min} min ago`, full };
  const hr = Math.floor(min / 60);
  if (hr < 24) return { rel: `${hr} ${hr === 1 ? 'hour' : 'hours'} ago`, full };
  const day = Math.floor(hr / 24);
  if (day < 7) return { rel: `${day} ${day === 1 ? 'day' : 'days'} ago`, full };
  return { rel: full, full };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function formatFullDateTime(d: Date): string {
  const yyyy = d.getFullYear();
  const mon = MONTHS[d.getMonth()];
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${mon} ${day}, ${yyyy} ${hh}:${mm}`;
}

function formatDateOnly(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/** Word-count cap past which a Comprehensive-panel item collapses. */
export const COMPREHENSIVE_WORD_CAP = 150;

/** Approximate word count of rendered HTML — strips tags + entities. */
export function wordCount(html: string): number {
  if (!html) return 0;
  const text = html.replace(/<[^>]*>/g, ' ').replace(/&[#a-z0-9]+;/gi, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

/** Stable color palette keyed by author name (used for thread avatars). */
const AVATAR_COLORS = ['#7aa2f7', '#bb9af7', '#f7768e', '#e0af68', '#9ece6a', '#2ac3de', '#ff9e64'];
export function avatarColor(name: string | null | undefined): string {
  if (!name) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** First character of a name, uppercased — avatar fallback when no image. */
export function initial(name: string | null | undefined): string {
  return (name || '?').trim().charAt(0).toUpperCase();
}

// ===== Panel keys =====
// Used only on the overview detail page, where several sub-docs share one DOM;
// sub-doc pages (their own URL) use the path instead. The prefix per section
// comes from the registry, so there is one scheme rather than one copy of it
// per section.

const KEY = (id: string, groupPath: string[], name: string) =>
  sectionPanelKey(sectionById(id)!, groupPath, name);

export function logPanelKey(log: IssueAgentLog): string {
  return KEY('agent-log', log.groupPath, log.name);
}

export function notePanelKey(note: IssueNote): string {
  return KEY('notes', note.groupPath, note.name);
}

export function brainstormPanelKey(doc: IssueNote): string {
  return KEY('brainstorm', doc.groupPath, doc.name);
}

export function agentMemoryPanelKey(doc: IssueNote): string {
  return KEY('agent-memory', doc.groupPath, doc.name);
}

// ===== Sub-doc URL helpers (subtask 17) =====
// Each sub-doc has its own URL so links are shareable / bookmarkable and
// every heading anchor works natively without id-prefixing.

function joinPath(base: string, ...parts: string[]): string {
  const b = base.replace(/\/+$/, '');
  const tail = parts.map((p) => p.replace(/^\/+|\/+$/g, '')).filter(Boolean).join('/');
  return tail ? `${b}/${tail}` : b;
}

export function detailUrl(baseUrl: string, issueId: string): string {
  return joinPath(baseUrl, issueId);
}

/** URL of one entry in a section. The section's URL segment comes from the
 *  registry, so a rename lands in one place instead of eight. */
function sectionUrl(baseUrl: string, issueId: string, id: string, ...rest: string[]): string {
  return joinPath(baseUrl, issueId, sectionById(id)!.id, ...rest);
}

/** URL of one entry, addressed by its section rather than by a per-section
 *  wrapper. The named wrappers below stay for readability at fixed call-sites;
 *  code that iterates the registry (the sidebar tree) uses this, so a new
 *  section links correctly without a fifth wrapper being remembered. */
export function sectionEntryUrl(
  baseUrl: string, issueId: string, section: IssueSection, groupPath: string[], name: string,
): string {
  return joinPath(baseUrl, issueId, section.id, ...groupPath, name);
}

export function subtaskUrl(baseUrl: string, issueId: string, subtask: IssueSubtask): string {
  return sectionUrl(baseUrl, issueId, 'subtasks', ...subtask.groupPath, subtask.slug);
}

export function subtaskPanelKey(subtask: IssueSubtask): string {
  return KEY('subtasks', subtask.groupPath, subtask.slug);
}

export function noteUrl(baseUrl: string, issueId: string, note: IssueNote): string {
  return sectionUrl(baseUrl, issueId, 'notes', ...note.groupPath, note.name);
}

export function brainstormUrl(baseUrl: string, issueId: string, doc: IssueNote): string {
  return sectionUrl(baseUrl, issueId, 'brainstorm', ...doc.groupPath, doc.name);
}

export function agentMemoryUrl(baseUrl: string, issueId: string, doc: IssueNote): string {
  return sectionUrl(baseUrl, issueId, 'agent-memory', ...doc.groupPath, doc.name);
}

export function logUrl(baseUrl: string, issueId: string, log: IssueAgentLog): string {
  return sectionUrl(baseUrl, issueId, 'agent-log', ...log.groupPath, log.name);
}

export function planUrl(baseUrl: string, issueId: string, plan: IssuePlan): string {
  return sectionUrl(baseUrl, issueId, 'plans', plan.name);
}

export function planStageUrl(
  baseUrl: string, issueId: string, plan: IssuePlan, stage: IssuePlanStage,
): string {
  return sectionUrl(baseUrl, issueId, 'plans', plan.name, stage.name);
}

export function planPanelKey(plan: IssuePlan): string {
  return KEY('plans', [], plan.name);
}

/** Panel key for one stage page. Namespaced under its plan so two plans may
 *  carry a stage of the same name without colliding. */
export function planStagePanelKey(plan: IssuePlan, stage: IssuePlanStage): string {
  return KEY('plans', [plan.name], stage.name);
}

// ===== Plans: the derived bits =====
// Everything a plan says about the *work* is resolved here, at render, from the
// live subtask list. That is the whole design: a plan stores no status of its
// own, so it cannot drift from reality — there is no reality stored in it.

/**
 * The ACTIVE plan: the highest-numbered plan whose status is not `done` or
 * `dropped`. Derived, never stored — so there is no field to keep in sync, and
 * it degrades correctly: with two plans open the higher number wins and the
 * convention is *visibly* being broken rather than silently ambiguous.
 *
 * `plans` arrives from the loader already in prefix order.
 */
export function activePlan(plans: IssuePlan[]): IssuePlan | null {
  for (let i = plans.length - 1; i >= 0; i--) {
    if (!isTerminalStatus(plans[i].status)) return plans[i];
  }
  return null;
}

/** Issue-relative path of a subtask — the form `subtasks:` refs resolve to. */
function subtaskRefPath(s: IssueSubtask): string {
  return ['subtasks', ...s.groupPath, `${s.slug}.md`].join('/');
}

/** Issue-relative path of an agent-log entry. */
function logRefPath(l: IssueAgentLog): string {
  return ['agent-log', ...l.groupPath, `${l.name}.md`].join('/');
}

/**
 * The ordering path of an issue-relative path: the maximal run of
 * numerically-prefixed segments ending at the file.
 *
 *   subtasks/040_execution/100_migration.md         → "040/100"
 *   agent-log/020_wf_ship/02_working/090_round.md   → "020/02/090"
 *   agent-log/020_wf_ship/notes.md                  → ""   (no prefix, no identity)
 *
 * **A deliberate mirror of `orderingPathFor` in the CLI's `_links.mjs`**, which
 * cannot be imported here: that module is a Bun script in the plugin, this runs
 * in the Astro build. The rule is four lines and has no state, so a second
 * implementation is cheaper than a shared package — but it is a second copy, so
 * a change to either belongs in both, and the two examples above are the check.
 *
 * Used to render a stage's references as `<icon> 040/100 <title>`, which is the
 * same shape as the ORDERING LABEL a human writes by hand in link text. The
 * sidebar lists entries by number; a reference that shows only a name cannot be
 * matched against what is already on screen.
 */
const SEGMENT_PREFIX_RE = /^(\d{2,5})[_-]/;
export function orderingPathOf(relPath: string): string {
  const segments = relPath.split('/').filter(Boolean);
  const out: string[] = [];
  for (let i = segments.length - 1; i >= 0; i--) {
    const m = SEGMENT_PREFIX_RE.exec(segments[i]);
    if (!m) break;
    out.unshift(m[1]);
  }
  return out.join('/');
}

/** Ordering path of a subtask, from the path a stage's `subtasks:` ref resolves to. */
export function subtaskOrderingPath(s: IssueSubtask): string {
  return orderingPathOf(subtaskRefPath(s));
}

/** Ordering path of an agent-log entry, same derivation. */
export function logOrderingPath(l: IssueAgentLog): string {
  return orderingPathOf(logRefPath(l));
}

export interface PlanStageResolution {
  /** The referenced subtasks, in the order the stage lists them. */
  subtasks: IssueSubtask[];
  /**
   * Refs that named nothing — a path with no matching subtask / log, plus the
   * loader's unparsable entries.
   *
   * Surfaced rather than dropped **on purpose**. A stage that lists four
   * subtasks and renders three chips reads exactly like a stage that lists
   * three: the omission has no shape of its own. `agent-ks check issues` errors
   * on the same condition.
   */
  missing: string[];
}

/**
 * Resolve one stage's references against the issue. Pure in-memory lookup —
 * `IssueSubtask` already carries `status` and `category`, so rendering a chip
 * needs no second read.
 */
export function resolvePlanStage(issue: Issue, stage: IssuePlanStage): PlanStageResolution {
  const subtaskByPath = new Map(issue.subtasks.map((s) => [subtaskRefPath(s), s]));

  const subtasks: IssueSubtask[] = [];
  const missing: string[] = [...stage.unresolvedRefs];

  for (const ref of stage.subtaskRefs) {
    const hit = subtaskByPath.get(ref);
    if (hit) subtasks.push(hit);
    else missing.push(ref);
  }

  return { subtasks, missing };
}

/**
 * Nested tree: files at this folder + a map of named subgroups, each itself a
 * `GroupedTree` (its own file list + subgroup map), recursing to the loader's
 * depth cap. Used by the sidebar to render notes / agent-logs as collapsible
 * nested sections that mirror the on-disk shape.
 */
export interface GroupedTree<T> {
  files: T[];
  groups: Map<string, GroupedTree<T>>;
}

function emptyTree<T>(): GroupedTree<T> {
  return { files: [], groups: new Map() };
}

function insertIntoTree<T>(tree: GroupedTree<T>, segments: string[], item: T): void {
  if (segments.length === 0) {
    tree.files.push(item);
    return;
  }
  const [head, ...rest] = segments;
  let child = tree.groups.get(head);
  if (!child) {
    child = emptyTree<T>();
    tree.groups.set(head, child);
  }
  insertIntoTree(child, rest, item);
}

/** Build a nested tree from flat entries that carry a `groupPath` array. */
export function groupByPath<T extends { groupPath: string[] }>(items: T[]): GroupedTree<T> {
  const tree = emptyTree<T>();
  for (const item of items) insertIntoTree(tree, item.groupPath, item);
  return tree;
}

/**
 * Nested tree of subtasks that also carries group-label metadata for each
 * folder (numeric prefix + display title). Built from the loader's flat
 * `subtasks` list + parallel `subtaskGroups` list.
 */
export interface SubtaskGroupNode {
  files: IssueSubtask[];
  groups: Map<string, SubtaskGroupNode>;
  /** Group metadata — null at the root (the `subtasks/` folder itself has none). */
  meta: import('@loaders/issues').SubtaskGroupMeta | null;
}

function emptySubtaskNode(meta: SubtaskGroupNode['meta']): SubtaskGroupNode {
  return { files: [], groups: new Map(), meta };
}

export function groupSubtasks(
  subtasks: IssueSubtask[],
  groups: import('@loaders/issues').SubtaskGroupMeta[],
): SubtaskGroupNode {
  const root = emptySubtaskNode(null);
  // Pre-create folder nodes so empty groups still render.
  for (const g of groups) {
    let cursor = root;
    for (let i = 0; i < g.groupPath.length; i++) {
      const seg = g.groupPath[i];
      let child = cursor.groups.get(seg);
      if (!child) {
        const isLeaf = i === g.groupPath.length - 1;
        child = emptySubtaskNode(isLeaf ? g : null);
        cursor.groups.set(seg, child);
      } else if (i === g.groupPath.length - 1) {
        child.meta = g;
      }
      cursor = child;
    }
  }
  for (const s of subtasks) {
    let cursor = root;
    for (const seg of s.groupPath) {
      let child = cursor.groups.get(seg);
      if (!child) {
        child = emptySubtaskNode(null);
        cursor.groups.set(seg, child);
      }
      cursor = child;
    }
    cursor.files.push(s);
  }
  return root;
}

// ---------------------------------------------------------------------------
// The plan page as one document
// ---------------------------------------------------------------------------

/** Anchor for the overview block at the top of a plan page. */
export const PLAN_OVERVIEW_ANCHOR = 'plan-overview';
/** Anchor for the stage table. */
export const PLAN_STAGES_ANCHOR = 'plan-stages';

export interface PlanStageRender {
  stage: IssuePlanStage;
  /** Body HTML with heading ids prefixed by the stage anchor. */
  html: string;
}

export interface PlanDocument {
  /** Overview HTML with heading ids prefixed, or null when there is none. */
  overviewHtml: string | null;
  stages: PlanStageRender[];
  /** Right-rail index: Overview → Stages → each stage → its own headings. */
  toc: TocEntry[];
}

/**
 * Build the plan page's HTML and its table of contents **together**.
 *
 * `PlanPage.astro` renders the page and `SubDocLayout.astro` renders the right
 * rail, and they used to answer "what is on this page?" separately — the layout
 * built the rail from `plan.stages` alone, so the overview and the stage table
 * had no entry, and a stage's own headings were invisible to it even though the
 * page had already assigned them ids. One function, two consumers: the rail
 * cannot list a section the page did not render, or miss one it did.
 *
 * **Every id is prefixed**, because a plan page inlines the overview and every
 * stage into ONE DOM. Stage files tend to carry the same `## Todo`, and the
 * overview may carry `## Closed` while a stage does too; unprefixed, the second
 * `#todo` silently shadows the first and the rail links to the wrong section.
 *
 * TOC levels are display depth, not source depth: the three landmarks sit at
 * level 2 (the rail renders 1 and 2 at the same indent) and everything inside
 * one is pushed a level below it, so the index reads as a two-tier list.
 */
export function planDocument(plan: IssuePlan): PlanDocument {
  const toc: TocEntry[] = [];

  const overview = plan.overviewHtml
    ? extractAndPrefixToc(plan.overviewHtml, PLAN_OVERVIEW_ANCHOR)
    : null;

  if (overview) {
    toc.push({ id: PLAN_OVERVIEW_ANCHOR, level: 2, text: 'Overview' });
    for (const h of overview.toc) toc.push({ ...h, level: Math.min(h.level + 1, 6) });
  }

  if (plan.stages.length > 0) {
    toc.push({ id: PLAN_STAGES_ANCHOR, level: 2, text: 'Stages' });
  }

  const stages = plan.stages.map((stage) => {
    const { html, toc: inner } = extractAndPrefixToc(stage.html, stage.anchor);
    toc.push({ id: stage.anchor, level: 2, text: stage.title });
    for (const h of inner) toc.push({ ...h, level: Math.min(h.level + 1, 6) });
    return { stage, html };
  });

  return { overviewHtml: overview ? overview.html : null, stages, toc };
}
