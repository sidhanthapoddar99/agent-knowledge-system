import { STATUSES, TERMINAL_STATUSES, type IssueStatus, type CategoryId } from '@loaders/issue-status';

export type { IssueStatus };
/** @deprecated alias retained during the state→status rename */
export type SubtaskState = IssueStatus;

/** Click-to-cycle happy path. Blocked / input-needed / dropped are set by
 *  editing the file (or an agent) rather than by cycling — keeps the click
 *  ergonomic (open → in-progress → review → done → open). */
export const CYCLE: IssueStatus[] = ['open', 'in-progress', 'review', 'done'];

/** Terminal (Closed category) statuses. */
export const TERMINAL: IssueStatus[] = [...TERMINAL_STATUSES];

/** Comprehensive-panel tabs are the four lifecycle categories, plus "all". */
export type CompTab = CategoryId | 'all';

/** Read server-rendered SVG markup for each status from the JSON script tag. */
export function readIcons(): Record<IssueStatus, string> {
  const empty = Object.fromEntries(STATUSES.map((s) => [s, ''])) as Record<IssueStatus, string>;
  const el = document.getElementById('subtask-state-icons');
  if (!el?.textContent) return empty;
  try {
    return JSON.parse(el.textContent) as Record<IssueStatus, string>;
  } catch {
    return empty;
  }
}
