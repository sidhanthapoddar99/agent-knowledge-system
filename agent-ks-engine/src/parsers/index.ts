/**
 * Modular Parser System
 *
 * A flexible content parsing system with:
 * - Preprocessors: Run before markdown rendering (asset embedding, etc.)
 * - Renderers: Convert markdown to HTML
 * - Postprocessors: Run after HTML rendering (heading IDs, external links, etc.)
 * - Content-type parsers: Specialized logic for docs vs blogs
 */

// Types
export * from './types';

// Core
export {
  ProcessingPipeline,
  createPipeline,
  BaseContentParser,
} from './core';

// Preprocessors
export {
  createAssetEmbedPreprocessor,
  createBlogAssetResolver,
  assetEmbedPreprocessor,
  protectCodeBlocks,
  processInsideCodeBlocks,
  type AssetEmbedOptions,
  type ProtectedContent,
} from './preprocessors';

// Renderers
export {
  createMarkdownRenderer,
  createMarkdownRendererAsync,
  createMarkedInstance,
  renderMarkdown,
  defaultRenderer,
  type MarkdownRendererOptions,
} from './renderers';

// Content-type parsers
export {
  DocsParser,
  createDocsParser,
  BlogParser,
  createBlogParser,
} from './content-types';

// Postprocessors
export {
  createHeadingIdsPostprocessor,
  headingIdsPostprocessor,
  createExternalLinksPostprocessor,
  externalLinksPostprocessor,
  type ExternalLinksOptions,
} from './postprocessors';

// ============================================
// Parser Factory
// ============================================

import type { ContentType } from './types';
import { DocsParser } from './content-types/docs';
import { BlogParser } from './content-types/blog';
import { BaseContentParser } from './core/base-parser';

/**
 * Get a parser for a specific content type
 */
export function getParser(contentType: ContentType): BaseContentParser {
  switch (contentType) {
    case 'docs':
      return new DocsParser();
    case 'blog':
      return new BlogParser();
    case 'page':
      // Pages use the same parser as docs for now
      return new DocsParser();
    default:
      return new DocsParser();
  }
}

/**
 * Create a parser for a specific content type
 * Alias for getParser
 */
export const createParser = getParser;
