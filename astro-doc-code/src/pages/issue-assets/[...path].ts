/**
 * Dynamic route to serve colocated files from inside issue-tracker data dirs.
 *
 * The `issue-asset-src` postprocessor rewrites relative image srcs in issues
 * content to `/issue-assets/<path-relative-to-tracker-root>`; this endpoint
 * serves those files. All configured `type: issues` pages' data dirs are
 * searched in order (first match wins), mirroring `/assets/[...path].ts`.
 * (Astro excludes `_`-prefixed dirs under `src/pages` from routing, so the
 * prefix can't be underscored; the static `issue-assets` segment still wins
 * route priority over the `[...slug]` catch-all.)
 *
 * Markdown and `settings.json` are never served — they have HTML routes /
 * are internal metadata respectively.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'fs';
import path from 'path';
import { loadSiteConfig } from '@loaders/index';
import { mimeTypes } from '../lib/mime';

/** Files that must not be served raw out of issue folders. */
function isServable(filename: string): boolean {
  if (filename.startsWith('.')) return false;
  if (/\.(md|mdx)$/i.test(filename)) return false;
  if (filename === 'settings.json') return false;
  return true;
}

/** Data dirs (absolute, alias-resolved at config load) of all issues pages. */
function getIssueDataDirs(): string[] {
  const pages = (loadSiteConfig() as { pages?: Record<string, any> }).pages || {};
  return Object.values(pages)
    .filter((p: any) => p?.type === 'issues' && typeof p?.data === 'string')
    .map((p: any) => p.data as string);
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

  for (const dir of getIssueDataDirs()) {
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
  for (const dir of getIssueDataDirs()) {
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
      'Cache-Control': 'public, max-age=31536000',
      'ETag': etag,
      'Last-Modified': lastModified,
    },
  });
};
