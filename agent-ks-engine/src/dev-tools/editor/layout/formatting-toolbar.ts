/**
 * Formatting toolbar — icon button bar for markdown formatting.
 * Works in both source and WYSIWYG modes.
 */

import type { EditorView } from '@codemirror/view';
import type { Disposable } from '../types.js';
import { icon } from './icons.js';
import {
  toggleBold,
  toggleItalic,
  toggleStrikethrough,
  toggleInlineCode,
  insertHeading,
  insertLink,
  insertCodeBlock,
  toggleBulletList,
  toggleOrderedList,
  toggleBlockquote,
  insertTable,
  insertHorizontalRule,
} from '../core/formatting-commands.js';

export interface FormattingToolbarHandle extends Disposable {
  show(): void;
  hide(): void;
  setEditorView(view: EditorView | null): void;
}

interface ToolbarButton {
  icon: string;
  title: string;
  action: (view: EditorView) => boolean;
}

const buttons: (ToolbarButton | 'separator')[] = [
  { icon: 'bold', title: 'Bold (Ctrl+B)', action: toggleBold },
  { icon: 'italic', title: 'Italic (Ctrl+I)', action: toggleItalic },
  { icon: 'strikethrough', title: 'Strikethrough (Ctrl+Shift+S)', action: toggleStrikethrough },
  { icon: 'code', title: 'Inline Code (Ctrl+E)', action: toggleInlineCode },
  'separator',
  // Heading is handled specially (dropdown)
  'separator',
  { icon: 'link', title: 'Link (Ctrl+K)', action: insertLink },
  { icon: 'image', title: 'Image', action: (v) => { insertLink(v); return true; } },
  'separator',
  { icon: 'list', title: 'Bullet List', action: toggleBulletList },
  { icon: 'list-ordered', title: 'Ordered List', action: toggleOrderedList },
  { icon: 'quote', title: 'Blockquote', action: toggleBlockquote },
  'separator',
  { icon: 'table', title: 'Table', action: insertTable },
  { icon: 'horizontal-rule', title: 'Horizontal Rule', action: insertHorizontalRule },
  { icon: 'file-code', title: 'Code Block', action: insertCodeBlock },
];

export function initFormattingToolbar(container: HTMLElement): FormattingToolbarHandle {
  let currentView: EditorView | null = null;

  const toolbar = document.createElement('div');
  toolbar.className = 'ev2-toolbar';

  // Build buttons
  for (const item of buttons) {
    if (item === 'separator') {
      const sep = document.createElement('div');
      sep.className = 'ev2-toolbar-separator';
      toolbar.appendChild(sep);
      continue;
    }

    const btn = document.createElement('button');
    btn.className = 'ev2-toolbar-btn';
    btn.title = item.title;
    btn.innerHTML = icon(item.icon, 16);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView) {
        item.action(currentView);
        currentView.focus();
      }
    });
    toolbar.appendChild(btn);
  }

  // Insert heading dropdown after the second separator (after strikethrough group)
  const headingMenu = document.createElement('div');
  headingMenu.className = 'ev2-toolbar-heading-menu';

  const headingBtn = document.createElement('button');
  headingBtn.className = 'ev2-toolbar-btn';
  headingBtn.title = 'Heading';
  headingBtn.innerHTML = icon('heading', 16);
  headingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    headingMenu.classList.toggle('open');
  });

  const headingDropdown = document.createElement('div');
  headingDropdown.className = 'ev2-toolbar-heading-dropdown';

  for (let level = 1; level <= 6; level++) {
    const item = document.createElement('div');
    item.className = 'ev2-toolbar-heading-item';
    item.textContent = `Heading ${level}`;
    item.style.fontSize = `${Math.max(13, 20 - level * 2)}px`;
    item.style.fontWeight = level <= 3 ? '600' : '400';
    item.addEventListener('click', () => {
      if (currentView) {
        insertHeading(currentView, level);
        currentView.focus();
      }
      headingMenu.classList.remove('open');
    });
    headingDropdown.appendChild(item);
  }

  headingMenu.appendChild(headingBtn);
  headingMenu.appendChild(headingDropdown);

  // Insert heading menu after the first separator (position 5 = after code, separator)
  const firstSepAfterInline = toolbar.children[4]; // 4th child is the first separator after inline group
  if (firstSepAfterInline && firstSepAfterInline.nextSibling) {
    toolbar.insertBefore(headingMenu, firstSepAfterInline.nextSibling);
  } else {
    toolbar.appendChild(headingMenu);
  }

  // Close heading dropdown on outside click
  function onDocClick() {
    headingMenu.classList.remove('open');
  }
  document.addEventListener('click', onDocClick);

  container.appendChild(toolbar);

  return {
    show() { container.style.display = ''; },
    hide() { container.style.display = 'none'; },
    setEditorView(view: EditorView | null) { currentView = view; },
    cleanup() {
      document.removeEventListener('click', onDocClick);
      container.innerHTML = '';
    },
  };
}
