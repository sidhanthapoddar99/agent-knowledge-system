/**
 * Subtask state cycling. Clicking a state icon cycles the happy path
 * open → in-progress → review → done → open, updates every surface that shows
 * the subtask (comprehensive list, subtask page, sidebar tree, right-rail
 * index), and POSTs to /__editor/subtask-toggle so the change persists to the
 * file's frontmatter. Failed POSTs roll back the UI.
 */
import { CYCLE, TERMINAL, readIcons, type IssueStatus } from './types';
import { categoryOf, isValidStatus, STATUS_LABELS } from '@loaders/issue-status';

const ICONS = readIcons();

async function postState(filePath: string, status: IssueStatus) {
  const res = await fetch('/__editor/subtask-toggle', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ filePath, status }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

function setStateOn(el: HTMLElement | null, state: IssueStatus) {
  if (!el) return;
  el.dataset.state = state;
  el.className = el.className.replace(/\bstate-[a-z-]+\b/g, '').trim() + ` state-${state}`;
}

/** Keep a status icon's tooltip/label in step with its swapped glyph. */
function setIconTip(el: HTMLElement | null, state: IssueStatus) {
  if (!el) return;
  if (el.hasAttribute('data-tip')) el.setAttribute('data-tip', STATUS_LABELS[state]);
  if (el.hasAttribute('aria-label') && !el.getAttribute('aria-label')?.includes('cycle')) {
    el.setAttribute('aria-label', STATUS_LABELS[state]);
  }
}

function applySubtaskState(key: string, state: IssueStatus) {
  const isDone = TERMINAL.includes(state);

  const compItem = document.querySelector<HTMLElement>(
    `.issue-comprehensive__item[data-subtask-key="${CSS.escape(key)}"]`,
  );
  setStateOn(compItem, state);
  const compBtn = compItem?.querySelector<HTMLElement>('.issue-comprehensive__state');
  if (compBtn) {
    compBtn.dataset.state = state;
    compBtn.innerHTML = ICONS[state];
    setIconTip(compBtn, state);
  }
  const compPill = compItem?.querySelector<HTMLElement>('.issue-comprehensive__pill');
  if (compPill) compPill.textContent = state;

  const page = document.querySelector<HTMLElement>(
    `.issue-subtask-page[data-subtask-key="${CSS.escape(key)}"]`,
  );
  if (page) {
    page.dataset.state = state;
    const pill = page.querySelector<HTMLElement>('[data-state-pill]');
    if (pill) pill.textContent = state;
  }

  const sideBtn = document.querySelector<HTMLElement>(
    `.issue-sidebar__item[data-subtask-key="${CSS.escape(key)}"]`,
  );
  if (sideBtn) {
    sideBtn.dataset.state = state;
    sideBtn.classList.toggle('is-done', isDone);
    const icon = sideBtn.querySelector<HTMLElement>('[data-state-icon]');
    if (icon) {
      icon.innerHTML = ICONS[state];
      setIconTip(icon, state);
    }
  }

  const indexLink = document.querySelector<HTMLElement>(
    `.issue-meta-index__link[data-subtask-key="${CSS.escape(key)}"]`,
  );
  setStateOn(indexLink, state);
  const indexIcon = indexLink?.querySelector<HTMLElement>('[data-state-icon]');
  if (indexIcon) {
    indexIcon.innerHTML = ICONS[state];
    setIconTip(indexIcon, state);
  }

  updateSidebarSubtasksCount();
  updateComprehensiveTabCounts();
}

function updateComprehensiveTabCounts() {
  const items = document.querySelectorAll<HTMLElement>('.issue-comprehensive__item');
  // Comprehensive tabs are the four lifecycle categories.
  const counts: Record<string, number> = { 'in-progress': 0, review: 0, 'not-started': 0, closed: 0 };
  items.forEach((i) => {
    const s = i.dataset.state || '';
    if (isValidStatus(s)) counts[categoryOf(s)]++;
  });
  const total = items.length;
  const set = (key: string, n: number) => {
    const el = document.querySelector<HTMLElement>(`[data-comprehensive-tab="${key}"] .issue-comprehensive__tab-count`);
    if (el) el.textContent = String(n);
  };
  set('in-progress', counts['in-progress']);
  set('review', counts.review);
  set('not-started', counts['not-started']);
  set('closed', counts.closed);
  set('all', total);
}

function updateSidebarSubtasksCount() {
  const items = document.querySelectorAll<HTMLElement>('.issue-sidebar__item.is-subtask');
  if (!items.length) return;
  const done = Array.from(items).filter((i) => TERMINAL.includes(i.dataset.state as IssueStatus)).length;
  const review = Array.from(items).filter((i) => i.dataset.state === 'review').length;
  const heading = document.getElementById('sidebar-subtasks-count');
  if (heading) {
    heading.textContent = `${done}/${items.length}`;
    if (review > 0) {
      const dot = document.createElement('span');
      dot.className = 'issue-sidebar__review-dot';
      dot.setAttribute('aria-hidden', 'true');
      dot.setAttribute('data-tip', `${review} awaiting review`);
      dot.setAttribute('data-tip-always', '');
      heading.appendChild(dot);
    }
  }
  // Folder rows mirror the header's done/total, scoped to their own <details>.
  document.querySelectorAll<HTMLElement>('[data-subtask-folder-count]').forEach((span) => {
    const details = span.closest('details');
    if (!details) return;
    const inner = details.querySelectorAll<HTMLElement>('.issue-sidebar__item.is-subtask');
    const innerDone = Array.from(inner).filter((i) => TERMINAL.includes(i.dataset.state as IssueStatus)).length;
    span.textContent = `${innerDone}/${inner.length}`;
  });
}

async function handleStateChange(key: string, filePath: string, nextState: IssueStatus, prevState: IssueStatus) {
  applySubtaskState(key, nextState);
  try {
    await postState(filePath, nextState);
  } catch (err) {
    console.error('[issues] subtask state change failed', err);
    applySubtaskState(key, prevState);
  }
}

export function wireStateButton(selector: string, itemSelector: string) {
  // Cycling persists through `/__editor/subtask-toggle`, which only exists on
  // the dev server. Without this guard a published site fires the POST anyway,
  // the catch in `handleStateChange` rolls the UI back, and the reader sees a
  // checkbox that flickers and reverts with no explanation. The buttons are
  // rendered `disabled` in a build as well — this is the second half of that,
  // so no listener is attached even if the markup is reached another way.
  if (!import.meta.env.DEV) return;

  document.querySelectorAll<HTMLElement>(selector).forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest<HTMLElement>(itemSelector);
      if (!item) return;
      const prev = (btn.dataset.state || 'open') as IssueStatus;
      const next = CYCLE[(CYCLE.indexOf(prev) + 1) % CYCLE.length];
      handleStateChange(item.dataset.subtaskKey!, item.dataset.file!, next, prev);
    });
  });
}
