/**
 * Unified Data Loader
 *
 * Loads content using the modular parser system with:
 * - mtime-based caching (no hash computation)
 * - Dependency tracking for selective invalidation
 * - Error/warning collection
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { getParser } from '../parsers';
import { parseOrderPrefix } from '../parsers/core/order-prefix';
import { loadDiagramPages } from './diagram-pages';
import {
  ParserError,
  type ContentType,
  type LoadedContent,
  type LoadOptions,
  type ContentSettings,
} from '../parsers/types';
import cacheManager from './cache-manager';
import { parseJsonc, resolveSettingsPath } from './settings-file';

// Keep error functions from old cache for compatibility
import { addError, addWarning } from './cache';

// Re-export types from parsers for backward compatibility
export type { LoadedContent, LoadOptions, ContentSettings, Heading } from '../parsers/types';
export { ParserError as DataLoaderError } from '../parsers/types';

// Re-export clearSettingsCache for backward compatibility
export { clearSettingsCache } from './cache-manager';

// ============================================
// Sorting
// ============================================

// Build a per-segment position tuple from an entry's relative path so flat
// sort respects folder hierarchy. Each folder segment contributes its XX_
// prefix (or 999 if absent); the file segment uses sidebar_position so a
// frontmatter override still wins. Without this, two `01_` files in different
// top-level folders tie and fall back to glob order — which is how the wrong
// page can win the default-route redirect.
function pathPositionTuple(item: LoadedContent): number[] {
  const segments = item.relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
  if (segments.length === 0) return [item.data.sidebar_position ?? 999];
  const tuple: number[] = [];
  for (let i = 0; i < segments.length - 1; i++) {
    tuple.push(parseOrderPrefix(segments[i]).position ?? 999);
  }
  tuple.push(item.data.sidebar_position ?? 999);
  return tuple;
}

function compareTuples(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

function sortContent(
  content: LoadedContent[],
  sort: LoadOptions['sort'],
  order: LoadOptions['order'] = 'asc'
): LoadedContent[] {
  const sorted = [...content].sort((a, b) => {
    let comparison = 0;

    switch (sort) {
      case 'position':
        comparison = compareTuples(pathPositionTuple(a), pathPositionTuple(b));
        if (comparison === 0) {
          comparison = a.relativePath.localeCompare(b.relativePath);
        }
        break;

      case 'date':
        const dateA = a.data.date ? new Date(a.data.date).getTime() : 0;
        const dateB = b.data.date ? new Date(b.data.date).getTime() : 0;
        comparison = dateA - dateB;
        break;

      case 'title':
      case 'alphabetical':
        comparison = (a.data.title || '').localeCompare(b.data.title || '');
        break;

      default:
        comparison = 0;
    }

    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

// ============================================
// Error Collection Helpers
// ============================================

function collectContentWarnings(content: LoadedContent, relativePath: string): void {
  // Check for missing description
  if (!content.data.description) {
    addWarning({
      file: relativePath,
      type: 'missing-description',
      message: "Missing 'description' in frontmatter",
      suggestion: 'Add description for better SEO',
    });
  }

  // Check for draft content
  if (content.data.draft) {
    addWarning({
      file: relativePath,
      type: 'draft',
      message: 'Document is marked as draft',
      suggestion: 'Remove draft: true when ready to publish',
    });
  }
}

// ============================================
// Main Loading Functions
// ============================================

/**
 * Load content from a directory with mtime-based caching
 */
export async function loadContent(
  dataPath: string,
  contentType: ContentType = 'docs',
  options: LoadOptions = {}
): Promise<LoadedContent[]> {
  const {
    pattern = '**/*.{md,mdx}',
    sort = 'position',
    order = 'asc',
    filter,
    includeDrafts = !import.meta.env.PROD,
    maxDepth,
    requirePositionPrefix = false,
  } = options;

  // Resolve the data path
  if (!path.isAbsolute(dataPath)) {
    throw new Error(`Expected absolute data path, got "${dataPath}". Data paths should be resolved at config load time.`);
  }
  const absolutePath = dataPath;

  // Generate cache key (include sort for proper caching)
  const cacheKey = `${absolutePath}:${pattern}:${contentType}:${sort}:${order}`;

  // Check cache first (uses mtime-based validation)
  const cached = cacheManager.getCached<LoadedContent[]>('content', cacheKey);
  if (cached) {
    // Return cached content (already sorted)
    let content = [...cached];

    // Filter drafts (may change between requests in dev)
    if (!includeDrafts) {
      content = content.filter((item) => !item.data.draft);
    }

    // Apply custom filter
    if (filter) {
      content = content.filter(filter);
    }

    return content;
  }

  // Check if directory exists
  if (!fs.existsSync(absolutePath)) {
    addError({
      file: absolutePath,
      type: 'config',
      message: `Content directory not found: ${absolutePath}`,
      suggestion: 'Check the data path in your configuration',
    });
    throw new ParserError({
      code: 'DIR_NOT_FOUND',
      path: absolutePath,
      message: `Content directory not found: ${absolutePath}`,
    });
  }

  // Get parser for content type
  const parser = getParser(contentType);

  // Find files
  const files = await glob(pattern, {
    cwd: absolutePath,
    absolute: true,
    maxDepth,
  });

  // Parse files and collect errors
  let content: LoadedContent[] = [];
  const missingPrefixFiles: string[] = [];

  for (const file of files) {
    try {
      // No hash computation - mtime-based validation instead
      const parsed = await parser.parse(file, absolutePath);
      if (parsed) {
        // Check for required position prefix (docs only)
        if (requirePositionPrefix && contentType === 'docs') {
          const filename = path.basename(file, path.extname(file));
          const hasPrefix = parser.hasPositionPrefix(filename);
          if (!hasPrefix && filename !== 'index') {
            missingPrefixFiles.push(parsed.relativePath);
            addError({
              file: parsed.relativePath,
              type: 'config',
              message: `File missing required XX_ position prefix`,
              suggestion: 'Rename file with position prefix (e.g., 01_filename.md)',
            });
          }
        }

        // Collect warnings for this content
        collectContentWarnings(parsed, parsed.relativePath);

        content.push(parsed);
      }
    } catch (error) {
      const relativePath = path.relative(absolutePath, file);
      if (error instanceof ParserError) {
        addError({
          file: relativePath,
          type: 'syntax',
          message: error.message,
        });
      } else if (error instanceof Error) {
        addError({
          file: relativePath,
          type: 'unknown',
          message: error.message,
        });
      }
      // Continue processing other files
      console.error(`Error parsing ${file}:`, error);
    }
  }

  // Throw error if prefix validation fails (but errors are still collected)
  if (requirePositionPrefix && missingPrefixFiles.length > 0) {
    throw new ParserError({
      code: 'MISSING_POSITION_PREFIX',
      path: absolutePath,
      message:
        `\n[DOCS ERROR] Files missing required XX_ position prefix:\n` +
        missingPrefixFiles.map(f => `  - ${f}`).join('\n') +
        `\n\nDocs files must be named with a position prefix (01-99).\n` +
        `Examples:\n` +
        `  01_getting-started.mdx\n` +
        `  02_installation.mdx\n` +
        `  guides/01_configuration.mdx\n`,
    });
  }

  // First-class diagram pages (.mmd/.dot/.excalidraw with XX_ prefix) —
  // docs sections only, opt-out via `allow_diagram_pages: false` in the
  // section root settings.json. Handles slug-collision errors in place.
  let dependencyFiles: string[] = [];
  if (contentType === 'docs') {
    const diagramPages = await loadDiagramPages(absolutePath, content);
    content.push(...diagramPages.entries);
    dependencyFiles = diagramPages.dependencyFiles;
  }

  // Sort content
  content = sortContent(content, sort, order);

  // Store in cache with file dependencies (for mtime-based validation)
  cacheManager.setCache('content', cacheKey, content, [...files, ...dependencyFiles]);

  // Filter drafts
  if (!includeDrafts) {
    content = content.filter((item) => !item.data.draft);
  }

  // Apply custom filter
  if (filter) {
    content = content.filter(filter);
  }

  return content;
}

/**
 * Load a single file (no caching - single file load is fast)
 */
export async function loadFile(
  filePath: string,
  contentType: ContentType = 'docs'
): Promise<LoadedContent> {
  // Resolve the file path
  if (!path.isAbsolute(filePath)) {
    throw new Error(`Expected absolute file path, got "${filePath}". File paths should be resolved at config load time.`);
  }
  const absolutePath = filePath;

  // Check if file exists
  if (!fs.existsSync(absolutePath)) {
    addError({
      file: filePath,
      type: 'config',
      message: `Content file not found: ${absolutePath}`,
      suggestion: 'Check the file path',
    });
    throw new ParserError({
      code: 'FILE_NOT_FOUND',
      path: absolutePath,
      message: `Content file not found: ${absolutePath}`,
    });
  }

  // Get parser for content type
  const parser = getParser(contentType);
  const basePath = path.dirname(absolutePath);

  try {
    const parsed = await parser.parse(absolutePath, basePath);

    if (!parsed) {
      throw new ParserError({
        code: 'UNSUPPORTED_FILE_TYPE',
        path: absolutePath,
        message: `Unsupported file type: ${absolutePath}`,
      });
    }

    return parsed;
  } catch (error) {
    if (error instanceof ParserError) {
      addError({
        file: filePath,
        type: 'syntax',
        message: error.message,
      });
    }
    throw error;
  }
}

// ============================================
// Settings Loading (with mtime-based caching)
// ============================================

/**
 * Load settings.json from a content directory
 */
export function loadSettings(dataPath: string): ContentSettings {
  if (!path.isAbsolute(dataPath)) {
    throw new Error(`Expected absolute data path, got "${dataPath}". Data paths should be resolved at config load time.`);
  }
  const absolutePath = dataPath;

  const settingsPath = resolveSettingsPath(absolutePath);

  // Default settings
  const defaultSettings: ContentSettings = {
    sidebar: {
      collapsed: false,
      collapsible: true,
      sort: 'position',
      depth: 3,
    },
    outline: {
      enabled: true,
      levels: [2, 3],
      title: 'On this page',
    },
    pagination: {
      enabled: true,
      showPrevNext: true,
    },
  };

  // Check cache with dependency on settings file
  const cached = cacheManager.getCached<ContentSettings>('settings', absolutePath);
  if (cached) {
    return cached;
  }

  if (!fs.existsSync(settingsPath)) {
    // Cache the default (no file dependency)
    cacheManager.setCache('settings', absolutePath, defaultSettings, []);
    return defaultSettings;
  }

  try {
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    const settings = parseJsonc<ContentSettings>(raw);

    // Merge with defaults
    const merged: ContentSettings = {
      sidebar: { ...defaultSettings.sidebar, ...settings.sidebar },
      outline: { ...defaultSettings.outline, ...settings.outline },
      pagination: { ...defaultSettings.pagination, ...settings.pagination },
    };

    // Cache with settings.json as dependency
    cacheManager.setCache('settings', absolutePath, merged, [settingsPath]);

    return merged;
  } catch (error) {
    addError({
      file: settingsPath,
      type: 'config',
      message: `Error loading settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      suggestion: 'Check settings.json syntax',
    });
    console.error(`Error loading settings from ${settingsPath}:`, error);
    return defaultSettings;
  }
}

/**
 * Load content with settings
 */
export async function loadContentWithSettings(
  dataPath: string,
  contentType: ContentType = 'docs',
  options?: LoadOptions
): Promise<{
  content: LoadedContent[];
  settings: ContentSettings;
}> {
  const [content, settings] = await Promise.all([
    loadContent(dataPath, contentType, options),
    Promise.resolve(loadSettings(dataPath)),
  ]);

  return { content, settings };
}

export default {
  loadContent,
  loadFile,
  loadSettings,
  loadContentWithSettings,
};
