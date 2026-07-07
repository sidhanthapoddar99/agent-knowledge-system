/**
 * First-class diagram pages
 *
 * `.mmd` / `.mermaid` / `.dot` / `.gv` / `.excalidraw` files following the
 * `XX_` prefix convention render as first-class docs pages — same sidebar,
 * same routing as markdown. The page body is the same `.diagram` container
 * the embeds emit, so the BaseLayout client script renders it with zero new
 * machinery (mermaid/graphviz carry their source inline; excalidraw carries
 * a `data-src` URL and is fetched client-side).
 *
 * Metadata: an optional sibling `XX_name.meta.json` sidecar carries what
 * frontmatter would (title / description / sidebar_label / sidebar_position /
 * draft). Without one, the title derives from the filename (strip prefix,
 * title-case) — the sidecar exists only when the name isn't enough.
 *
 * Rules:
 * - `assets/` directories are never scanned — embed-only diagrams live there.
 * - Files without an `XX_` prefix are skipped with a warning (unlike markdown
 *   they may be stray working files, so this is not a hard error).
 * - A slug collision (e.g. `01_foo.md` + `01_foo.mmd`) renders an explicit
 *   collision error at that slug instead of silently picking a winner.
 * - Enabled by default; a docs section opts out with
 *   `"allow_diagram_pages": false` in its root `settings.json`.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { addWarning } from './cache';
import { readSettings } from './settings-file';
import { resolveSlugCollisions } from './first-class-page';
import { parseOrderPrefix } from '../parsers/core/order-prefix';
import { resolveContentAssetUrl } from '../parsers/postprocessors/asset-src';
import type { LoadedContent } from '../parsers/types';
import type { ProcessContext } from '../parsers/types';

const DIAGRAM_KINDS: Record<string, 'mermaid' | 'graphviz' | 'excalidraw'> = {
  '.mmd': 'mermaid',
  '.mermaid': 'mermaid',
  '.dot': 'graphviz',
  '.gv': 'graphviz',
  '.excalidraw': 'excalidraw',
};

export const DIAGRAM_PAGE_GLOB = '**/*.{mmd,mermaid,dot,gv,excalidraw}';

/** Lowercase diagram file extensions, dot included (`.mmd`, …). */
export const DIAGRAM_EXTENSIONS = Object.keys(DIAGRAM_KINDS);

/**
 * Build the client-rendered `.diagram` container for a diagram file — the
 * same container the embed postprocessor emits (mermaid/graphviz inline
 * their escaped source; excalidraw carries a `data-src` URL with an mtime
 * `?v=` cache-buster). Returns null when the extension isn't a diagram
 * type. `title` defaults to the prefix-stripped, title-cased filename.
 */
export function diagramContainerHtml(file: string, title?: string): string | null {
  const kind = DIAGRAM_KINDS[path.extname(file).toLowerCase()];
  if (!kind) return null;

  if (kind === 'excalidraw') {
    const context = { fileDir: path.dirname(file) } as ProcessContext;
    const url = resolveContentAssetUrl(`./${path.basename(file)}`, context);
    const basename = path.basename(file, path.extname(file));
    const caption = title ?? titleFromCleanName(parseOrderPrefix(basename).cleanName);
    const version = Math.floor(fs.statSync(file).mtimeMs);
    return `<div class="diagram diagram-excalidraw" data-src="${escapeHtml(url ? `${url}?v=${version}` : '')}" data-title="${escapeHtml(caption)}"></div>`;
  }

  const source = fs.readFileSync(file, 'utf-8');
  return `<div class="diagram diagram-${kind}">${escapeHtml(source)}</div>`;
}

interface DiagramMeta {
  title?: string;
  description?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  draft?: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** "20_system-architecture" → "System Architecture" */
function titleFromCleanName(cleanName: string): string {
  return cleanName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Same slug rules as markdown: strip extension, clean `XX_` per segment. */
function diagramSlug(relativePath: string): string {
  return relativePath
    .replace(/\\/g, '/')
    .replace(/\.(mmd|mermaid|dot|gv|excalidraw)$/i, '')
    .split('/')
    .map((segment) => parseOrderPrefix(segment).cleanName)
    .join('/');
}

function collisionHtml(slug: string, paths: string[]): string {
  const list = paths.map((p) => `<li><code>${escapeHtml(p)}</code></li>`).join('');
  return (
    `<div class="diagram-error diagram">Slug collision at <code>/${escapeHtml(slug)}</code> — ` +
    `these files resolve to the same URL; rename one:<ul>${list}</ul></div>`
  );
}

/**
 * Scan a docs section for first-class diagram pages.
 *
 * `existingContent` (the section's markdown entries) is used for slug
 * collision detection; a colliding markdown entry gets its body replaced
 * with the collision error in place.
 *
 * Returns the diagram entries plus every file that must invalidate the
 * content cache (diagram sources + sidecars).
 */
export async function loadDiagramPages(
  absolutePath: string,
  existingContent: LoadedContent[]
): Promise<{ entries: LoadedContent[]; dependencyFiles: string[] }> {
  const sectionSettings = readSettings<{ allow_diagram_pages?: boolean }>(absolutePath);
  if (sectionSettings?.allow_diagram_pages === false) {
    return { entries: [], dependencyFiles: [] };
  }

  const files = await glob(DIAGRAM_PAGE_GLOB, {
    cwd: absolutePath,
    absolute: true,
    ignore: '**/assets/**',
  });

  const entries: LoadedContent[] = [];
  const dependencyFiles: string[] = [];

  for (const file of files.sort()) {
    const relativePath = path.relative(absolutePath, file);
    const ext = path.extname(file).toLowerCase();
    const kind = DIAGRAM_KINDS[ext];
    if (!kind) continue;

    const basename = path.basename(file, path.extname(file));
    const { position, cleanName } = parseOrderPrefix(basename);
    if (position === null) {
      addWarning({
        file: relativePath,
        type: 'config',
        message: `Diagram file has no XX_ position prefix — not rendered as a page`,
        suggestion: 'Add a prefix (e.g. 20_architecture.mmd) to make it a page, or move it into assets/ if it is embed-only',
      });
      continue;
    }

    dependencyFiles.push(file);

    // Optional sidecar: <dir>/<XX_name>.meta.json (readSettings prefers .jsonc)
    const sidecarPath = path.join(path.dirname(file), `${basename}.meta.json`);
    const meta = fs.existsSync(sidecarPath) || fs.existsSync(sidecarPath.replace(/\.json$/, '.jsonc'))
      ? readSettings<DiagramMeta>(sidecarPath) ?? {}
      : {};
    if (fs.existsSync(sidecarPath)) dependencyFiles.push(sidecarPath);

    const html = diagramContainerHtml(file, meta.title ?? titleFromCleanName(cleanName))!;

    const slug = diagramSlug(relativePath);
    entries.push({
      id: slug.replace(/\//g, '-') || 'index',
      slug,
      content: html,
      headings: [],
      data: {
        title: meta.title ?? titleFromCleanName(cleanName),
        ...(meta.description ? { description: meta.description } : {}),
        ...(meta.sidebar_label ? { sidebar_label: meta.sidebar_label } : {}),
        sidebar_position: meta.sidebar_position ?? position,
        ...(meta.draft !== undefined ? { draft: meta.draft } : {}),
        diagram_kind: kind,
      },
      filePath: file,
      relativePath,
      fileType: 'diagram',
    });
  }

  // Slug collisions — across diagram entries and against markdown pages, via
  // the shared pool/pass so diagrams and artifacts can't silently claim the
  // same URL. The surviving entry renders an explicit collision error.
  return {
    entries: resolveSlugCollisions(existingContent, entries, collisionHtml),
    dependencyFiles,
  };
}
