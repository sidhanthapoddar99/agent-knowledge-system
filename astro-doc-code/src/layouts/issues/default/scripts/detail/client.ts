/**
 * Detail-page client entry. Wires up the four behaviours that need JS:
 *   - panel switching + deep-link hash handling
 *   - subtask state cycling (with optimistic UI + rollback)
 *   - Comprehensive panel's tabs + expand/collapse
 *   - right-sidebar TOC active-section highlighting
 * ([data-tip] tooltips are site-wide — wired in BaseLayout via src/scripts/tooltip.ts.)
 */
import { wirePanelSwitching } from './panels';
import { wireStateButton } from './subtask-state';
import { wireComprehensive } from './comprehensive';
import { wireTocObserver } from './toc-observer';

export function initIssuesDetail() {
  wirePanelSwitching();
  wireStateButton('.issue-overview-subtasks__state', '.issue-overview-subtasks__item');
  wireStateButton('.issue-comprehensive__state', '.issue-comprehensive__item');
  wireComprehensive();
  wireTocObserver();
}
