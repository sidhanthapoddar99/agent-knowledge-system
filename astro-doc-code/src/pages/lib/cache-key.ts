/**
 * Cache keys for Astro's `experimental.incrementalBuild`.
 *
 * Every entry `buildStaticPaths()` returns may carry a `cacheKey`. On the next
 * build Astro skips re-rendering a path when **all** of these still match:
 *
 *   1. the route component's module dependency hash (Astro computes it),
 *   2. the resolved Astro config + lockfile hashes (Astro computes them),
 *   3. this `cacheKey` (ours).
 *
 * ## The one thing to understand before editing this file
 *
 * **`props` are not part of the comparison.** Astro hashes the key you return
 * and nothing else about the entry. So a page whose render reads something the
 * key does not name will be served from the previous build **with no error and
 * no warning** — stale HTML that looks entirely healthy. Every input a render
 * touches has to appear here, or it is a silent-staleness bug.
 *
 * ## What a render here actually reads, which is not what its props contain
 *
 * The props are misleading on their own: the docs layout ignores the
 * `allContent` prop and calls `loadContentWithSettings(dataPath)` itself
 * (`layouts/docs/default/Layout.astro`), and `BaseLayout` calls
 * `loadSiteConfig()` on every page. The dependencies are therefore:
 *
 * | Surface           | Reads                                                  |
 * |-------------------|--------------------------------------------------------|
 * | every page        | `site.yaml`, `navbar.yaml`, `footer.yaml`, theme CSS    |
 * | docs page         | its own record **and** its section's sidebar shape      |
 * | blog post         | its own record                                          |
 * | blog index        | every post's shape                                      |
 * | issues detail/sub | the whole issue object (nav tree spans its sub-docs)    |
 * | issues index      | every issue's metadata                                  |
 * | custom page       | its YAML data file                                      |
 * | a redirect        | only its target — it returns before any layout runs     |
 *
 * None of those files are in the module graph, so Astro's own hashes do not
 * cover a single one of them. That is what `chromeSalt()` and the per-section
 * salts below are for.
 *
 * ## Why a docs key is not simply "the whole section"
 *
 * The sidebar depends on every document in its section, so the naive reading is
 * that editing one page must invalidate all of them. But the sidebar only reads
 * `slug`, `title`, `sidebar_label`, `sidebar_position` and `fileType` — never a
 * body (`hooks/useSidebar.ts → buildSidebarTree`). So the section salt hashes
 * that *shape* alone, and editing a body leaves it untouched. Per-page
 * granularity falls out without restructuring how the sidebar gets its data.
 *
 * Renaming or re-titling a page does change the shape, and then every page in
 * the section rebuilds. That is correct: their sidebars really did change.
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfigPath } from '@loaders/paths';

/** Built-in theme directory — CSS read at render time, never imported. */
const BUILTIN_STYLES_DIR = fileURLToPath(new URL('../../styles', import.meta.url));

const THEME_FILE = /\.(css|yaml|yml)$/;

function digest(update: (h: import('node:crypto').Hash) => void): string {
  const h = createHash('sha1');
  update(h);
  return h.digest('base64url').slice(0, 22);
}

/**
 * `JSON.stringify` with object keys sorted, so an unrelated change in property
 * order cannot invalidate every page in the tracker.
 */
function stable(value: unknown): string {
  return JSON.stringify(value, (_key, val) =>
    val && typeof val === 'object' && !Array.isArray(val)
      ? Object.fromEntries(Object.entries(val).sort(([a], [b]) => (a < b ? -1 : 1)))
      : val,
  ) ?? 'undefined';
}

function walk(dir: string, match: (file: string) => boolean, out: string[] = []): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, match, out);
    else if (match(full)) out.push(full);
  }
  return out;
}

/** Hash file *contents*, not mtimes — the key must survive a fresh checkout. */
function hashFiles(files: string[]): string {
  return digest((h) => {
    for (const file of [...files].sort()) {
      h.update(file);
      h.update('\0');
      try {
        h.update(fs.readFileSync(file));
      } catch {
        h.update('<missing>');
      }
      h.update('\0');
    }
  });
}

let chromeSaltCache: string | null = null;

/**
 * Everything every page renders regardless of its content: the three config
 * files and every theme stylesheet on the scan path.
 */
export function chromeSalt(siteConfig: { theme_paths?: string[] }): string {
  if (chromeSaltCache) return chromeSaltCache;
  const files = ['site.yaml', 'navbar.yaml', 'footer.yaml'].map((name) => getConfigPath(name));
  files.push(...walk(BUILTIN_STYLES_DIR, (f) => THEME_FILE.test(f)));
  for (const dir of siteConfig.theme_paths ?? []) {
    files.push(...walk(dir, (f) => THEME_FILE.test(f)));
  }
  chromeSaltCache = hashFiles(files);
  return chromeSaltCache;
}

/**
 * The part of a docs section that every page in it renders: the sidebar tree
 * and the section's own `settings.json` (outline + pagination switches).
 * Deliberately excludes bodies — see the header.
 */
export function docsSectionSalt(dataPath: string, content: any[]): string {
  const shape = content.map((doc) => [
    doc.slug,
    doc.relativePath,
    doc.fileType,
    doc.data?.title ?? '',
    doc.data?.sidebar_label ?? '',
    doc.data?.sidebar_position ?? '',
  ]);
  const settings = walk(dataPath, (f) => /(^|[\\/])settings\.jsonc?$/.test(f));
  return digest((h) => {
    h.update(stable(shape));
    h.update('\0');
    h.update(hashFiles(settings));
  });
}

/** A content record's full render input: rendered HTML, frontmatter, headings. */
export function recordSalt(item: any): string {
  return digest((h) => {
    h.update(item?.content ?? '');
    h.update('\0');
    h.update(stable(item?.data));
    h.update('\0');
    h.update(stable(item?.headings));
    h.update('\0');
    h.update(item?.fileType ?? '');
  });
}

/** Hash of an arbitrary loaded object — used where a layout renders all of it. */
export function objectSalt(value: unknown): string {
  return digest((h) => h.update(stable(value)));
}

/** Hash of a single file's contents, for data a layout loads by path. */
export function fileSalt(file: string): string {
  return hashFiles([file]);
}

/** Compose the parts of one page's key. Order is fixed; parts are `\0`-joined. */
export function key(...parts: (string | number | undefined)[]): string {
  return digest((h) => h.update(parts.map((p) => p ?? '').join('\0')));
}
