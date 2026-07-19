/**
 * Shared type definitions for the parser system
 */

// ============================================
// Content Types
// ============================================

export type ContentType = 'docs' | 'blog' | 'page';
export type FileType = 'mdx' | 'md' | 'yaml' | 'json' | 'diagram' | 'artifact';

// ============================================
// Processing Context
// ============================================

export interface ProcessContext {
  /** Absolute path to the file being processed */
  filePath: string;
  /** Directory containing the file */
  fileDir: string;
  /** Type of content (docs, blog, page) */
  contentType: ContentType;
  /** Parsed frontmatter data */
  frontmatter: Record<string, unknown>;
  /** Base path for the content directory */
  basePath: string;
  /** Number of lines in frontmatter (including delimiters) for line number offset */
  frontmatterLineCount?: number;
}

// ============================================
// Processor Interface
// ============================================

export interface Processor {
  /** Unique name for the processor */
  name: string;
  /** Process content and return transformed content */
  process(content: string, context: ProcessContext): string | Promise<string>;
}

// ============================================
// Loaded Content
// ============================================

export interface Heading {
  depth: number;
  slug: string;
  text: string;
}

export interface LoadedContent {
  /** Unique identifier derived from slug */
  id: string;
  /** URL-friendly path */
  slug: string;
  /** Rendered HTML content */
  content: string;
  /** Extracted headings for outline/TOC */
  headings: Heading[];

  /** Frontmatter data */
  data: ContentData;

  /** Absolute file path */
  filePath: string;
  /** Relative path from base directory */
  relativePath: string;
  /** File type */
  fileType: FileType;
}

export interface ContentData {
  title: string;
  description?: string;
  sidebar_position?: number;
  sidebar_label?: string;
  date?: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
  image?: string;
  [key: string]: unknown;
}

// ============================================
// Load Options
// ============================================

export interface LoadOptions {
  /** Glob pattern for files */
  pattern?: string;
  /** Sorting method */
  sort?: 'position' | 'date' | 'title' | 'alphabetical';
  /** Sort order */
  order?: 'asc' | 'desc';
  /** Custom filter function */
  filter?: (content: LoadedContent) => boolean;
  /** Include draft content */
  includeDrafts?: boolean;
  /** Maximum directory depth */
  maxDepth?: number;
  /** Require XX_ prefix for position sorting */
  requirePositionPrefix?: boolean;
}

// ============================================
// Content Settings
// ============================================

export interface ContentSettings {
  sidebar?: {
    collapsed?: boolean;
    collapsible?: boolean;
    sort?: 'position' | 'alphabetical';
  };
  outline?: {
    enabled?: boolean;
    levels?: number[];
    title?: string;
  };
  pagination?: {
    enabled?: boolean;
    showPrevNext?: boolean;
  };
}

// ============================================
// Parsed Filename Results
// ============================================

export interface ParsedDocsFilename {
  /** Position extracted from XX_ prefix */
  position: number | null;
  /** Clean filename without prefix */
  cleanName: string;
}

export interface ParsedBlogFilename {
  /** Date extracted from filename (YYYY-MM-DD) */
  date: string | null;
  /** Slug portion after the date */
  slug: string;
}

// ============================================
// Frontmatter Schema
// ============================================

export interface FrontmatterSchema {
  required: string[];
  optional: string[];
}

// ============================================
// Error Types
// ============================================

export class ParserError extends Error {
  code: string;
  path: string;

  constructor({ code, path, message }: { code: string; path: string; message: string }) {
    super(message);
    this.name = 'ParserError';
    this.code = code;
    this.path = path;
  }
}
