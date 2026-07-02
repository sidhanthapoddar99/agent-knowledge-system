/**
 * SVG markup for the subtask status icon (7-status lifecycle vocabulary).
 *
 * Rendered server-side so the client can swap in place when a status cycles
 * without re-rendering the whole page. Also serialized into a JSON script
 * tag so `scripts/detail/client.ts` can fetch the same shapes for updates.
 * The status set itself is owned by `@loaders/issue-status`.
 */
import { STATUSES, type IssueStatus } from '@loaders/issues';

export function stateIconSvg(status: IssueStatus): string {
  switch (status) {
    case 'open':
      // hollow square
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="12" height="12" rx="2"/></svg>';
    case 'blocked':
      // circle with a slash — structurally blocked
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M4 4l8 8"/></svg>';
    case 'in-progress':
      // half-filled circle — actively being worked
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 2a6 6 0 010 12z" fill="currentColor" stroke="none"/></svg>';
    case 'input-needed':
      // question mark — needs a human answer to proceed
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M6.4 6.2a1.6 1.6 0 113.1.5c0 1-1.5 1.3-1.5 2.3" stroke-linecap="round"/><circle cx="8" cy="11.2" r="0.6" fill="currentColor" stroke="none"/></svg>';
    case 'review':
      // filled circle — awaiting review
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="4"/></svg>';
    case 'done':
      // check — shipped
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 8l3 3 7-7"/></svg>';
    case 'dropped':
      // cross — deliberately abandoned
      return '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  }
}

export function allStateIcons(): Record<IssueStatus, string> {
  return Object.fromEntries(
    STATUSES.map((s) => [s, stateIconSvg(s)]),
  ) as Record<IssueStatus, string>;
}
