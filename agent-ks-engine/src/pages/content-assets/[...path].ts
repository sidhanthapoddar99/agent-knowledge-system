/**
 * Dynamic route to serve colocated files from inside content data dirs.
 *
 * The shared `asset-src` postprocessor rewrites relative image srcs in content
 * (docs, blog, issues) to `/content-assets/<path-relative-to-the-content-root>`;
 * this endpoint serves those files. All content-category dirs (site.yaml
 * `paths:` keys whose category is 'content', e.g. `data` / `data2`) are searched
 * in order (first match wins), mirroring `/assets/[...path].ts` and superseding
 * the former issues-only `/issue-assets/` route.
 *
 * Markdown and `settings.json` are never served — they have HTML routes / are
 * internal metadata respectively. (Astro excludes `_`-prefixed dirs under
 * `src/pages` from routing, so the prefix can't be underscored; the static
 * `content-assets` segment still wins route priority over a `[...slug]`
 * catch-all.)
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'fs';
import path from 'path';
import { getPathsByCategory } from '@loaders/paths';
import { mimeTypes } from '../lib/mime';

/** Files that must not be served raw out of content folders. */
function isServable(filename: string): boolean {
  if (filename.startsWith('.')) return false;
  if (/\.(md|mdx)$/i.test(filename)) return false;
  if (filename === 'settings.json' || filename === 'settings.jsonc') return false;
  return true;
}

/** Data dirs (absolute, alias-resolved at config load) of category 'content'. */
function getContentDirs(): string[] {
  return getPathsByCategory('content');
}

function getAllServableFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dirPath)) return files;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getAllServableFiles(path.join(dirPath, entry.name), relativePath));
    } else if (entry.isFile() && isServable(entry.name)) {
      files.push(relativePath);
    }
  }
  return files;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const seen = new Set<string>();
  const paths: { params: { path: string } }[] = [];

  for (const dir of getContentDirs()) {
    for (const file of getAllServableFiles(dir)) {
      if (!seen.has(file)) {
        seen.add(file);
        paths.push({ params: { path: file } });
      }
    }
  }
  return paths;
};

export const GET: APIRoute = async ({ params, request }) => {
  const filePath = params.path;
  if (!filePath || !isServable(path.basename(filePath))) {
    return new Response('Not found', { status: 404 });
  }

  let fullPath: string | null = null;
  for (const dir of getContentDirs()) {
    const normalized = path.normalize(path.join(dir, filePath));
    if (!fs.existsSync(normalized) || !fs.statSync(normalized).isFile()) continue;

    // Security: compare realpaths (symlink-proof) and require containment at a
    // path-segment boundary, so a sibling dir sharing the prefix can't match.
    const real = fs.realpathSync(normalized);
    const realDir = fs.realpathSync(dir);
    const rel = path.relative(realDir, real);
    if (rel.startsWith('..') || path.isAbsolute(rel)) continue;

    fullPath = real;
    break;
  }

  if (!fullPath) {
    return new Response('Not found', { status: 404 });
  }

  const stat = fs.statSync(fullPath);
  const etag = `"${stat.size}-${stat.mtimeMs}"`;
  const lastModified = stat.mtime.toUTCString();

  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  return new Response(fs.readFileSync(fullPath), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      // Dev: always revalidate (ETag → cheap 304) so edits show on plain
      // reload. Immutable long cache is for production only.
      'Cache-Control': import.meta.env.DEV ? 'no-cache' : 'public, max-age=31536000',
      'ETag': etag,
      'Last-Modified': lastModified,
    },
  });
};
