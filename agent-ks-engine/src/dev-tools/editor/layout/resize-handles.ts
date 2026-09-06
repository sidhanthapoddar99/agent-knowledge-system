/**
 * Resize handles for sidebar and preview panes
 */

import type { Disposable } from '../types.js';

export function initResizeHandle(
  handle: HTMLDivElement,
  target: HTMLElement,
  side: 'left' | 'right',
  storageKey: string,
): Disposable {
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  // Restore saved width
  const saved = localStorage.getItem(storageKey);
  if (saved) target.style.width = saved + 'px';

  function onMouseDown(e: MouseEvent) {
    isResizing = true;
    startX = e.clientX;
    startWidth = target.getBoundingClientRect().width;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }

  function onMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    const delta = side === 'left'
      ? e.clientX - startX
      : startX - e.clientX;
    const parentWidth = target.parentElement?.getBoundingClientRect().width || window.innerWidth;
    const maxWidth = parentWidth * 0.5;
    const newWidth = Math.max(180, Math.min(maxWidth, startWidth + delta));
    target.style.width = newWidth + 'px';
  }

  function onMouseUp() {
    if (!isResizing) return;
    isResizing = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    localStorage.setItem(storageKey, String(target.getBoundingClientRect().width));
  }

  handle.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);

  return {
    cleanup() {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    },
  };
}
