/**
 * Small server-side utilities shared across the detail-page components.
 * Kept here so the .astro files stay focused on templating.
 */
import type { IssueAgentLog, IssueNote, IssueSubtask, SubtaskState } from '@loaders/issues';

export const TERMINAL: SubtaskState[] = ['closed', 'cancelled'];

/** Pad a sequence number with a leading zero (`1` → `01`). Null → empty. */
export function pad(n: number | null): string {
  if (n === null) return '';
  return String(n).padStart(2, '0');
}

/** State-grouped subtask sort: active group (open | review) first, terminal
 *  group (closed | cancelled) after; within each group, ascending by sequence.
 *  Drives the Overview panel, MetaSidebar, the active/terminal divider, and
 *  Comprehensive-doc order. NOT the detail sidebar tree — that sorts by
 *  sequence only (see SubtaskTree.astro). */
const STATE_GROUP: Record<SubtaskState, number> = { open: 0, review: 0, closed: 1, cancelled: 1 };
export function sortSubtasksByState(subtasks: IssueSubtask[]): IssueSubtask[] {
  return [...subtasks].sort((a, b) => {
    const g = STATE_GROUP[a.state] - STATE_GROUP[b.state];
    if (g !== 0) return g;
    const sa = a.sequence ?? Number.MAX_SAFE_INTEGER;
    const sb = b.sequence ?? Number.MAX_SAFE_INTEGER;
    return sa - sb;
  });
}

/** Where the terminal group starts in a sidebar-sorted list; used to insert
 *  the "is-group-start" divider between active and terminal subtasks. */
export function terminalStartIndex(sorted: IssueSubtask[]): number {
  return sorted.findIndex((s) => TERMINAL.includes(s.state));
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

/** Panel key for an agent-log entry. Used only on the overview detail page
 *  where multiple sub-docs share one DOM. Sub-doc pages (their own URL) use
 *  the URL path instead. Segments are joined with `--`; root-level: `log-<name>`. */
export function logPanelKey(log: IssueAgentLog): string {
  return log.groupPath.length === 0
    ? `log-${log.name}`
    : `log-${[...log.groupPath, log.name].join('--')}`;
}

/** Panel key for a note entry — same scheme as logPanelKey but `note-` prefix. */
export function notePanelKey(note: IssueNote): string {
  return note.groupPath.length === 0
    ? `note-${note.name}`
    : `note-${[...note.groupPath, note.name].join('--')}`;
}

/** Panel key for a brainstorm entry — same scheme, `brainstorm-` prefix. */
export function brainstormPanelKey(doc: IssueNote): string {
  return doc.groupPath.length === 0
    ? `brainstorm-${doc.name}`
    : `brainstorm-${[...doc.groupPath, doc.name].join('--')}`;
}

/** Panel key for an agent-memory entry — same scheme, `memory-` prefix. */
export function agentMemoryPanelKey(doc: IssueNote): string {
  return doc.groupPath.length === 0
    ? `memory-${doc.name}`
    : `memory-${[...doc.groupPath, doc.name].join('--')}`;
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

export function subtaskUrl(baseUrl: string, issueId: string, subtask: IssueSubtask): string {
  return joinPath(baseUrl, issueId, 'subtasks', ...subtask.groupPath, subtask.slug);
}

/** Panel key for a subtask — same scheme as note/log keys. Group path is
 *  joined with `--` so the key stays unique across folders. */
export function subtaskPanelKey(subtask: IssueSubtask): string {
  return subtask.groupPath.length === 0
    ? `subtask-${subtask.slug}`
    : `subtask-${[...subtask.groupPath, subtask.slug].join('--')}`;
}

export function noteUrl(baseUrl: string, issueId: string, note: IssueNote): string {
  return joinPath(baseUrl, issueId, 'notes', ...note.groupPath, note.name);
}

export function brainstormUrl(baseUrl: string, issueId: string, doc: IssueNote): string {
  return joinPath(baseUrl, issueId, 'brainstorm', ...doc.groupPath, doc.name);
}

export function agentMemoryUrl(baseUrl: string, issueId: string, doc: IssueNote): string {
  return joinPath(baseUrl, issueId, 'agent-memory', ...doc.groupPath, doc.name);
}

export function logUrl(baseUrl: string, issueId: string, log: IssueAgentLog): string {
  return joinPath(baseUrl, issueId, 'agent-log', ...log.groupPath, log.name);
}

/**
 * Two-level tree: files at this folder + a map of named subgroups, each of
 * which is itself a one-level grouping (its own file list + its own
 * sub-subgroup map). Used by the sidebar to render notes / agent-logs as
 * collapsible nested sections that mirror the on-disk shape.
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

/** Build a 2-level tree from flat entries that carry a `groupPath` array. */
export function groupByPath<T extends { groupPath: string[] }>(items: T[]): GroupedTree<T> {
  const tree = emptyTree<T>();
  for (const item of items) insertIntoTree(tree, item.groupPath, item);
  return tree;
}

/**
 * 2-level tree of subtasks that also carries group-label metadata for each
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
