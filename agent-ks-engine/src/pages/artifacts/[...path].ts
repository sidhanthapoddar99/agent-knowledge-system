/**
 * Reserved full-page artifact route.
 *
 * Serves an artifact `.html` file raw at
 * `/artifacts/<path-relative-to-its-content-root>` — full viewport, with its own
 * `<head>`, bookmarkable and shareable. This route is the *primitive* the whole
 * artifact feature is built on: the in-content embed's iframe points its `src`
 * here, and the embed's "open full page" button links here.
 *
 * Cloned from `content-assets/[...path].ts` (identical symlink-proof containment,
 * ETag/304, and dev-`no-cache` / prod-`public, max-age=31536000` caching) with
 * two deliberate differences:
 *
 *   1. `getStaticPaths` enumerates ONLY `.html` files across the content-category
 *      dirs, so this route's surface is exactly the artifacts — not every
 *      colocated file (images, css, …) the content-assets route serves.
 *   2. `Content-Type: text/html` is set LOCALLY here and is deliberately NOT
 *      added to the shared `lib/mime.ts` map. Adding `.html` there would make
 *      every colocated `.html` anywhere in content (docs, blog, the issue
 *      tracker) executable first-party HTML on the site origin. Scoping the MIME
 *      to this dedicated route keeps that origin-trust decision explicit and
 *      contained. See the artifact-component issue, brainstorm Threads D + F.
 *
 * No alias is registered for this route. A serving route is not a layout or a
 * `paths:` key, so `loaders/alias.ts` (@docs/@blog/…) and `RESERVED_KEYS` in
 * `loaders/paths.ts` need no entry — there is intentionally no `@artifacts`
 * alias. (Only if `artifacts` ever became a settable `paths:` key would
 * RESERVED_KEYS matter.)
 *
 * Route priority: the static `artifacts/` segment beats the `[...slug].astro`
 * catch-all (same as `content-assets/`); the folder can't be `_`-prefixed (Astro
 * drops `_`-dirs from routing). In dev/SSR, `route-match.ts` also lists
 * `artifacts` in `isInternalSlug` so `[...slug]` never tries to render it.
 *
 * Cache-busting handshake: the embed appends `?v=<mtimeMs>` to the iframe `src`
 * (mirroring the diagram sidecar). This route ignores the query for content, but
 * the changing `?v=` + ETag revalidation invalidate correctly in dev, and the
 * year-long prod `max-age` paired with the changing query invalidates correctly
 * on static hosts (which ignore the query for lookup but re-request when it
 * changes).
 *
 * Site-theme injection: when an artifact's sidecar declares
 * `artifact.theme: "site"` (see `loaders/artifact-pages.ts →
 * readArtifactThemeMode`), this route rewrites the served HTML to include the
 * ACTIVE resolved theme CSS (the theme loader's merged output, exactly what
 * `BaseLayout` injects into the docs chrome) before `</head>`, plus a small
 * attribute-only dark-mode init script mirroring `BaseLayout`. So the embed AND
 * the full-page view both inherit the host theme, and `var(--color-*)` /
 * semantic tokens resolve inside the artifact. `theme: "self"` (or no sidecar)
 * is served byte-untouched — the subtask-20 contract (served body === disk) now
 * applies to self mode only. The injected variant's ETag is a content hash, so
 * it varies with the file, a theme change (`site.yaml` theme, or an edited theme
 * CSS file — the file mtime alone would miss those), and a sidecar mode flip.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import fs from 'fs';
import path from 'path';
import crypto from 'node:crypto';
import { getPathsByCategory } from '@loaders/paths';
import { readArtifactThemeMode } from '@loaders/artifact-pages';
import { getTheme } from '@loaders/config';
import { getThemeCSS } from '@loaders/theme';

/** Only `.html` files (never dotfiles) are servable as artifacts. */
function isArtifact(filename: string): boolean {
  if (filename.startsWith('.')) return false;
  return /\.html$/i.test(filename);
}

/** Data dirs (absolute, alias-resolved at config load) of category 'content'. */
function getContentDirs(): string[] {
  return getPathsByCategory('content');
}

function getAllArtifactFiles(dirPath: string, basePath: string = ''): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dirPath)) return files;

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...getAllArtifactFiles(path.join(dirPath, entry.name), relativePath));
    } else if (entry.isFile() && isArtifact(entry.name)) {
      files.push(relativePath);
    }
  }
  return files;
}

/**
 * Attribute-only dark-mode init, mirroring `BaseLayout`'s inline script: read the
 * shared (same-origin) `localStorage.theme`, else the OS preference, and stamp
 * `data-theme="dark"` only when dark — nothing for light. The site's CSS reacts
 * to the attribute alone (no CSS reads `prefers-color-scheme`), so the full-page
 * artifact resolves its mode exactly like the docs chrome. In the embed this runs
 * first, then `scripts/artifacts.ts` propagates the parent's attribute over it.
 */
const DARK_MODE_INIT =
  `<script>(function(){try{var t=(typeof localStorage!=='undefined'&&localStorage.getItem('theme'))` +
  `?localStorage.getItem('theme')` +
  `:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');` +
  `if(t==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();</script>`;

/**
 * Inject the resolved host theme CSS + the dark-mode init into the served head.
 *
 * Insertion point is the START of `<head>` (right after the opening tag), not
 * before `</head>`. Two reasons: (1) robustness — an artifact's own content can
 * contain a literal `</head>` (a code sample, a prose reference), and a naive
 * `</head>` string match would land the block inside that content; the opening
 * `<head>` tag is matched once near the top and is far safer. (2) Cascade — theme
 * first means an artifact's own rules (later in the head) still win on their own
 * selectors while the theme supplies the token values. The function replacer keeps
 * `$`-sequences in the CSS literal. Fallbacks: before `</head>`, then prepend, for
 * the degenerate case of a document with no `<head>` open (an artifact owns a full
 * document, so this is only defensive).
 */
function injectSiteTheme(html: string, themeCss: string): string {
  const block =
    `<style id="artifact-site-theme">\n${themeCss}\n</style>\n${DARK_MODE_INIT}\n`;
  const openHead = /<head\b[^>]*>/i;
  if (openHead.test(html)) {
    return html.replace(openHead, (m) => `${m}\n${block}`);
  }
  if (/<\/head>/i.test(html)) {
    return html.replace(/<\/head>/i, () => `${block}</head>`);
  }
  return block + html;
}

export const getStaticPaths: GetStaticPaths = async () => {
  const seen = new Set<string>();
  const paths: { params: { path: string } }[] = [];

  for (const dir of getContentDirs()) {
    for (const file of getAllArtifactFiles(dir)) {
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
  if (!filePath || !isArtifact(path.basename(filePath))) {
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
  const lastModified = stat.mtime.toUTCString();

  // Sidecar-driven theme mode. `site` → rewrite to inherit the host theme;
  // `self` (or no sidecar) → serve the file's exact bytes (subtask-20 contract).
  // `injected` is the rewritten site-mode body, or null for self mode.
  const mode = readArtifactThemeMode(fullPath);
  const injected =
    mode === 'site' ? injectSiteTheme(fs.readFileSync(fullPath, 'utf-8'), getThemeCSS(getTheme())) : null;

  // Content-hash ETag for the injected variant (varies with the file, the resolved
  // theme — a theme change leaves the file mtime untouched — and a self↔site flip);
  // the exact size+mtime ETag for byte-identical self serving.
  const etag =
    injected !== null
      ? `"${crypto.createHash('sha1').update(injected).digest('hex').slice(0, 16)}"`
      : `"${stat.size}-${stat.mtimeMs}"`;

  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch === etag) {
    return new Response(null, { status: 304 });
  }

  const headers = {
    // `text/html` is scoped to THIS route only — deliberately not in
    // lib/mime.ts (see the header comment above).
    'Content-Type': 'text/html; charset=utf-8',
    // Dev: always revalidate (ETag → cheap 304) so edits show on plain
    // reload. The long immutable-style cache is for production only.
    'Cache-Control': import.meta.env.DEV ? 'no-cache' : 'public, max-age=31536000',
    ETag: etag,
    'Last-Modified': lastModified,
  };

  // Two concrete-typed branches (not a `string | Buffer` union): self serves the
  // Buffer verbatim exactly as the content-assets route does; site serves the string.
  if (injected !== null) {
    return new Response(injected, { status: 200, headers });
  }
  return new Response(fs.readFileSync(fullPath), {
    status: 200,
    headers,
  });
};
