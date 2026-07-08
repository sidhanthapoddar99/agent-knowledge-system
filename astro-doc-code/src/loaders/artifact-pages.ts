/**
 * First-class artifact pages
 *
 * `NN_`-prefixed `.html` files in a docs section render as first-class pages —
 * same sidebar, same routing as markdown. Artifacts are self-contained HTML
 * documents (reports, dashboards, design-system showcases). The page body is a
 * by-reference `.artifact` container; the BaseLayout client script
 * (`scripts/artifacts.ts`) turns it into an `<iframe>` whose `src` is the
 * reserved `/artifacts/<path>` full-page route, so the same document is both
 * embedded in the docs content area and openable full-page at its own URL.
 *
 * Metadata: an optional sibling `NN_name.meta.json` / `.meta.jsonc` sidecar
 * carries what frontmatter would (title / description / sidebar_label /
 * sidebar_position / draft), plus an `embed_height` rendering override and an
 * opaque `artifact:` block of AI-legibility declared values (purpose, palette,
 * key data) the loader passes through onto the entry untouched. Without a
 * sidecar, the title derives from the filename (strip prefix, title-case).
 *
 * Theme mode: `artifact.theme` inside that block selects `"site"` (the artifact
 * inherits the host site's resolved theme — the `/artifacts` route injects the
 * theme CSS before `</head>`) or `"self"` (served byte-untouched; the artifact
 * owns its own world). Default `self`; the legacy `"self-world"` value reads as
 * `self`. The loader keeps the block opaque; the ROUTE interprets this one field
 * via `readArtifactThemeMode()` (exported below) so loader + route stay in sync.
 *
 * The `.meta.` infix is deliberate: a bare `NN_name.json` would collide with a
 * colocated data file the artifact itself fetches.
 *
 * Rules (mirroring diagram pages):
 * - `assets/` directories are never scanned — embed-only / working `.html`
 *   files live there.
 * - Files without an `NN_` prefix are skipped with a warning (unlike markdown
 *   they may be stray working exports, so this is not a hard error).
 * - A slug collision (e.g. `05_foo.md` + `05_foo.html`) renders an explicit
 *   collision error at that slug instead of silently picking a winner.
 * - Enabled by default; a docs section opts out with
 *   `"allow_artifact_pages": false` in its root `settings.json`.
 *
 * Trust: an artifact is first-party content served same-origin and rendered
 * unsandboxed (see the artifact-component brainstorm, Thread D). `text/html`
 * is scoped to the `/artifacts` route, never the shared MIME map.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { addWarning } from './cache';
import { readSettings } from './settings-file';
import { resolveSlugCollisions } from './first-class-page';
import { parseOrderPrefix } from '../parsers/core/order-prefix';
import {
  resolveContentAssetUrl,
  CONTENT_ASSETS_URL_PREFIX,
} from '../parsers/postprocessors/asset-src';
import type { LoadedContent, ProcessContext } from '../parsers/types';

export const ARTIFACT_PAGE_GLOB = '**/*.html';

/** URL prefix of the reserved full-page artifact route. */
export const ARTIFACT_URL_PREFIX = '/artifacts';

/**
 * Sidecar metadata for an artifact. The rendering fields mirror the diagram
 * sidecar. `embed_height` is a rendering override (Thread C). `artifact` is an
 * opaque AI-legibility block — the loader never parses it, only passes it
 * through onto `entry.data.artifact`; its key conventions belong to the
 * agent-ks-artifacts skill, not the engine.
 */
interface ArtifactMeta {
  title?: string;
  description?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  draft?: boolean;
  /** `"full"` (default) | a CSS length (`"640px"`, `"80vh"`) | an aspect (`"16/9"`) | a pixel number. */
  embed_height?: number | string;
  /**
   * Opaque passthrough — declared values so an agent needn't parse the HTML.
   * One reserved key the engine *does* interpret: `artifact.theme`
   * (`"site" | "self"`, default `self`; legacy `"self-world"` → `self`) selects
   * host-theme injection at the `/artifacts` route — see `readArtifactThemeMode`.
   */
  artifact?: Record<string, unknown>;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "20_planning-overview" → "Planning Overview" */
function titleFromCleanName(cleanName: string): string {
  return cleanName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The two theme modes an artifact can declare in its sidecar `artifact.theme`. */
export type ArtifactThemeMode = 'site' | 'self';

/**
 * Normalize a raw sidecar `artifact.theme` value to a mode. Only `"site"` opts
 * into host-theme injection; everything else — `"self"`, the legacy
 * `"self-world"`, an unknown string, or an absent field — resolves to `"self"`
 * (served byte-untouched). Default-self keeps every pre-existing artifact and
 * any artifact arriving from elsewhere unaffected.
 */
export function normalizeArtifactThemeMode(value: unknown): ArtifactThemeMode {
  return value === 'site' ? 'site' : 'self';
}

/**
 * Resolve an artifact file's declared theme mode from its same-name sidecar.
 * Reads `<dir>/<basename>.meta.json` (`.meta.jsonc` preferred) and returns the
 * normalized `artifact.theme` mode. The `/artifacts` route calls this to decide
 * whether to inject the host theme CSS; a missing/invalid sidecar → `"self"`.
 */
export function readArtifactThemeMode(artifactFile: string): ArtifactThemeMode {
  const basename = path.basename(artifactFile, path.extname(artifactFile));
  const metaJson = path.join(path.dirname(artifactFile), `${basename}.meta.json`);
  const meta = readSettings<ArtifactMeta>(metaJson);
  return normalizeArtifactThemeMode(meta?.artifact?.theme);
}

/** Same slug rules as markdown: strip `.html`, clean the `NN_` prefix per segment. */
function artifactSlug(relativePath: string): string {
  return relativePath
    .replace(/\\/g, '/')
    .replace(/\.html$/i, '')
    .split('/')
    .map((segment) => parseOrderPrefix(segment).cleanName)
    .join('/');
}

/**
 * The `/artifacts/<path>` URL that serves this file's raw HTML. Reuses the
 * content-asset path resolution (path relative to the file's content root —
 * exactly what the route's `getStaticPaths` enumerates) and swaps the
 * `/content-assets` prefix for `/artifacts`. Returns null if the file is
 * outside every content root (never our route's to serve).
 */
function artifactUrl(file: string): string | null {
  const context = { fileDir: path.dirname(file) } as ProcessContext;
  const contentAssetUrl = resolveContentAssetUrl(`./${path.basename(file)}`, context);
  if (!contentAssetUrl) return null;
  return ARTIFACT_URL_PREFIX + contentAssetUrl.slice(CONTENT_ASSETS_URL_PREFIX.length);
}

/**
 * Translate an `embed_height` declared value into an inline container style.
 * `"full"`/undefined → no override (CSS viewport-fill default). A number or a
 * CSS length → a fixed height. An `"n/m"` aspect → `aspect-ratio` with auto
 * height (so the fixed-height default doesn't win).
 */
function embedHeightStyle(embedHeight: number | string | undefined): string {
  if (embedHeight === undefined || embedHeight === null || embedHeight === 'full') return '';
  if (typeof embedHeight === 'number' && Number.isFinite(embedHeight)) return `height:${embedHeight}px;`;
  const value = String(embedHeight).trim();
  if (!value) return '';
  if (/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/.test(value)) return `aspect-ratio:${value};height:auto;`;
  return `height:${value};`;
}

/**
 * Build the client-rendered `.artifact` container for an artifact file — a
 * by-reference placeholder (`data-src` = the `/artifacts/<path>` route with an
 * mtime `?v=` cache-buster, matching the diagram excalidraw form). The client
 * script builds the actual `<iframe>`. `title` defaults to the prefix-stripped,
 * title-cased filename.
 */
export function artifactContainerHtml(
  file: string,
  title?: string,
  embedHeight?: number | string
): string {
  const url = artifactUrl(file);
  const basename = path.basename(file, path.extname(file));
  const caption = title ?? titleFromCleanName(parseOrderPrefix(basename).cleanName);
  const version = Math.floor(fs.statSync(file).mtimeMs);
  const src = url ? `${url}?v=${version}` : '';
  const style = embedHeightStyle(embedHeight);
  const styleAttr = style ? ` style="${escapeHtml(style)}"` : '';
  return `<div class="artifact artifact-html" data-src="${escapeHtml(src)}" data-title="${escapeHtml(caption)}"${styleAttr}></div>`;
}

function collisionHtml(slug: string, paths: string[]): string {
  const list = paths.map((p) => `<li><code>${escapeHtml(p)}</code></li>`).join('');
  return (
    `<div class="artifact-error artifact">Slug collision at <code>/${escapeHtml(slug)}</code> — ` +
    `these files resolve to the same URL; rename one:<ul>${list}</ul></div>`
  );
}

/**
 * Scan a docs section for first-class artifact pages.
 *
 * `existingContent` (the section's markdown **and** already-loaded diagram
 * entries) is used for slug-collision detection, so an `.html` clashing with a
 * `.md` or a `.mmd` is caught against one shared pool.
 *
 * Returns the artifact entries plus every file that must invalidate the content
 * cache (artifact sources + sidecars).
 */
export async function loadArtifactPages(
  absolutePath: string,
  existingContent: LoadedContent[]
): Promise<{ entries: LoadedContent[]; dependencyFiles: string[] }> {
  const sectionSettings = readSettings<{ allow_artifact_pages?: boolean }>(absolutePath);
  if (sectionSettings?.allow_artifact_pages === false) {
    return { entries: [], dependencyFiles: [] };
  }

  const files = await glob(ARTIFACT_PAGE_GLOB, {
    cwd: absolutePath,
    absolute: true,
    ignore: '**/assets/**',
  });

  const entries: LoadedContent[] = [];
  const dependencyFiles: string[] = [];

  for (const file of files.sort()) {
    const relativePath = path.relative(absolutePath, file);

    const basename = path.basename(file, path.extname(file));
    const { position, cleanName } = parseOrderPrefix(basename);
    if (position === null) {
      addWarning({
        file: relativePath,
        type: 'config',
        message: `Artifact file has no NN_ position prefix — not rendered as a page`,
        suggestion:
          'Add a prefix (e.g. 20_dashboard.html) to make it a page, or move it into assets/ if it is embed-only',
      });
      continue;
    }

    dependencyFiles.push(file);

    // Optional sidecar: <dir>/<NN_name>.meta.json (readSettings prefers .jsonc).
    // Push whichever form actually exists into dependencyFiles — a .jsonc-only
    // sidecar edit must bust the section cache too (the diagram loader's bug at
    // diagram-pages.ts:165 pushed only the .json form; we don't repeat it).
    const metaJson = path.join(path.dirname(file), `${basename}.meta.json`);
    const metaJsonc = path.join(path.dirname(file), `${basename}.meta.jsonc`);
    const hasJson = fs.existsSync(metaJson);
    const hasJsonc = fs.existsSync(metaJsonc);
    const meta: ArtifactMeta = hasJson || hasJsonc ? readSettings<ArtifactMeta>(metaJson) ?? {} : {};
    if (hasJsonc) dependencyFiles.push(metaJsonc);
    if (hasJson) dependencyFiles.push(metaJson);

    const title = meta.title ?? titleFromCleanName(cleanName);
    // embed_height override: top-level (canonical) or inside the artifact: block
    // (Thread C names it artifact.embed_height) — support both, block stays opaque.
    const embedHeight = meta.embed_height ?? (meta.artifact?.embed_height as number | string | undefined);
    const html = artifactContainerHtml(file, title, embedHeight);

    const slug = artifactSlug(relativePath);
    entries.push({
      id: slug.replace(/\//g, '-') || 'index',
      slug,
      content: html,
      headings: [],
      data: {
        title,
        ...(meta.description ? { description: meta.description } : {}),
        ...(meta.sidebar_label ? { sidebar_label: meta.sidebar_label } : {}),
        sidebar_position: meta.sidebar_position ?? position,
        ...(meta.draft !== undefined ? { draft: meta.draft } : {}),
        // Opaque AI-legibility passthrough — never parsed by the engine.
        ...(meta.artifact ? { artifact: meta.artifact } : {}),
        artifact_page: true,
      },
      filePath: file,
      relativePath,
      fileType: 'artifact',
    });
  }

  // Slug collisions — across artifact entries and against markdown + diagram
  // pages (existingContent already includes both). Shared pool, shared pass.
  return {
    entries: resolveSlugCollisions(existingContent, entries, collisionHtml),
    dependencyFiles,
  };
}
