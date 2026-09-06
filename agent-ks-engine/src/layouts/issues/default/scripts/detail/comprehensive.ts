/**
 * Comprehensive-panel behaviour:
 *   - Filter tabs (Review / In Progress / Not Started / Closed / All — the four
 *     lifecycle categories) — also filters the right-sidebar subtasks index so
 *     they stay in sync.
 *   - Word-capped expand/collapse for items past COMPREHENSIVE_WORD_CAP.
 */
import type { CompTab } from './types';
import { categoryOf, isValidStatus } from '@loaders/issue-status';

let currentCompTab: CompTab = 'review';

/** A subtask row matches the current tab when its status's category equals the
 *  tab (or the tab is "all"). */
function matchesTab(status: string): boolean {
  if (currentCompTab === 'all') return true;
  return isValidStatus(status) && categoryOf(status) === currentCompTab;
}

export function applyComprehensiveTabFilter() {
  document.querySelectorAll<HTMLElement>('.issue-comprehensive__item').forEach((i) => {
    i.style.display = matchesTab(i.dataset.state || '') ? '' : 'none';
  });
  document.querySelectorAll<HTMLElement>('.issue-meta-index__link').forEach((a) => {
    (a.parentElement as HTMLElement).style.display =
      matchesTab(a.dataset.state || '') ? '' : 'none';
  });
}

export function wireComprehensive() {
  document.querySelectorAll<HTMLElement>('[data-comprehensive-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCompTab = btn.dataset.comprehensiveTab as CompTab;
      document.querySelectorAll<HTMLElement>('[data-comprehensive-tab]').forEach((b) => {
        b.classList.toggle('is-active', b === btn);
      });
      applyComprehensiveTabFilter();
    });
  });

  // Expand / collapse for clippable comprehensive items (>150 words)
  document.querySelectorAll<HTMLElement>('[data-comprehensive-expand]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest<HTMLElement>('.issue-comprehensive__item');
      if (!item) return;
      const clipped = item.classList.toggle('is-clipped');
      btn.setAttribute('aria-expanded', clipped ? 'false' : 'true');
      btn.setAttribute('aria-label', clipped ? 'Expand subtask' : 'Collapse subtask');
    });
  });

  applyComprehensiveTabFilter();
}
