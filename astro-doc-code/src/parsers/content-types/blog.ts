/**
 * Blog Parser
 * Handles blog content with YYYY-MM-DD-name naming convention
 *
 * Features:
 * - Date extracted from filename (e.g., 2024-01-15-hello-world.md)
 * - Flat structure (no nested folders)
 * - Assets in central folder: assets/<filename>/image.jpg
 * - [[cover.jpg]] auto-resolves to assets/2024-01-15-hello-world/cover.jpg
 * - Frontmatter: title, description, date, author, tags, draft, image
 */

import path from 'path';
import type { FileType, FrontmatterSchema, ParsedBlogFilename } from '../types';
import { BaseContentParser } from '../core/base-parser';
import { createAssetEmbedPreprocessor, createBlogAssetResolver } from '../preprocessors/asset-embed';
import { headingIdsPostprocessor } from '../postprocessors/heading-ids';
import { internalLinksPostprocessor } from '../postprocessors/internal-links';
import { assetSrcPostprocessor } from '../postprocessors/asset-src';
import { excalidrawEmbedPostprocessor } from '../postprocessors/excalidraw-embed';
import { externalLinksPostprocessor } from '../postprocessors/external-links';
import { tableWrapPostprocessor } from '../postprocessors/table-wrap';

export class BlogParser extends BaseContentParser {
  constructor() {
    super('blog');

    // Configure pipeline for blog with custom asset resolver
    const blogAssetPreprocessor = createAssetEmbedPreprocessor({
      resolvePath: createBlogAssetResolver(),
    });

    this.pipeline
      .addPreprocessor(blogAssetPreprocessor)
      .addPostprocessor(headingIdsPostprocessor)
      .addPostprocessor(internalLinksPostprocessor)
      // ![x](./assets/y.excalidraw) → client-rendered diagram placeholder
      .addPostprocessor(excalidrawEmbedPostprocessor)
      // Relative <img src> → absolute /content-assets/… URLs.
      .addPostprocessor(assetSrcPostprocessor)
      .addPostprocessor(externalLinksPostprocessor)
      .addPostprocessor(tableWrapPostprocessor);
  }

  /**
   * Parse filename to extract date from YYYY-MM-DD prefix
   * e.g., "2024-01-15-hello-world" → { date: "2024-01-15", slug: "hello-world" }
   */
  parseFilename(filename: string): ParsedBlogFilename {
    const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
    if (match) {
      return {
        date: match[1],
        slug: match[2],
      };
    }
    return {
      date: null,
      slug: filename,
    };
  }

  /**
   * Resolve asset path using blog convention
   * [[cover.jpg]] → assets/<filename>/cover.jpg
   * [[./relative/path.jpg]] → resolved relative to file
   */
  getAssetPath(filePath: string, assetRelPath: string): string {
    const blogDir = path.dirname(filePath);
    const filename = path.basename(filePath, path.extname(filePath));

    // If path already starts with ./ or ../, use default resolution
    if (assetRelPath.startsWith('./') || assetRelPath.startsWith('../')) {
      return path.resolve(blogDir, assetRelPath);
    }

    // Otherwise, resolve to assets/<filename>/<assetPath>
    return path.join(blogDir, 'assets', filename, assetRelPath);
  }

  /**
   * Get the frontmatter schema for blog posts
   */
  getFrontmatterSchema(): FrontmatterSchema {
    return {
      required: ['title'],
      optional: [
        'description',
        'date',
        'author',
        'tags',
        'draft',
        'image',
      ],
    };
  }

  /**
   * Generate slug from relative path
   * For blogs, this is typically just the filename without date prefix
   */
  generateSlug(relativePath: string, fileType: FileType): string {
    // Get raw slug
    let slug = relativePath
      .replace(/\\/g, '/')
      .replace(/\.(mdx|md|yaml|yml|json)$/, '');

    // For blog posts, the slug is typically the part after the date
    const filename = path.basename(slug);
    const { slug: cleanSlug } = this.parseFilename(filename);

    // If there's a directory structure, keep it but clean the filename
    const dir = path.dirname(slug);
    if (dir && dir !== '.') {
      return `${dir}/${cleanSlug}`;
    }

    return cleanSlug;
  }
}

/**
 * Create a new blog parser instance
 */
export function createBlogParser(): BlogParser {
  return new BlogParser();
}
