/**
 * Excalidraw Embed Postprocessor
 *
 * Markdown image syntax is the embed form for `.excalidraw` scenes:
 * `![Architecture](./assets/arch.excalidraw)` renders the canvas in place,
 * while a plain link `[Architecture](./assets/arch.excalidraw)` stays a link
 * to the raw file.
 *
 * This processor converts rendered `<img>` tags whose src ends in
 * `.excalidraw` into `.diagram-excalidraw` placeholder divs carrying the
 * served file URL; `src/scripts/diagrams.ts` fetches the scene client-side
 * and injects the exported SVG. Runs BEFORE the asset-src postprocessor, so
 * the src is still the author-written relative path — resolved here both to
 * an absolute path (existence check) and to the served URL.
 */

import fs from 'fs';
import path from 'path';
import type { Processor, ProcessContext } from '../types';
import { addError } from '../../loaders/cache';
import { toAliasPath } from '../../loaders/paths';
import { resolveContentAssetUrl } from './asset-src';

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Title fallback: "20_system-architecture.excalidraw" → "System Architecture" */
function titleFromFilename(src: string): string {
  return path
    .basename(src, '.excalidraw')
    .replace(/^\d{2,5}[_-]/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const excalidrawEmbedPostprocessor: Processor = {
  name: 'excalidraw-embed',
  process(content: string, context: ProcessContext): string {
    return content.replace(
      /<img\s+([^>]*?)src\s*=\s*["']([^"']+\.excalidraw)["']([^>]*)>/gi,
      (match, before, src, after) => {
        const altMatch = `${before} ${after}`.match(/alt\s*=\s*["']([^"']*)["']/i);
        const title = altMatch?.[1] || titleFromFilename(src);

        const url = resolveContentAssetUrl(src, context);
        if (!url) return match; // external / root-absolute / alias — leave alone

        const abs = path.resolve(context.fileDir, src);
        if (!fs.existsSync(abs)) {
          addError({
            file: toAliasPath(context.filePath),
            type: 'asset-missing',
            message: `Excalidraw file not found: ${src}`,
            suggestion: 'Create the file or update the embed path',
          });
          return `<div class="diagram diagram-excalidraw diagram-error">Excalidraw file not found: ${escapeAttr(src)}</div>`;
        }

        // mtime version param: the URL changes when the scene changes, so
        // long-lived browser/CDN caches bust automatically (static hosts
        // ignore the query string when resolving the file).
        const version = Math.floor(fs.statSync(abs).mtimeMs);
        return `<div class="diagram diagram-excalidraw" data-src="${escapeAttr(`${url}?v=${version}`)}" data-title="${escapeAttr(title)}"></div>`;
      }
    );
  },
};
