/**
 * Unified Cache Manager
 *
 * Single source of truth for all caching with:
 * - mtime-based fast change detection (no hash computation)
 * - File type routing for selective invalidation
 * - Dependency tracking between caches
 * - Unified statistics and monitoring
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
  deps: string[];      // File paths this entry depends on
  mtimes: Map<string, number>;  // mtime when cached
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

/**
 * Check if file has changed since last check
 */
export function hasFileChanged(filePath: string): boolean {
  const state = getState();
  const currentMtime = getFileMtime(filePath);
  const cached = state.fileRegistry.get(filePath);

  if (!cached || cached.mtime !== currentMtime) {
    // Update registry
    state.fileRegistry.set(filePath, {
      path: filePath,
      mtime: currentMtime,
      type: detectFileType(filePath, state.watchPaths),
    });
    return true;
  }

  return false;
}

/**
 * Check if any dependency has changed
 */
export function haveDepsChanged(deps: string[], mtimes: Map<string, number>): boolean {
  for (const dep of deps) {
    const currentMtime = getFileMtime(dep);
    const cachedMtime = mtimes.get(dep);

    if (cachedMtime === undefined || cachedMtime !== currentMtime) {
      return true;
    }
  }
  return false;
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
 * Set cache entry
 *
 * Note: deps are stored for reference but not used for validation.
 * HMR handles invalidation via onFileChange/onFileAdd/onFileDelete.
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
    mtimes: new Map(), // Not used - HMR handles invalidation
    created: Date.now(),
  });
}

/**
 * Invalidate specific cache entries by key pattern
 */
export function invalidateByPattern(cacheName: CacheName, pattern: string | RegExp): number {
  const state = getState();
  const cache = state[cacheName] as Map<string, CacheEntry<any>>;
  const stats = state.stats[cacheName];

  let count = 0;
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

  for (const key of cache.keys()) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }

  stats.invalidations += count;
  return count;
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

  return { type: fileType, invalidated };
}

/**
 * Handle file addition
 */
export function onFileAdd(filePath: string): {
  type: FileType;
  invalidated: CacheName[];
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
  hasFileChanged,
  haveDepsChanged,
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
