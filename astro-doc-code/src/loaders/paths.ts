/**
 * Path Resolver - Two-phase initialization
 *
 * Phase 1 (module load): Resolve internal structural paths (src, layouts, etc.).
 *   CONFIG_DIR may not be available yet (ES imports run before loadEnv()),
 *   so config/data/assets/themes are placeholders only.
 *
 * Phase 2 (initPaths): Called from astro.config.mjs after .env is loaded and
 *   site.yaml is parsed. Receives the authoritative configDir, reads the
 *   required `paths:` section, resolves relative to config dir. Errors on
 *   missing config — no silent fallbacks.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ============================================
// Project root resolution
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * The framework root — the directory that owns `src/`, i.e. `astro-doc-code/`.
 *
 * Found by walking UP from this module looking for the marker, rather than by
 * counting directory levels. This module runs from two very different places:
 * from source at `astro-doc-code/src/loaders/`, and from whatever path the
 * bundler emits during a build. Counting levels ties a source-tree fact to a
 * bundler layout detail, and that tie has already broken once — Astro 5 emitted
 * chunks at `dist/chunks/`, where `../..` happened to land on the framework
 * root; Astro 7 emits them at `dist/.prerender/chunks/`, one level deeper, so
 * the same expression resolved to `dist/` and every theme lookup went looking
 * for `dist/src/styles`.
 *
 * `src/styles/theme.yaml` is the marker because it is the one file the
 * framework root must contain for anything here to work at all — it is the
 * theme variable contract every layout is checked against.
 */
function findFrameworkRoot(startDir: string): string {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'src', 'styles', 'theme.yaml'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Nothing found: fall back to the historical guess so the failure surfaces as
  // the existing "theme directory not found" error naming a real-looking path,
  // rather than as an unrelated crash here.
  return path.resolve(startDir, '../..');
}

const frameworkRoot = findFrameworkRoot(__dirname);
//   frameworkRoot = <repo>/astro-doc-code (where src/ lives)
//   projectRoot   = <repo>/               (where default-docs/, .env live)
const projectRoot = path.resolve(frameworkRoot, '..');

// ============================================
// Env helper
// ============================================

const getEnv = (key: string, fallback: string): string => {
  if (typeof process !== 'undefined' && process.env[key]) {
    return process.env[key]!;
  }
  if (import.meta.env[key]) {
    return import.meta.env[key];
  }
  return fallback;
};

// ============================================
// Types
// ============================================

export type PathCategory = 'content' | 'asset' | 'config';

interface UserPathEntry {
  key: string;
  absolutePath: string;
  category: PathCategory;
}

// ============================================
// Phase 1: Module-load (structural paths only)
// ============================================

// CONFIG_DIR is read from .env but may NOT be available at module load time
// (ES imports run before loadEnv() in astro.config.mjs). The authoritative
// config path is set later by initPaths(). Phase 1 only uses it as a
// best-effort initial value for paths.config — never rely on it directly.
const CONFIG_DIR_EARLY = getEnv('CONFIG_DIR', '');

/**
 * Resolve a path relative to project root
 */
export function resolvePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(projectRoot, relativePath);
}

/**
 * Resolve a path relative to the config directory (where site.yaml lives).
 * Absolute paths are returned as-is.
 */
export function resolvePathFromConfig(relativePath: string): string {
  if (path.isAbsolute(relativePath)) {
    return relativePath;
  }
  return path.resolve(paths.config, relativePath);
}

// Phase 1 config dir: only set if CONFIG_DIR is in process.env at module load
// (true in SSR/render contexts after astro.config.mjs propagates it). In the
// build context, this is empty until initPaths() runs — that is fine because
// nothing should read paths.config before then. No hardcoded fallback —
// silent fallbacks mask misconfiguration; getConfigPath() throws if unset.
const earlyConfigDir = CONFIG_DIR_EARLY ? resolvePath(CONFIG_DIR_EARLY) : '';

/**
 * Resolved absolute paths for directories.
 * config/data/assets/themes are placeholders until initPaths() sets the real values.
 * Internal structural paths (src, layouts, etc.) are final at module load.
 */
export const paths: {
  root: string;
  config: string;
  src: string;
  layouts: string;
  loaders: string;
  hooks: string;
  modules: string;

  pages: string;
  styles: string;
  srcAssets: string;
} = {
  root: projectRoot,
  config: earlyConfigDir,
  src: path.resolve(frameworkRoot, 'src'),
  layouts: path.resolve(frameworkRoot, 'src/layouts'),
  loaders: path.resolve(frameworkRoot, 'src/loaders'),
  hooks: path.resolve(frameworkRoot, 'src/hooks'),
  modules: path.resolve(frameworkRoot, 'src/modules'),

  pages: path.resolve(frameworkRoot, 'src/pages'),
  styles: path.resolve(frameworkRoot, 'src/styles'),
  srcAssets: path.resolve(frameworkRoot, 'src/assets'),
};

// ============================================
// Phase 2: Dynamic user paths
// ============================================

/** Reserved alias keys that cannot be used in paths: section */
const RESERVED_KEYS = new Set(['docs', 'blog', 'issues', 'custom', 'navbar', 'footer', 'theme', 'config', 'root']);

// Use globalThis to persist state across Vite module reloads
// (astro.config.mjs and runtime may load this as separate module instances)
const PATHS_STATE_KEY = '__paths_state__';

interface PathsState {
  initialized: boolean;
  userPaths: Map<string, UserPathEntry>;
}

function getPathsState(): PathsState {
  if (!(globalThis as any)[PATHS_STATE_KEY]) {
    (globalThis as any)[PATHS_STATE_KEY] = {
      initialized: false,
      userPaths: new Map<string, UserPathEntry>(),
    };
  }
  return (globalThis as any)[PATHS_STATE_KEY];
}

/**
 * Infer category from key name.
 *  - keys starting with "data" or "content" → content
 *  - keys starting with "asset" → asset
 *  - "config" → config
 *  - anything else → content (safe default)
 */
export function getPathCategory(key: string): PathCategory {
  const k = key.toLowerCase();
  if (k === 'config') return 'config';
  if (k.startsWith('asset')) return 'asset';
  // data*, content*, themes*, or anything else defaults to content
  return 'content';
}

/**
 * Initialize user paths from site.yaml's `paths:` section.
 * Relative paths are resolved from the config directory (where site.yaml lives).
 * Idempotent — repeated calls are no-ops.
 *
 * @param siteConfig.configDir - Required. Resolved absolute path to the config directory.
 *   Must be passed explicitly because CONFIG_DIR from .env isn't available during
 *   ES module load of paths.ts (before loadEnv() runs in astro.config.mjs).
 * @param siteConfig.paths     - The paths: section from site.yaml. Required — at minimum
 *   `data` and `assets` must be defined.
 */
export function initPaths(siteConfig: { paths?: Record<string, string>; configDir: string }): void {
  const state = getPathsState();
  if (state.initialized) return;
  state.initialized = true;

  // configDir is required — set paths.config to the authoritative value
  const newConfigDir = path.isAbsolute(siteConfig.configDir)
    ? siteConfig.configDir
    : path.resolve(paths.root, siteConfig.configDir);
  (paths as any).config = newConfigDir;

  const rawPaths = siteConfig.paths;

  if (!rawPaths || Object.keys(rawPaths).length === 0) {
    throw new Error(
      `[paths] Missing "paths:" section in site.yaml.\n` +
      `  site.yaml must define directory paths. Add at minimum:\n` +
      `    paths:\n` +
      `      data: "../data"\n` +
      `      assets: "../assets"\n` +
      `      themes: "../themes"\n` +
      `  (paths are relative to the config directory: ${newConfigDir})`
    );
  }

  // site.yaml paths: section — resolve relative to config dir
  for (const [key, value] of Object.entries(rawPaths)) {
    if (RESERVED_KEYS.has(key)) {
      throw new Error(
        `[paths] Reserved alias key "${key}" cannot be used in site.yaml paths: section. ` +
        `Reserved keys: ${[...RESERVED_KEYS].join(', ')}`
      );
    }

    let absolutePath: string;
    if (value.startsWith('@root/') || value === '@root') {
      // Allow @root in user paths: values so users can compose paths against
      // the project root (e.g. default-docs: "@root/default-docs/data").
      // Other aliases are intentionally rejected — system aliases like @docs
      // are layout concepts, and allowing user-to-user references creates
      // declaration-ordering ambiguity.
      const subpath = value === '@root' ? '' : value.slice('@root/'.length);
      const joined = subpath ? path.join(projectRoot, subpath) : projectRoot;
      absolutePath = path.normalize(joined);
      const normalisedRoot = path.normalize(projectRoot);
      const inside =
        absolutePath === normalisedRoot ||
        absolutePath.startsWith(normalisedRoot + path.sep);
      if (!inside) {
        throw new Error(
          `[paths] @root path escapes project root in "${key}: ${value}" → "${absolutePath}" ` +
          `(must stay under ${normalisedRoot})`
        );
      }
    } else if (value.startsWith('@')) {
      throw new Error(
        `[paths] User path "${key}: ${value}" — only "@root" is supported as an alias in paths: values. ` +
        `User aliases cannot reference other user aliases (declaration-ordering ambiguity), and ` +
        `system layout aliases (@docs, @blog, @theme, …) are not meant for content paths.`
      );
    } else {
      absolutePath = resolvePathFromConfig(value);
    }

    if (!fs.existsSync(absolutePath)) {
      throw new Error(
        `[paths] Directory not found for "${key}": ${absolutePath}\n` +
        `  Configured as "${value}" in site.yaml paths: section.\n` +
        `  Resolved relative to config directory: ${newConfigDir}\n` +
        `  Create the directory or fix the path in site.yaml.`
      );
    }

    const category = getPathCategory(key);
    state.userPaths.set(key, { key, absolutePath, category });
  }

  // Ensure required keys are defined
  if (!state.userPaths.has('data')) {
    throw new Error(
      `[paths] Missing required "data" key in site.yaml paths: section.\n` +
      `  Add: data: "../data"  (relative to config directory)`
    );
  }
  if (!state.userPaths.has('assets')) {
    throw new Error(
      `[paths] Missing required "assets" key in site.yaml paths: section.\n` +
      `  Add: assets: "../assets"  (relative to config directory)`
    );
  }

  // Register config path in user paths
  state.userPaths.set('config', { key: 'config', absolutePath: newConfigDir, category: 'config' });
}

/**
 * Get all user-defined paths (available after initPaths).
 * Returns a new Map copy.
 */
export function getUserPaths(): Map<string, UserPathEntry> {
  return new Map(getPathsState().userPaths);
}

/**
 * Get absolute paths for a given category.
 */
export function getPathsByCategory(category: PathCategory): string[] {
  const result: string[] = [];
  for (const entry of getPathsState().userPaths.values()) {
    if (entry.category === category) {
      result.push(entry.absolutePath);
    }
  }
  return result;
}

/**
 * Whether initPaths() has been called.
 */
export function isInitialized(): boolean {
  return getPathsState().initialized;
}

// ============================================
// Path helpers (unchanged API)
// ============================================

/**
 * Get path to a config file
 */
export function getConfigPath(filename: string): string {
  if (!paths.config) {
    throw new Error(
      `[paths] paths.config is not set — cannot resolve "${filename}".\n` +
      `  This means CONFIG_DIR was not in process.env when paths.ts loaded ` +
      `AND initPaths() has not been called yet.\n` +
      `  Build context: astro.config.mjs must call initPaths() before any consumer reads config.\n` +
      `  SSR/render context: astro.config.mjs must propagate CONFIG_DIR to process.env so the ` +
      `early phase sees it (paths.ts has no hardcoded fallback by design).`
    );
  }
  return path.join(paths.config, filename);
}

/**
 * Get path to a layout package
 */
export function getLayoutPath(type: string, name: string): string {
  return path.join(paths.layouts, type, name);
}

/**
 * Convert an absolute path to an alias-based path for display.
 * Uses the dynamic userPaths map (longest match first) when initialized,
 * with fallback to structural pattern matching.
 */
export function toAliasPath(absolutePath: string): string {
  const normalizedPath = path.normalize(absolutePath);

  // Try user paths first (sorted longest-path-first to match @data2 before @data)
  const { userPaths } = getPathsState();
  if (userPaths.size > 0) {
    const sorted = [...userPaths.entries()].sort(
      (a, b) => b[1].absolutePath.length - a[1].absolutePath.length
    );
    for (const [key, entry] of sorted) {
      const dir = entry.absolutePath + path.sep;
      if (normalizedPath.startsWith(dir)) {
        return `@${key}/` + normalizedPath.slice(dir.length);
      }
      if (normalizedPath === entry.absolutePath) {
        return `@${key}`;
      }
    }
  }

  // Match /src/styles/ for @theme/default alias
  const stylesMatch = normalizedPath.match(/[/\\]src[/\\]styles[/\\](.+)$/);
  if (stylesMatch) {
    return '@theme/default/' + stylesMatch[1];
  }

  // Match /src/ for @src alias
  const srcMatch = normalizedPath.match(/[/\\]src[/\\](.+)$/);
  if (srcMatch) {
    return '@src/' + srcMatch[1];
  }

  // Return relative to project root if no alias matches
  const normalizedRoot = path.normalize(paths.root);
  if (normalizedPath.startsWith(normalizedRoot + path.sep)) {
    return normalizedPath.slice(normalizedRoot.length + 1);
  }

  return absolutePath;
}

export default paths;
