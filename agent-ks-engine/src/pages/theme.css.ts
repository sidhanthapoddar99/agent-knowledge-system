/**
 * `/theme.css` — the resolved theme stylesheet, served as a real stylesheet.
 *
 * The same CSS `BaseLayout` used to inline into every page. Inlining put an
 * identical 65 KB block in all 1,293 built pages — 80 MB of the 137 MB of
 * generated HTML, re-sent on every navigation because a `<style>` tag is part
 * of the document and cannot be cached on its own.
 *
 * Served from one URL, the browser fetches it once and reuses it for every
 * later page. The link stays in `<head>`, where a stylesheet is render-blocking,
 * so this does not trade the flash-free first paint for the saving.
 *
 * Cascade is unchanged. Themes are resolved and merged into a single string by
 * `getThemeCSS` (parent-then-child), and the `<link>` sits exactly where the
 * `<style>` did: after the font link, before Astro's bundled component CSS.
 * Stylesheets apply in document order regardless of which finishes loading
 * first, so the order the layouts depend on is preserved.
 *
 * The URL carries the theme name and a content hash (`themeCssHref`), so a
 * theme switch or a CSS edit is a different URL rather than a stale hit.
 */

import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { getThemeCSS, resolveThemeName } from '../loaders/theme';
import { getTheme } from '../loaders/config';

/** Short content hash used to bust the browser cache when the CSS changes. */
export function themeCssHash(css: string): string {
  return createHash('sha256').update(css).digest('hex').slice(0, 8);
}

/**
 * The `href` for the stylesheet link, given the CSS the page resolved.
 *
 * `theme` is carried as well as the hash because the dev theme picker switches
 * themes per request: two themes with different CSS already differ by hash, but
 * naming the theme keeps the URL readable when debugging which one is live.
 */
export function themeCssHref(css: string, themeRef: string): string {
  const name = themeRef.split(/[\\/]/).pop() || 'theme';
  return `/theme.css?t=${encodeURIComponent(name)}&v=${themeCssHash(css)}`;
}

/** Resolve the theme for this request — honouring the dev picker's cookie. */
function themeRefFor(cookies: { get(name: string): { value: string } | undefined }): string {
  if (import.meta.env.DEV) {
    const override = cookies.get('dev-color-theme');
    if (override?.value && override.value !== '__reset__') {
      return resolveThemeName(override.value);
    }
  }
  return getTheme();
}

export const GET: APIRoute = async ({ cookies }) => {
  const css = getThemeCSS(themeRefFor(cookies));
  return new Response(css, {
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      // Only reaches a browser in dev / SSR: a static build writes this out as
      // `dist/theme.css`, and the headers on a plain file are the host's to set.
      // The URL is content-hashed, so a hit is always the right bytes and can be
      // held indefinitely. In dev the picker swaps themes behind the same
      // cookie, so revalidate instead of trusting the URL.
      'Cache-Control': import.meta.env.DEV
        ? 'no-cache'
        : 'public, max-age=31536000, immutable',
    },
  });
};
