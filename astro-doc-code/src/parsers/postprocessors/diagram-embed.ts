/**
 * Diagram File Embed Postprocessor
 *
 * Markdown image syntax is the embed form for the two diagram formats that are
 * whole documents rather than text DSLs — `.excalidraw` scenes and `.drawio`
 * files:
 * `![Architecture](./assets/arch.drawio)` renders the canvas in place, while a
 * plain link `[Architecture](./assets/arch.drawio)` stays a link to the raw
 * file.
 *
 * (Mermaid and Graphviz need no processor here: they are fenced code blocks,
 * turned into containers by the markdown renderer.)
 *
 * This processor converts rendered `<img>` tags whose src ends in one of those
 * extensions into `.diagram-<kind>` placeholder divs carrying the served file
 * URL; `src/scripts/diagrams.ts` fetches the source client-side and renders
 * it. Runs BEFORE the asset-src postprocessor, so the src is still the
 * author-written relative path — resolved here both to an absolute path
 * (existence check) and to the served URL.
 */

import fs from 'fs';
import path from 'path';
import type { Processor, ProcessContext } from '../types';
import { addError } from '../../loaders/cache';
import { toAliasPath } from '../../loaders/paths';
import { resolveContentAssetUrl } from './asset-src';

/** Extension → container kind, and the label used in the error message. */
const EMBEDDABLE: Record<string, { kind: string; label: string }> = {
  '.excalidraw': { kind: 'excalidraw', label: 'Excalidraw' },
  '.drawio': { kind: 'drawio', label: 'draw.io' },
};

const SRC_PATTERN = new RegExp(
  `<img\\s+([^>]*?)src\\s*=\\s*["']([^"']+(?:${Object.keys(EMBEDDABLE)
    .map((e) => e.replace('.', '\\.'))
    .join('|')}))["']([^>]*)>`,
  'gi'
);

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Title fallback: "20_system-architecture.drawio" → "System Architecture" */
function titleFromFilename(src: string, ext: string): string {
  return path
    .basename(src, ext)
    .replace(/^\d{2,5}[_-]/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const diagramEmbedPostprocessor: Processor = {
  name: 'diagram-embed',
  process(content: string, context: ProcessContext): string {
    return content.replace(SRC_PATTERN, (match, before, src, after) => {
      const ext = path.extname(src).toLowerCase();
      const format = EMBEDDABLE[ext];
      if (!format) return match;

      const altMatch = `${before} ${after}`.match(/alt\s*=\s*["']([^"']*)["']/i);
      const title = altMatch?.[1] || titleFromFilename(src, ext);

      const url = resolveContentAssetUrl(src, context);
      if (!url) return match; // external / root-absolute / alias — leave alone

      const abs = path.resolve(context.fileDir, src);
      if (!fs.existsSync(abs)) {
        addError({
          file: toAliasPath(context.filePath),
          type: 'asset-missing',
          message: `${format.label} file not found: ${src}`,
          suggestion: 'Create the file or update the embed path',
        });
        return `<div class="diagram diagram-${format.kind} diagram-error">${format.label} file not found: ${escapeAttr(src)}</div>`;
      }

      // mtime version param: the URL changes when the diagram changes, so
      // long-lived browser/CDN caches bust automatically (static hosts
      // ignore the query string when resolving the file).
      const version = Math.floor(fs.statSync(abs).mtimeMs);
      return `<div class="diagram diagram-${format.kind}" data-src="${escapeAttr(`${url}?v=${version}`)}" data-title="${escapeAttr(title)}"></div>`;
    });
  },
};
