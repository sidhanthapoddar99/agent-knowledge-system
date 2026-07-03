/**
 * Docs Parser
 * Handles documentation content with XX_ prefix naming convention
 *
 * Features:
 * - Position extracted from XX_ filename prefix (e.g., 01_getting-started.md)
 * - Nested folder structure supported
 * - Assets relative to each file (./assets/code.py)
 * - Frontmatter: title, description, sidebar_label, sidebar_position, draft, tags
 */

import path from 'path';
import type { FileType, FrontmatterSchema, ParsedDocsFilename } from '../types';
import { BaseContentParser } from '../core/base-parser';
import { parseOrderPrefix } from '../core/order-prefix';
import { assetEmbedPreprocessor } from '../preprocessors/asset-embed';
import { headingIdsPostprocessor } from '../postprocessors/heading-ids';
import { internalLinksPostprocessor } from '../postprocessors/internal-links';
import { assetSrcPostprocessor } from '../postprocessors/asset-src';
import { excalidrawEmbedPostprocessor } from '../postprocessors/excalidraw-embed';
import { externalLinksPostprocessor } from '../postprocessors/external-links';
import { tableWrapPostprocessor } from '../postprocessors/table-wrap';

export class DocsParser extends BaseContentParser {
  constructor() {
    super('docs');

    // Configure pipeline for docs
    this.pipeline
      .addPreprocessor(assetEmbedPreprocessor)
      .addPostprocessor(headingIdsPostprocessor)
      .addPostprocessor(internalLinksPostprocessor)
      // ![x](./assets/y.excalidraw) → client-rendered diagram placeholder
      // (before asset-src: works on the author-written relative path)
      .addPostprocessor(excalidrawEmbedPostprocessor)
      // Relative <img src> → absolute /content-assets/… URLs (content folders
      // aren't served at any browser-relative position).
      .addPostprocessor(assetSrcPostprocessor)
      .addPostprocessor(externalLinksPostprocessor)
      .addPostprocessor(tableWrapPostprocessor);
  }

  /**
   * Parse filename to extract position from the NN_ prefix (2–5 digits).
   * e.g., "01_getting-started" → { position: 1, cleanName: "getting-started" }
   * Defers to the shared order-prefix grammar.
   */
  parseFilename(filename: string): ParsedDocsFilename {
    return parseOrderPrefix(filename);
  }

  /**
   * Resolve asset path relative to the document file
   * [[./assets/code.py]] → /path/to/doc/assets/code.py
   */
  getAssetPath(filePath: string, assetRelPath: string): string {
    const fileDir = path.dirname(filePath);
    return path.resolve(fileDir, assetRelPath);
  }

  /**
   * Get the frontmatter schema for docs
   */
  getFrontmatterSchema(): FrontmatterSchema {
    return {
      required: ['title'],
      optional: [
        'description',
        'sidebar_label',
        'sidebar_position',
        'draft',
        'tags',
      ],
    };
  }

  /**
   * Generate slug from relative path
   * Removes XX_ prefixes from all path segments for clean URLs
   */
  generateSlug(relativePath: string, fileType: FileType): string {
    // Get raw slug
    let slug = relativePath
      .replace(/\\/g, '/')
      .replace(/\.(mdx|md|yaml|yml|json)$/, '')
      .replace(/\/index$/, '');

    // Clean XX_ prefixes from all segments
    slug = slug
      .split('/')
      .map(segment => {
        const { cleanName } = this.parseFilename(segment);
        return cleanName;
      })
      .join('/');

    return slug;
  }
}

/**
 * Create a new docs parser instance
 */
export function createDocsParser(): DocsParser {
  return new DocsParser();
}
