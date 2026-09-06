/**
 * Extract headings from rendered markdown HTML.
 *
 * `extractAndPrefixToc` rewrites heading IDs so multiple sub-docs can share
 * one DOM without clashing on `#setup` et al. — used for the Comprehensive
 * panel (many subtasks inline).
 *
 * `extractToc` leaves IDs untouched — used for standalone sub-doc pages
 * where each sub-doc is the only document in the DOM.
 */
export interface TocEntry {
  id: string;
  level: number;
  text: string;
}

export function extractAndPrefixToc(
  html: string,
  prefix: string,
): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  const out = html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_m, tag: string, attrs: string, text: string) => {
      const idMatch = /\bid="([^"]+)"/.exec(attrs);
      const rawId = idMatch ? idMatch[1] : '';
      if (!rawId) return `<h${tag}${attrs}>${text}</h${tag}>`;
      const newId = `${prefix}-${rawId}`;
      const newAttrs = attrs.replace(/\bid="[^"]+"/, `id="${newId}"`);
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      toc.push({ id: newId, level: parseInt(tag, 10), text: cleanText });
      return `<h${tag}${newAttrs}>${text}</h${tag}>`;
    },
  );
  return { html: out, toc };
}

export function extractToc(html: string): TocEntry[] {
  const toc: TocEntry[] = [];
  html.replace(
    /<h([1-6])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_m, tag: string, attrs: string, text: string) => {
      const idMatch = /\bid="([^"]+)"/.exec(attrs);
      if (!idMatch) return _m;
      const cleanText = text.replace(/<[^>]*>/g, '').trim();
      toc.push({ id: idMatch[1], level: parseInt(tag, 10), text: cleanText });
      return _m;
    },
  );
  return toc;
}
