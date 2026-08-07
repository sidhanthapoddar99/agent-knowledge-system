/**
 * Dev API Endpoint: Layouts
 *
 * Returns all available layouts per type with source info (builtin | external).
 * Only available in development mode.
 */

import type { APIRoute } from 'astro';

// Auto-discover all layouts using glob patterns (built-in + external)
const builtinDocsLayouts = import.meta.glob('/src/layouts/docs/styles/*/Layout.astro');
const extDocsLayouts = import.meta.glob('@ext-layouts/docs/styles/*/Layout.astro');

const builtinBlogLayouts = import.meta.glob('/src/layouts/blogs/styles/*/IndexLayout.astro');
const extBlogLayouts = import.meta.glob('@ext-layouts/blogs/styles/*/IndexLayout.astro');

const builtinCustomLayouts = import.meta.glob('/src/layouts/custom/styles/*/Layout.astro');
const extCustomLayouts = import.meta.glob('@ext-layouts/custom/styles/*/Layout.astro');

const builtinNavbarLayouts = import.meta.glob('/src/layouts/navbar/*/index.astro');
const extNavbarLayouts = import.meta.glob('@ext-layouts/navbar/*/index.astro');

const builtinFooterLayouts = import.meta.glob('/src/layouts/footer/*/index.astro');
const extFooterLayouts = import.meta.glob('@ext-layouts/footer/*/index.astro');

interface LayoutInfo {
  name: string;
  source: 'builtin' | 'external';
}

function extractStyles(
  builtin: Record<string, () => Promise<any>>,
  ext: Record<string, () => Promise<any>>,
  pattern: RegExp,
): LayoutInfo[] {
  const byName = new Map<string, 'builtin' | 'external'>();
  for (const p of Object.keys(builtin)) {
    const m = p.match(pattern);
    if (m) byName.set(m[1], 'builtin');
  }
  for (const p of Object.keys(ext)) {
    const m = p.match(pattern);
    if (m) byName.set(m[1], 'external');
  }
  return [...byName.entries()].map(([name, source]) => ({ name, source }));
}

export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const layouts = {
    docs: extractStyles(builtinDocsLayouts, extDocsLayouts, /\/styles\/([^/]+)\//),
    blog: extractStyles(builtinBlogLayouts, extBlogLayouts, /\/styles\/([^/]+)\//),
    custom: extractStyles(builtinCustomLayouts, extCustomLayouts, /\/styles\/([^/]+)\//),
    navbar: extractStyles(builtinNavbarLayouts, extNavbarLayouts, /\/navbar\/([^/]+)\//),
    footer: extractStyles(builtinFooterLayouts, extFooterLayouts, /\/footer\/([^/]+)\//),
  };

  return new Response(JSON.stringify(layouts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
};
