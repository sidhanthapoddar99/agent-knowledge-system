/**
 * Sidebar Hook - Build sidebar tree from content
 *
 * Sorting: XX_ prefix is the SOLE determining factor for order
 * Both files and folders use the same XX_ prefix system
 *
 * Caching: Uses unified cache manager with mtime-based validation
 * - Tracks dependencies on folder settings.json files
 * - Automatically invalidates when settings change
 */

import fs from 'fs';
import path from 'path';
import type { LoadedContent } from '@loaders/data';
import cacheManager from '@loaders/cache-manager';
import { parseOrderPrefix } from '../parsers/core/order-prefix';
import { parseJsonc, resolveSettingsPath } from '@loaders/settings-file';

// Re-export for backward compatibility
export { invalidateSidebarCache } from '@loaders/cache-manager';

// ============================================
// Types
// ============================================

export interface SidebarItem {
  type: 'item';
  title: string;
  href: string;
  slug: string;
  position: number;
}

export interface SidebarSection {
  type: 'section';
  title: string;
  slug: string;
  href?: string;
  position: number;
  collapsed: boolean;
  collapsible: boolean;
  children: (SidebarItem | SidebarSection)[];
}

export type SidebarNode = SidebarItem | SidebarSection;

export interface FolderSettings {
  label?: string;
  isCollapsible?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
}

// ============================================
// Utilities
// ============================================

/**
 * Extract position from XX_ prefix (works for files and folders)
 */
function extractPosition(name: string): { position: number; cleanName: string } {
  const { position, cleanName } = parseOrderPrefix(name);
  return { position: position ?? 999, cleanName };
}

/**
 * Load settings.json from a folder
 * Returns settings and the file path (for dependency tracking)
 */
function loadFolderSettings(folderPath: string): { settings: FolderSettings; settingsPath: string | null } {
  const settingsPath = resolveSettingsPath(folderPath);

  if (!fs.existsSync(settingsPath)) {
    return { settings: {}, settingsPath: null };
  }

  try {
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    const settings = parseJsonc<FolderSettings>(raw);
    return { settings, settingsPath };
  } catch {
    return { settings: {}, settingsPath: null };
  }
}

/**
 * Format a slug into a readable title
 */
function formatTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Find folder with XX_ prefix that matches clean name
 */
function findFolderWithPrefix(parentPath: string, cleanName: string): string | null {
  if (!parentPath || !fs.existsSync(parentPath)) {
    return null;
  }

  try {
    const entries = fs.readdirSync(parentPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const { cleanName: entryClean } = extractPosition(entry.name);
        if (entryClean === cleanName) {
          return entry.name;
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

// ============================================
// Sidebar Tree Building
// ============================================

interface TreeNode {
  name: string;
  cleanName: string;
  fullPath: string;  // filesystem path
  slugPath: string;  // url slug path
  position: number;
  settings: FolderSettings;
  items: LoadedContent[];
  children: Map<string, TreeNode>;
}

/**
 * Build a sidebar tree from flat content array
 * Sorting is based ONLY on XX_ prefix
 *
 * Returns mixed array: root-level files become items, folders become sections
 * Results are cached with dependency tracking on settings.json files
 */
export function buildSidebarTree(
  content: LoadedContent[],
  basePath: string = '/docs',
  dataPath?: string
): SidebarNode[] {
  // Generate cache key
  const cacheKey = `${dataPath || 'default'}:${basePath}`;

  // Check cache first (uses mtime-based validation on dependencies)
  const cached = cacheManager.getCached<SidebarNode[]>('sidebar', cacheKey);
  if (cached) {
    return cached;
  }

  const root: Map<string, TreeNode> = new Map();
  const rootItems: LoadedContent[] = []; // Root-level files (no folder)
  const settingsDeps: string[] = []; // Track settings.json files for cache deps

  // Group content by directory structure
  for (const item of content) {
    const parts = item.slug.split('/');
    let currentLevel = root;
    let currentFsPath = dataPath || '';

    // Navigate/create the tree structure for directories
    for (let i = 0; i < parts.length - 1; i++) {
      const slugPart = parts[i];

      if (!currentLevel.has(slugPart)) {
        // Find the actual folder name (with XX_ prefix)
        const actualFolderName = findFolderWithPrefix(currentFsPath, slugPart) || slugPart;
        const { position } = extractPosition(actualFolderName);
        const folderFsPath = path.join(currentFsPath, actualFolderName);

        // Load folder settings and track dependency
        const { settings, settingsPath } = dataPath ? loadFolderSettings(folderFsPath) : { settings: {}, settingsPath: null };
        if (settingsPath) {
          settingsDeps.push(settingsPath);
        }

        currentLevel.set(slugPart, {
          name: actualFolderName,
          cleanName: slugPart,
          fullPath: folderFsPath,
          slugPath: parts.slice(0, i + 1).join('/'),
          position,
          settings,
          items: [],
          children: new Map(),
        });
      }

      const node = currentLevel.get(slugPart)!;
      currentFsPath = node.fullPath;
      currentLevel = node.children;
    }

    // Add item to appropriate level
    if (parts.length === 1) {
      // Top-level file - collect as direct items
      rootItems.push(item);
    } else {
      // Add to parent folder
      const parentSlug = parts.slice(0, -1).join('/');
      const parent = findNode(root, parentSlug);
      if (parent) {
        parent.items.push(item);
      }
    }
  }

  // Build result: mix of items (root files) and sections (folders)
  const result: SidebarNode[] = [];

  // Add root-level items directly
  for (const item of rootItems) {
    result.push({
      type: 'item',
      title: item.data.sidebar_label || item.data.title,
      href: `${basePath}/${item.slug}`,
      slug: item.slug,
      position: item.data.sidebar_position ?? 999,
    });
  }

  // Add folder sections
  for (const [, node] of root) {
    result.push(nodeToSection(node, basePath));
  }

  // Sort everything by position
  const sortedResult = result.sort((a, b) => a.position - b.position);

  // Cache with settings.json files as dependencies
  // When any settings.json changes, this cache entry will be invalidated
  cacheManager.setCache('sidebar', cacheKey, sortedResult, settingsDeps);

  return sortedResult;
}

/**
 * Find a node in the tree by slug path
 */
function findNode(root: Map<string, TreeNode>, slugPath: string): TreeNode | null {
  const parts = slugPath.split('/');
  let current = root;

  for (let i = 0; i < parts.length; i++) {
    const node = current.get(parts[i]);
    if (!node) return null;
    if (i === parts.length - 1) return node;
    current = node.children;
  }

  return null;
}

/**
 * Convert a single tree node to sidebar section
 */
function nodeToSection(node: TreeNode, basePath: string): SidebarSection {
  const settings = node.settings;
  const children: (SidebarItem | SidebarSection)[] = [];

  // Convert items to SidebarItems
  for (const item of node.items) {
    children.push({
      type: 'item',
      title: item.data.sidebar_label || item.data.title,
      href: `${basePath}/${item.slug}`,
      slug: item.slug,
      position: item.data.sidebar_position ?? 999,
    });
  }

  // Convert child folders to nested SidebarSections
  for (const [, childNode] of node.children) {
    children.push(nodeToSection(childNode, basePath));
  }

  // Sort ALL children by position
  children.sort((a, b) => a.position - b.position);

  // Section href is the first item's href
  let sectionHref: string | undefined;
  const firstItem = children.find((c): c is SidebarItem => c.type === 'item');
  if (firstItem) {
    sectionHref = firstItem.href;
  }

  // Determine collapsibility - check both isCollapsible and collapsible
  const isCollapsible = settings.isCollapsible ?? settings.collapsible ?? true;

  return {
    type: 'section',
    title: settings.label || formatTitle(node.cleanName),
    slug: node.slugPath,
    href: sectionHref,
    position: node.position,
    collapsed: settings.collapsed ?? false,
    collapsible: isCollapsible,
    children,
  };
}

// ============================================
// Navigation Helpers
// ============================================

/**
 * Check if a section contains the current path
 */
export function isSectionActive(section: SidebarSection, currentPath: string): boolean {
  if (section.href === currentPath) return true;

  for (const child of section.children) {
    if (child.type === 'item' && child.href === currentPath) {
      return true;
    }
    if (child.type === 'section' && isSectionActive(child, currentPath)) {
      return true;
    }
  }

  return false;
}

/**
 * Flatten sidebar to linear list for pagination
 */
function flattenSidebar(nodes: SidebarNode[]): SidebarItem[] {
  const result: SidebarItem[] = [];

  for (const node of nodes) {
    if (node.type === 'item') {
      result.push(node);
    } else {
      // Recursively add children (items come from sections)
      result.push(...flattenSidebar(node.children));
    }
  }

  return result;
}

/**
 * Get previous and next items for pagination
 */
export function getPrevNext(
  nodes: SidebarNode[],
  currentPath: string
): { prev: SidebarItem | null; next: SidebarItem | null } {
  const flatItems = flattenSidebar(nodes);
  const currentIndex = flatItems.findIndex(item => item.href === currentPath);

  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next: currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null,
  };
}

export default {
  buildSidebarTree,
  isSectionActive,
  getPrevNext,
};
