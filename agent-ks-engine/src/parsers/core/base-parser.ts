/**
 * Base Content Parser
 * Abstract base class for content-type specific parsers
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';

import type {
  ContentType,
  FileType,
  LoadedContent,
  ContentData,
  ProcessContext,
  FrontmatterSchema,
  ParsedDocsFilename,
  ParsedBlogFilename,
  Heading,
} from '../types';
import { addWarning } from '../../loaders/cache';
import { hasOrderPrefix } from './order-prefix';
import { ProcessingPipeline } from './pipeline';
import { createMarkdownRendererAsync } from '../renderers/marked';

export abstract class BaseContentParser {
  protected pipeline: ProcessingPipeline;
  protected renderFn: ((content: string) => string) | null = null;
  protected renderReady: Promise<void>;
  protected contentType: ContentType;

  constructor(contentType: ContentType) {
    this.contentType = contentType;
    this.pipeline = new ProcessingPipeline();
    this.renderReady = createMarkdownRendererAsync().then((fn) => {
      this.renderFn = fn;
    });
  }

  /**
   * Extract headings from rendered HTML content
   * Parses <h1> through <h6> tags with id attributes
   */
  protected extractHeadings(html: string): Heading[] {
    const headings: Heading[] = [];
    const headingRegex = /<h([1-6])[^>]*\s+id=["']([^"']+)["'][^>]*>([\s\S]*?)<\/h\1>/gi;

    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      const depth = parseInt(match[1], 10);
      const slug = match[2];
      // Strip HTML tags from heading text
      const text = match[3].replace(/<[^>]+>/g, '').trim();

      if (slug && text) {
        headings.push({ depth, slug, text });
      }
    }

    return headings;
  }

  /**
   * Parse filename to extract metadata (position, date, etc.)
   */
  abstract parseFilename(filename: string): ParsedDocsFilename | ParsedBlogFilename;

  /**
   * Resolve asset path based on content type rules
   */
  abstract getAssetPath(filePath: string, assetRelPath: string): string;

  /**
   * Get the frontmatter schema for this content type
   */
  abstract getFrontmatterSchema(): FrontmatterSchema;

  /**
   * Generate slug from file path
   */
  abstract generateSlug(relativePath: string, fileType: FileType): string;

  /**
   * Get the processing pipeline
   */
  getPipeline(): ProcessingPipeline {
    return this.pipeline;
  }

  /**
   * Detect file type from extension
   */
  protected getFileType(filePath: string): FileType | null {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.mdx':
        return 'mdx';
      case '.md':
        return 'md';
      case '.yaml':
      case '.yml':
        return 'yaml';
      case '.json':
        return 'json';
      default:
        return null;
    }
  }

  /**
   * Parse a markdown file
   */
  protected async parseMarkdownFile(filePath: string, basePath: string): Promise<LoadedContent> {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content: rawContent } = matter(raw);
    const fileType = this.getFileType(filePath) as 'mdx' | 'md';
    const fileDir = path.dirname(filePath);
    const relativePath = path.relative(basePath, filePath);

    // Report missing required fields. Every parser declared a schema and nothing
    // ever checked one — see `validateFrontmatter` for why this warns rather
    // than throws.
    this.validateFrontmatter(frontmatter, relativePath);

    // Calculate frontmatter line count for accurate error line numbers
    // Frontmatter is between --- delimiters, so we count lines before rawContent starts
    const frontmatterLineCount = raw.indexOf(rawContent) > 0
      ? raw.slice(0, raw.indexOf(rawContent)).split('\n').length - 1
      : 0;

    // Create processing context. `embeddedFiles` is the sink processors report
    // inlined files into, so the loaders can treat them as cache dependencies
    // of this page (see ProcessContext).
    const embeddedFiles = new Set<string>();
    const context: ProcessContext = {
      filePath,
      fileDir,
      contentType: this.contentType,
      frontmatter,
      basePath,
      frontmatterLineCount,
      embeddedFiles,
    };

    // Ensure highlighter is ready
    await this.renderReady;

    // Process through pipeline
    const content = await this.pipeline.process(rawContent, context, this.renderFn!);

    // Extract headings from rendered HTML for outline/TOC
    const headings = this.extractHeadings(content);

    // Generate slug and ID
    const slug = this.generateSlug(relativePath, fileType);
    const id = slug.replace(/\//g, '-') || 'index';

    // Extract metadata from filename
    const filename = path.basename(filePath, path.extname(filePath));
    const parsedFilename = this.parseFilename(filename);

    // Build content data
    const contentData = this.buildContentData(frontmatter, parsedFilename);

    return {
      id,
      slug,
      content,
      headings,
      data: contentData,
      filePath,
      relativePath,
      fileType,
      ...(embeddedFiles.size > 0 ? { embeddedFiles: [...embeddedFiles] } : {}),
    };
  }

  /**
   * Build content data from frontmatter and parsed filename
   */
  protected buildContentData(
    frontmatter: Record<string, unknown>,
    parsedFilename: ParsedDocsFilename | ParsedBlogFilename
  ): ContentData {
    const title = (frontmatter.title as string) || 'Untitled';

    // Base content data
    const data: ContentData = {
      title,
      ...frontmatter,
    };

    // Add position from filename if not in frontmatter (docs)
    if ('position' in parsedFilename && parsedFilename.position !== null) {
      if (data.sidebar_position === undefined) {
        data.sidebar_position = parsedFilename.position;
      }
    }

    // Add date from filename if not in frontmatter (blog)
    if ('date' in parsedFilename && parsedFilename.date !== null) {
      if (data.date === undefined) {
        data.date = parsedFilename.date;
      }
    }

    return data;
  }

  /**
   * Parse a YAML file
   */
  protected parseYamlFile(filePath: string, basePath: string): LoadedContent {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = yaml.load(raw) as Record<string, unknown>;
    const relativePath = path.relative(basePath, filePath);
    const slug = this.generateSlug(relativePath, 'yaml');

    return {
      id: slug.replace(/\//g, '-'),
      slug,
      content: '',
      headings: [],
      data: {
        title: (data.title as string) || path.basename(filePath, path.extname(filePath)),
        ...data,
      },
      filePath,
      relativePath,
      fileType: 'yaml',
    };
  }

  /**
   * Parse a JSON file
   */
  protected parseJsonFile(filePath: string, basePath: string): LoadedContent {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw) as Record<string, unknown>;
    const relativePath = path.relative(basePath, filePath);
    const slug = this.generateSlug(relativePath, 'json');

    return {
      id: slug.replace(/\//g, '-'),
      slug,
      content: '',
      headings: [],
      data: {
        title: (data.title as string) || path.basename(filePath, '.json'),
        ...data,
      },
      filePath,
      relativePath,
      fileType: 'json',
    };
  }

  /**
   * Parse a file based on its type
   */
  async parse(filePath: string, basePath: string): Promise<LoadedContent | null> {
    const fileType = this.getFileType(filePath);

    switch (fileType) {
      case 'mdx':
      case 'md':
        return this.parseMarkdownFile(filePath, basePath);
      case 'yaml':
        return this.parseYamlFile(filePath, basePath);
      case 'json':
        // Skip settings.json / settings.jsonc files
        if (path.basename(filePath) === 'settings.json' || path.basename(filePath) === 'settings.jsonc') {
          return null;
        }
        return this.parseJsonFile(filePath, basePath);
      default:
        return null;
    }
  }

  /**
   * Check if file has required position prefix
   */
  hasPositionPrefix(filename: string): boolean {
    return hasOrderPrefix(filename);
  }

  /**
   * Check frontmatter against this content type's schema and REPORT what is
   * missing. Called from `parseMarkdownFile`.
   *
   * Reports rather than throws, deliberately. The rule it enforces — every doc
   * file declares a `title` — is real, but a missing title is a content mistake
   * in somebody's markdown, and stopping their whole build over one page is out
   * of proportion. The engine reserves hard stops for configuration it cannot
   * proceed without, such as the engine-version gate.
   *
   * Reporting is not the same as staying silent, which is what happened before:
   * this method existed on every parser and was called from nowhere, so the
   * documented rule was enforced by nothing. A page with no title silently
   * shipped titled after its own filename — `_my-file` — which looks deliberate
   * and is very hard to notice.
   *
   * Warnings land in the shared content-warning channel, so they surface in the
   * dev toolbar's error panel and in the build log.
   */
  validateFrontmatter(frontmatter: Record<string, unknown>, filePath: string): void {
    const schema = this.getFrontmatterSchema();

    for (const field of schema.required) {
      if (field in frontmatter) continue;
      addWarning({
        file: filePath,
        type: 'config',
        message: `Missing required frontmatter field "${field}"`,
        suggestion:
          `Add "${field}:" to the frontmatter. The page still renders, but ` +
          `"${field}" falls back to a value derived from the filename.`,
      });
      // `addWarning` only fills the dev toolbar's in-memory panel, which does
      // not exist during a build — so a build would report nothing at all.
      // Printing as well matches how the asset-embed preprocessor surfaces the
      // same class of authoring problem.
      console.warn(`[frontmatter] ${filePath} - missing required field "${field}"`);
    }
  }
}
