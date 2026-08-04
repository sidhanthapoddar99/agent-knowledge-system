/**
 * Internal Links Postprocessor
 * Rewrites relative markdown links to match generated slugs:
 *   - Strips .md/.mdx extensions
 *   - Strips XX_ position prefixes from path segments
 *   - Preserves fragment identifiers (#section)
 *   - Emits the link's own relative shape unchanged — no depth adjustment
 *
 * Example: ./02_consensus-mechanism.md#overview → ./consensus-mechanism#overview
 *
 * DOCS ONLY. Blog and issues take the early branch below and get the extension
 * stripped and nothing else.
 *
 * WHY THERE IS NO DEPTH ADJUSTMENT HERE, since the absence is the design.
 * A page is emitted as `<slug>/index.html`, so a trailing-slash URL puts the
 * page's own name in the path and a sibling link resolves one level too deep.
 * A one-level shift was added for that on 2026-08-03 and removed on 2026-08-04:
 * the site's navigation links to the SAME page without the trailing slash, the
 * server answers both with 200 and no redirect, and the shift breaks that form
 * instead. It chose which half of the site to break.
 *
 * **No constant offset is correct in two environments differing by one URL
 * segment.** The real fix is to stop emitting a browser-relative href — resolve
 * internal links to root-absolute at render time (decided 2026-06-09,
 * `2026-06-09-issue-link-resolution` subtask 03). Until then this emits the
 * author's own shape, which is right for the URLs the navigation produces.
 *
 * DO NOT "FIX" A BROKEN LINK BY CONVERTING IT TO SITE-ABSOLUTE FORM in content.
 * That was done once to 341 links before anyone opened this file, and had to be
 * reverted: `agent-ks move` skips targets starting with `/`, so the absolute
 * form renders fine and silently leaves link maintenance forever.
 */

import path from 'node:path';
import type { Processor, ProcessContext } from '../types';
import { hasOrderPrefix, stripOrderPrefix } from '../core/order-prefix';
import { DIAGRAM_EXTENSIONS } from '../../loaders/diagram-pages';

/** Extensions without the dot, ready to drop into a character alternation. */
const DIAGRAM_ALT = DIAGRAM_EXTENSIONS.map((e) => e.slice(1)).join('|');

/** Every extension that names a PAGE in this framework — markdown and diagrams. */
const PAGE_EXT_RE = new RegExp(`\\.(mdx?|${DIAGRAM_ALT})($|#)`, 'i');
const PAGE_EXT_STRIP_RE = new RegExp(`\\.(mdx?|${DIAGRAM_ALT})$`, 'i');
const MARKDOWN_EXT_RE = /\.mdx?($|#)/i;

/**
 * A URI scheme — `mailto:`, `tel:`, `data:`, anything `scheme:`.
 *
 * `mailto:guide.md` ends in `.md`, so it satisfied the markdown test below and
 * came out rewritten as a page path (`../mailto:guide`). A relative path can
 * never carry a scheme, so this is a safe blanket skip rather than a mailto
 * special case.
 */
const URI_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Strip the NN_ ordering prefix (2–5 digits) from a single path segment
 */
function stripPrefix(segment: string): string {
  return stripOrderPrefix(segment);
}

/**
 * Is this a link to a first-class diagram PAGE, or to a colocated diagram ASSET?
 *
 * The same discriminator the loader uses: `diagram-pages.ts` publishes only
 * files carrying an `NN_` prefix, and never scans `assets/`. Without the prefix
 * the file is embed-only and belongs to `asset-src`, which resolves it against
 * the source directory rather than the page URL. Getting this backwards is what
 * the blanket non-markdown skip below did — it treated every `.mmd` as an asset,
 * so a link to a real diagram page was left unrewritten and 404'd.
 */
function isDiagramPageLink(pathPart: string): boolean {
  const last = pathPart.split('/').pop() ?? '';
  if (!DIAGRAM_EXTENSIONS.includes(path.posix.extname(last).toLowerCase())) return false;
  return hasOrderPrefix(last);
}

/**
 * Does this page's slug collapse onto its own source directory?
 *
 * Mirrors `DocsParser.generateSlug`, which strips the extension and then applies
 * `.replace(/\/index$/, '')`. The leading slash in that pattern matters: a
 * content-root-level `index.md` has no parent segment, so it is NOT collapsed
 * and is NOT exempt. Kept as a mirror of that one line rather than a guess about
 * it — if the slug rule changes, this has to change with it.
 */
function isIndexPage(context: ProcessContext): boolean {
  if (!context.basePath || !context.filePath) return false;
  const rel = path.relative(context.basePath, context.filePath).replace(/\\/g, '/');
  return /\/index$/.test(rel.replace(/\.(mdx|md)$/, ''));
}

/**
 * Rewrite a relative href to match the generated slug.
 *
 * `addLevel` prepends one `..` to compensate for the page's URL being one
 * segment deeper than its source directory. False only for index pages.
 */
function rewriteHref(href: string, addLevel: boolean): string {
  // `mailto:` and friends are not paths. Checked first, because such a target
  // can end in `.md` and would otherwise pass every test below.
  if (URI_SCHEME_RE.test(href)) return href;

  // Only process relative links (./  ../  or a bare filename naming a page file)
  if (!href.startsWith('./') && !href.startsWith('../') && !PAGE_EXT_RE.test(href)) {
    return href;
  }

  // Split off fragment (#section-id)
  const hashIndex = href.indexOf('#');
  let pathPart = hashIndex >= 0 ? href.slice(0, hashIndex) : href;
  const fragment = hashIndex >= 0 ? href.slice(hashIndex) : '';

  // A link to a colocated FILE (./assets/scene.excalidraw, ../img/x.png) is not
  // a page link — `asset-src` owns it, and resolves it against the source file's
  // directory on disk rather than against the page URL. Shifting it here would
  // send that resolution one directory too high, which is exactly what happened
  // the first time the level shift was added: the <img> came out right and the
  // <a> to the same file came out one level up. Anything with an extension that
  // is neither markdown nor a PREFIXED diagram belongs to another processor.
  if (/\.[a-z0-9]+($|#)/i.test(href) && !MARKDOWN_EXT_RE.test(href) && !isDiagramPageLink(pathPart)) {
    return href;
  }

  // Strip the page extension — markdown or diagram
  pathPart = pathPart.replace(PAGE_EXT_STRIP_RE, '');

  // Strip XX_ prefixes from each path segment (but not ./ or ../)
  pathPart = pathPart
    .split('/')
    .map(seg => (seg === '.' || seg === '..') ? seg : stripPrefix(seg))
    .join('/');

  // Remove /index suffix (index pages resolve to parent)
  pathPart = pathPart.replace(/\/index$/, '');

  // NO DEPTH SHIFT — removed 2026-08-04, and why it is not coming back in this
  // form is worth the paragraph.
  //
  // A `path.posix.join('..', pathPart)` stood here from 2026-08-03. It
  // compensated for the BUILT site serving a page as a directory with a trailing
  // slash, where the page's own name becomes a URL segment. That much is real.
  // But the site's own sidebar links to the form WITHOUT the slash, the server
  // answers both with 200 and no redirect, and on that form the extra `..` sends
  // every relative link one level too high. Reproduced in a browser.
  //
  // So the shift did not fix the bug — it chose which half of the site to break.
  // **A single constant offset cannot be correct in two environments that differ
  // by one URL segment**, and no value of that constant is right, including the
  // zero this now emits. Today's output is correct for the no-slash form the
  // navigation actually produces and wrong for a hand-typed trailing-slash URL.
  // That is the better half, not a solution.
  //
  // The fix is to stop emitting a browser-relative href at all: resolve internal
  // links to root-absolute at render time, decided 2026-06-09 in
  // `2026-06-09-issue-link-resolution` subtask 03. Then no base is involved and
  // the trailing slash stops mattering.
  //
  // `addLevel` is still computed and passed in deliberately — it encodes which
  // pages collapse onto their own directory (`index.md`), which the absolute
  // resolver needs as well. It is unused here on purpose.
  // EXPERIMENT 2026-08-04 — shift restored, paired with `trailingSlash: 'always'`.
  // With every environment serving the slash form, the page's own name IS a URL
  // segment everywhere, so one constant offset is finally correct everywhere.
  if (addLevel && pathPart) {
    pathPart = path.posix.join('..', pathPart);
  }

  return pathPart + fragment;
}

export const internalLinksPostprocessor: Processor = {
  name: 'internal-links',
  process(content: string, context: ProcessContext): string {
    // Only apply to docs content (blog doesn't use XX_ prefixes)
    if (context.contentType !== 'docs') {
      // For non-docs, still strip .md extensions
      return content.replace(
        /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
        (match, before, href, after) => {
          if (URI_SCHEME_RE.test(href)) return match;
          if (!href.match(/\.mdx?($|#)/)) return match;
          const newHref = href.replace(/\.(mdx|md)($|#)/, '$2');
          return `<a ${before}href="${newHref}"${after}>`;
        }
      );
    }

    const addLevel = !isIndexPage(context);

    return content.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*)>/gi,
      (match, before, href, after) => {
        // Skip absolute URLs, protocol links, and fragment-only links
        if (href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('/')) {
          return match;
        }

        const newHref = rewriteHref(href, addLevel);
        if (newHref === href) return match;

        return `<a ${before}href="${newHref}"${after}>`;
      }
    );
  },
};
