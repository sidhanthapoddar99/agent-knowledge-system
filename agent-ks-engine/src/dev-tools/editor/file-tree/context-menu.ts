/**
 * Context menu — right-click menu for file tree items.
 * Uses existing .ev2-context-menu CSS classes from editor.css.
 */

import type { Disposable } from '../types.js';
import { icon } from '../layout/icons.js';

export interface ContextMenuCallbacks {
  onNewFile: (parentDir: string) => void;
  onNewFolder: (parentDir: string) => void;
  onRename: (itemPath: string, itemName: string, isDir: boolean) => void;
  onDelete: (itemPath: string, itemName: string) => void;
}

export function initContextMenu(
  treeContainer: HTMLElement,
  contentRoot: string,
  callbacks: ContextMenuCallbacks,
): Disposable {
  let activeMenu: HTMLElement | null = null;

  function closeMenu() {
    if (activeMenu) {
      activeMenu.remove();
      activeMenu = null;
    }
  }

  function createMenuItem(iconName: string, label: string, onClick: () => void, danger = false): HTMLElement {
    const item = document.createElement('div');
    item.className = `ev2-context-menu-item${danger ? ' danger' : ''}`;
    item.innerHTML = `${icon(iconName, 14)}<span>${label}</span>`;
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMenu();
      onClick();
    });
    return item;
  }

  function createSeparator(): HTMLElement {
    const sep = document.createElement('div');
    sep.className = 'ev2-context-menu-separator';
    return sep;
  }

  function showMenu(x: number, y: number, items: HTMLElement[]) {
    closeMenu();

    const menu = document.createElement('div');
    menu.className = 'ev2-context-menu';
    for (const item of items) menu.appendChild(item);

    // Position — keep within viewport
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    document.body.appendChild(menu);

    // Adjust if overflowing
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 8}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 8}px`;
    }

    activeMenu = menu;
  }

  function onContextMenu(e: MouseEvent) {
    const treeItem = (e.target as HTMLElement).closest('.ev2-tree-item') as HTMLElement;
    if (!treeItem) {
      // Right-click on empty area — show root-level menu
      e.preventDefault();
      showMenu(e.clientX, e.clientY, [
        createMenuItem('file-plus', 'New File', () => callbacks.onNewFile(contentRoot)),
        createMenuItem('folder-plus', 'New Folder', () => callbacks.onNewFolder(contentRoot)),
      ]);
      return;
    }

    e.preventDefault();

    const itemPath = treeItem.dataset.path;
    const itemType = treeItem.dataset.type;
    const itemName = treeItem.querySelector('.tree-name')?.textContent || '';

    if (!itemPath) return;

    const items: HTMLElement[] = [];

    if (itemType === 'folder') {
      items.push(createMenuItem('file-plus', 'New File', () => callbacks.onNewFile(itemPath)));
      items.push(createMenuItem('folder-plus', 'New Folder', () => callbacks.onNewFolder(itemPath)));
      items.push(createSeparator());
      items.push(createMenuItem('type', 'Rename', () => callbacks.onRename(itemPath, itemName, true)));
      items.push(createSeparator());
      items.push(createMenuItem('trash', 'Delete', () => callbacks.onDelete(itemPath, itemName), true));
    } else {
      const parentDir = itemPath.substring(0, itemPath.lastIndexOf('/'));
      items.push(createMenuItem('file-plus', 'New File', () => callbacks.onNewFile(parentDir)));
      items.push(createMenuItem('folder-plus', 'New Folder', () => callbacks.onNewFolder(parentDir)));
      items.push(createSeparator());
      items.push(createMenuItem('type', 'Rename', () => callbacks.onRename(itemPath, itemName, false)));
      items.push(createSeparator());
      items.push(createMenuItem('trash', 'Delete', () => callbacks.onDelete(itemPath, itemName), true));
    }

    showMenu(e.clientX, e.clientY, items);
  }

  function onDocClick() {
    closeMenu();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeMenu();
  }

  treeContainer.addEventListener('contextmenu', onContextMenu);
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKeyDown);

  return {
    cleanup() {
      closeMenu();
      treeContainer.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    },
  };
}
