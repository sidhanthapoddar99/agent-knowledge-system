/**
 * Error/Warning Manager
 *
 * Collects and manages errors and warnings during content processing.
 * Used by the dev toolbar to display issues.
 *
 * Note: Content caching is now handled by cache-manager.ts
 */

// ============================================
// Types
// ============================================

export type ErrorType =
  | 'asset-missing'
  | 'frontmatter'
  | 'syntax'
  | 'config'
  | 'unknown'
  // Theme-related errors
  | 'theme-not-found'
  | 'theme-missing-file'
  | 'theme-missing-variable'
  | 'theme-invalid-manifest'
  | 'theme-circular-extends';

export type WarningType = 'missing-description' | 'missing-image' | 'deprecated' | 'draft' | 'config';

export interface ContentError {
  file: string;
  line?: number;
  type: ErrorType;
  message: string;
  suggestion?: string;
  timestamp: number;
}

export interface ContentWarning {
  file: string;
  line?: number;
  type: WarningType;
  message: string;
  suggestion?: string;
  timestamp: number;
}

// Legacy type for backward compatibility
export interface CacheEntry {
  content: any[];
  settings?: any;
  timestamp: number;
  fileHashes: Map<string, string>;
}

interface ErrorWarningState {
  errors: ContentError[];
  warnings: ContentWarning[];
  initialized: boolean;
  lastUpdate: number;
}

// ============================================
// Global State (using globalThis)
// ============================================

const ERROR_STATE_KEY = '__astro_error_state__';

function getState(): ErrorWarningState {
  if (!(globalThis as any)[ERROR_STATE_KEY]) {
    (globalThis as any)[ERROR_STATE_KEY] = {
      errors: [] as ContentError[],
      warnings: [] as ContentWarning[],
      initialized: false,
      lastUpdate: 0,
    };
  }
  return (globalThis as any)[ERROR_STATE_KEY];
}

// ============================================
// Error/Warning Management
// ============================================

/**
 * Add an error
 */
export function addError(error: Omit<ContentError, 'timestamp'>): void {
  const state = getState();

  // Avoid duplicates
  const exists = state.errors.some(
    e => e.file === error.file && e.message === error.message && e.line === error.line
  );

  if (!exists) {
    state.errors.push({
      ...error,
      timestamp: Date.now(),
    });
    state.lastUpdate = Date.now();
  }
}

/**
 * Add a warning
 */
export function addWarning(warning: Omit<ContentWarning, 'timestamp'>): void {
  const state = getState();

  // Avoid duplicates
  const exists = state.warnings.some(
    w => w.file === warning.file && w.message === warning.message
  );

  if (!exists) {
    state.warnings.push({
      ...warning,
      timestamp: Date.now(),
    });
    state.lastUpdate = Date.now();
  }
}

/**
 * Get all errors
 */
export function getErrors(): ContentError[] {
  return [...getState().errors];
}

/**
 * Get all warnings
 */
export function getWarnings(): ContentWarning[] {
  return [...getState().warnings];
}

/**
 * Get errors and warnings combined
 */
export function getAllIssues(): { errors: ContentError[]; warnings: ContentWarning[] } {
  return {
    errors: getErrors(),
    warnings: getWarnings(),
  };
}

/**
 * Get error count
 */
export function getErrorCount(): number {
  return getState().errors.length;
}

/**
 * Get warning count
 */
export function getWarningCount(): number {
  return getState().warnings.length;
}

/**
 * Clear all errors and warnings
 */
export function clearErrors(): void {
  const state = getState();
  state.errors = [];
  state.warnings = [];
}

/**
 * Check if initialized
 */
export function isCacheInitialized(): boolean {
  return getState().initialized;
}

/**
 * Get statistics (for dev toolbar)
 */
export function getCacheStats(): {
  initialized: boolean;
  entryCount: number;
  errorCount: number;
  warningCount: number;
  lastUpdate: number;
} {
  const state = getState();
  return {
    initialized: state.initialized,
    entryCount: 0, // No longer tracking entries here
    errorCount: state.errors.length,
    warningCount: state.warnings.length,
    lastUpdate: state.lastUpdate,
  };
}

// ============================================
// Export state for API endpoint
// ============================================

export function getCacheState(): ErrorWarningState & { entries: Map<string, any> } {
  return {
    ...getState(),
    entries: new Map(), // Empty for backward compatibility
  };
}

export default {
  addError,
  addWarning,
  getErrors,
  getWarnings,
  getAllIssues,
  getErrorCount,
  getWarningCount,
  clearErrors,
  isCacheInitialized,
  getCacheStats,
  getCacheState,
};
