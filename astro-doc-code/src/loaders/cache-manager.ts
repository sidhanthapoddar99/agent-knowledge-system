/**
 * Unified Cache Manager
 *
 * Single source of truth for the loaders' in-memory caches.
 *
 * HOW INVALIDATION ACTUALLY WORKS, because the two halves look redundant and
 * are not:
 *
 *  1. DEPENDENCY INVALIDATION. An entry records the files it was built from
 *     (`deps`). When one of them changes, that entry is dropped. This is the
 *     only mechanism that can catch a file which is not itself a page — a theme
 *     stylesheet, or a file spliced into a page by a `[[path]]` embed. The
 *     page's own mtime never moves when such a file is edited, so nothing else
 *     has any reason to reparse it.
 *
 *  2. TYPE-BASED INVALIDATION. A change to a `.md` file clears the whole
 *     content and sidebar caches, because a single markdown edit can change
 *     the sidebar, pagination and neighbour links of pages that do not
 *     reference it. Coarse on purpose: cheaper than tracking that fan-out.
 *
 * Both run on every change, (1) first. Read is deliberately NOT validated:
 * `getCached` trusts the invalidation above rather than stat-ing dependencies
 * per access, which measured 10-15ms of overhead.
 */

import fs from 'fs';
import path from 'path';

// ============================================
// Types
// ============================================

export type FileType = 'content' | 'settings' | 'theme' | 'config' | 'asset' | 'unknown';

export interface FileInfo {
  path: string;
  mtime: number;
  type: FileType;
}

export interface CacheStats {
  hits: number;
  misses: number;
  invalidations: number;
  lastAccess: number;
}

export interface CacheEntry<T> {
  data: T;
  /**
   * Absolute paths this entry was built from. Read by `invalidateByDep`, which
   * runs on every watched change — so adding a path here is what makes an edit
   * to a non-page file bust the pages that consume it.
   */
  deps: string[];
  created: number;
}

// ============================================
// Global Cache Registry (using globalThis)
// ============================================

const CACHE_MANAGER_KEY = '__cache_manager__';

interface CacheManagerState {
  // File mtime registry - tracks last known mtime for all watched files
  fileRegistry: Map<string, FileInfo>;

  // Individual caches
  content: Map<string, CacheEntry<any>>;
  sidebar: Map<string, CacheEntry<any>>;
  theme: Map<string, CacheEntry<any>>;
  settings: Map<string, CacheEntry<any>>;
  config: Map<string, CacheEntry<any>>;

  // Statistics per cache
  stats: {
    content: CacheStats;
    sidebar: CacheStats;
    theme: CacheStats;
    settings: CacheStats;
    config: CacheStats;
  };

  // Watch paths (categorized arrays from initPaths)
  watchPaths: {
    contentPaths: string[];
    configPaths: string[];
    assetPaths: string[];
    themePaths: string[];
  } | null;
}

function getState(): CacheManagerState {
  if (!(globalThis as any)[CACHE_MANAGER_KEY]) {
    (globalThis as any)[CACHE_MANAGER_KEY] = {
      fileRegistry: new Map(),
      content: new Map(),
      sidebar: new Map(),
      theme: new Map(),
      settings: new Map(),
      config: new Map(),
      stats: {
        content: { hits: 0, misses: 0, invalidations: 0, lastAccess: 0 },
        sidebar: { hits: 0, misses: 0, invalidations: 0, lastAccess: 0 },
        theme: { hits: 0, misses: 0, invalidations: 0, lastAccess: 0 },
        settings: { hits: 0, misses: 0, invalidations: 0, lastAccess: 0 },
        config: { hits: 0, misses: 0, invalidations: 0, lastAccess: 0 },
      },
      watchPaths: null,
    };
  }
  return (globalThis as any)[CACHE_MANAGER_KEY];
}

// ============================================
// File Type Detection
// ============================================

/**
 * Detect file type based on path and extension
 */
export function detectFileType(filePath: string, watchPaths?: CacheManagerState['watchPaths']): FileType {
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath);

  // Settings files (JSON or JSONC)
  if (basename === 'settings.json' || basename === 'settings.jsonc') {
    return 'settings';
  }

  // Config files
  if (basename === 'site.yaml' || basename === 'navbar.yaml' || basename === 'footer.yaml') {
    return 'config';
  }

  // Theme files
  if (basename === 'theme.yaml' || (watchPaths?.themePaths && watchPaths.themePaths.some(p => filePath.startsWith(p)))) {
    return 'theme';
  }

  // Content files
  if (ext === '.md' || ext === '.mdx') {
    return 'content';
  }

  // Asset files
  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) {
    return 'asset';
  }

  return 'unknown';
}

// ============================================
// mtime-based Change Detection
// ============================================

/**
 * Get file mtime (fast, no content reading)
 */
export function getFileMtime(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtimeMs;
  } catch {
    return 0;
  }
}

// ============================================
// Cache Operations
// ============================================

type CacheName = 'content' | 'sidebar' | 'theme' | 'settings' | 'config';

/**
 * Get cached entry
 *
 * Note: We don't check mtimes here because HMR already watches all files
 * and clears caches via onFileChange/onFileAdd/onFileDelete.
 * Checking mtimes on every access was causing 10-15ms overhead.
 */
export function getCached<T>(
  cacheName: CacheName,
  key: string
): T | null {
  const state = getState();
  const cache = state[cacheName] as Map<string, CacheEntry<T>>;
  const stats = state.stats[cacheName];

  const entry = cache.get(key);
  if (!entry) {
    stats.misses++;
    stats.lastAccess = Date.now();
    return null;
  }

  // Trust HMR to invalidate - no mtime check needed
  stats.hits++;
  stats.lastAccess = Date.now();
  return entry.data;
}

/**
 * Set cache entry.
 *
 * `deps` is load-bearing: every path passed here is a path whose edit will drop
 * this entry, via `invalidateByDep` on the next watched change. A file the entry
 * was genuinely built from and does not list here goes stale silently.
 */
export function setCache<T>(
  cacheName: CacheName,
  key: string,
  data: T,
  deps: string[] = []
): void {
  const state = getState();
  const cache = state[cacheName] as Map<string, CacheEntry<T>>;

  cache.set(key, {
    data,
    deps,
    created: Date.now(),
  });
}

/**
 * Invalidate cache entries that depend on a specific file
 */
export function invalidateByDep(filePath: string): { [key in CacheName]: number } {
  const state = getState();
  const result = { content: 0, sidebar: 0, theme: 0, settings: 0, config: 0 };

  for (const cacheName of ['content', 'sidebar', 'theme', 'settings', 'config'] as CacheName[]) {
    const cache = state[cacheName] as Map<string, CacheEntry<any>>;

    for (const [key, entry] of cache.entries()) {
      if (entry.deps.includes(filePath)) {
        cache.delete(key);
        result[cacheName]++;
        state.stats[cacheName].invalidations++;
      }
    }
  }

  return result;
}

/**
 * Clear entire cache
 */
export function clearCache(cacheName: CacheName): void {
  const state = getState();
  (state[cacheName] as Map<string, any>).clear();
  state.stats[cacheName].invalidations++;
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  const state = getState();
  state.content.clear();
  state.sidebar.clear();
  state.theme.clear();
  state.settings.clear();
  state.config.clear();
  state.fileRegistry.clear();
  // Also clear combined CSS cache
  if ((globalThis as any)['__theme_combined_css__']) {
    (globalThis as any)['__theme_combined_css__'].clear();
  }
}

// ============================================
// Selective Invalidation (for HMR)
// ============================================

/**
 * Smart invalidation based on file type
 * Returns what was invalidated for logging
 */
export function onFileChange(filePath: string): {
  type: FileType;
  invalidated: CacheName[];
  byDep: number;
} {
  const state = getState();
  const fileType = detectFileType(filePath, state.watchPaths);
  const invalidated: CacheName[] = [];

  // Update file registry
  state.fileRegistry.set(filePath, {
    path: filePath,
    mtime: getFileMtime(filePath),
    type: fileType,
  });

  // Dependency invalidation runs FIRST, and for every file type.
  //
  // It is the only thing that catches a file which is not itself a page — a
  // theme stylesheet, or a file a `[[path]]` embed splices into a page. The
  // type switch below cannot: it keys off what the CHANGED file is, and an
  // embedded `.svg` is an 'asset', a type that deliberately clears nothing
  // because assets are normally served straight to the browser. So without
  // this, editing an embedded asset leaves the page that inlined it serving
  // the previous bytes until the server restarts.
  const depCounts = invalidateByDep(filePath);
  const byDep = Object.values(depCounts).reduce((n, c) => n + c, 0);
  for (const [name, count] of Object.entries(depCounts)) {
    if (count > 0) invalidated.push(name as CacheName);
  }

  switch (fileType) {
    case 'content':
      // Content change: invalidate content + sidebar (sidebar depends on content)
      // But NOT theme or config
      clearCache('content');
      clearCache('sidebar');
      invalidated.push('content', 'sidebar');
      break;

    case 'settings':
      // settings.json change: invalidate sidebar + settings
      // Content doesn't need refresh (same files, different display)
      clearCache('sidebar');
      clearCache('settings');
      invalidated.push('sidebar', 'settings');
      break;

    case 'theme':
      // Theme change: invalidate theme cache + combined CSS cache
      clearCache('theme');
      if ((globalThis as any)['__theme_combined_css__']) {
        (globalThis as any)['__theme_combined_css__'].clear();
      }
      invalidated.push('theme');
      break;

    case 'config':
      // Config change (site.yaml, navbar.yaml): invalidate config
      // Theme might need refresh if site.yaml changed theme ref
      clearCache('config');
      if (filePath.endsWith('site.yaml')) {
        clearCache('theme');
        if ((globalThis as any)['__theme_combined_css__']) {
          (globalThis as any)['__theme_combined_css__'].clear();
        }
        invalidated.push('theme');
      }
      invalidated.push('config');
      break;

    case 'asset':
      // Asset change: no cache invalidation needed
      // Browser handles via normal caching
      break;

    default:
      // Unknown file type in watched directory
      // Be conservative: clear content + sidebar
      clearCache('content');
      clearCache('sidebar');
      invalidated.push('content', 'sidebar');
  }

  return { type: fileType, invalidated: [...new Set(invalidated)], byDep };
}

/**
 * Handle file addition
 */
export function onFileAdd(filePath: string): {
  type: FileType;
  invalidated: CacheName[];
  byDep: number;
} {
  // Same logic as change - new file affects same caches
  return onFileChange(filePath);
}

/**
 * Handle file deletion
 */
export function onFileDelete(filePath: string): {
  type: FileType;
  invalidated: CacheName[];
  byDep: number;
} {
  const state = getState();
  const fileType = detectFileType(filePath, state.watchPaths);

  // Remove from registry
  state.fileRegistry.delete(filePath);

  // Same invalidation logic as change
  return onFileChange(filePath);
}

// ============================================
// Watch Paths Configuration
// ============================================

/**
 * Set watch paths (called by HMR integration)
 */
export function setWatchPaths(paths: CacheManagerState['watchPaths']): void {
  getState().watchPaths = paths;
}

// ============================================
// Statistics & Debugging
// ============================================

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  caches: { [key in CacheName]: { size: number; stats: CacheStats } };
  fileRegistry: number;
  watchPaths: CacheManagerState['watchPaths'];
} {
  const state = getState();

  return {
    caches: {
      content: { size: state.content.size, stats: { ...state.stats.content } },
      sidebar: { size: state.sidebar.size, stats: { ...state.stats.sidebar } },
      theme: { size: state.theme.size, stats: { ...state.stats.theme } },
      settings: { size: state.settings.size, stats: { ...state.stats.settings } },
      config: { size: state.config.size, stats: { ...state.stats.config } },
    },
    fileRegistry: state.fileRegistry.size,
    watchPaths: state.watchPaths,
  };
}

/**
 * Get hit rate for a cache
 */
export function getHitRate(cacheName: CacheName): number {
  const stats = getState().stats[cacheName];
  const total = stats.hits + stats.misses;
  return total === 0 ? 0 : stats.hits / total;
}

// ============================================
// Exports for backward compatibility
// ============================================

// These maintain the old API while using the new system

export function invalidateAll(): void {
  clearAllCaches();
}

export function invalidateSidebarCache(): void {
  clearCache('sidebar');
  clearCache('settings');
}

export function clearThemeCache(): void {
  clearCache('theme');
  // Also clear combined CSS cache (used by getThemeCSS)
  if ((globalThis as any)['__theme_combined_css__']) {
    (globalThis as any)['__theme_combined_css__'].clear();
  }
}

export function clearSettingsCache(): void {
  clearCache('settings');
}

export default {
  // Core operations
  getCached,
  setCache,
  clearCache,
  clearAllCaches,

  // File change handling
  onFileChange,
  onFileAdd,
  onFileDelete,

  // Utilities
  detectFileType,
  getFileMtime,
  invalidateByDep,
  setWatchPaths,

  // Stats
  getCacheStats,
  getHitRate,

  // Backward compatibility
  invalidateAll,
  invalidateSidebarCache,
  clearThemeCache,
  clearSettingsCache,
};
